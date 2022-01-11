/* global THREE */
const planeSize = 10;
const gridSize = 10;
const gridDivisions = 10;
const positionStep = 0.5;
const GAME_OVER_SOUND = "GameOver";
const PICKUP_BALL_SOUND = "pickup";

let dequeue = new Deque();
let pressedKeyCode;

const snakeParts = dequeue.getValues();

// * Initialize webGL
const canvas = document.getElementById("myCanvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setClearColor("#dfe7fd");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  canvas.width / canvas.height,
  0.1,
  100
);
camera.position.set(7, -7, 18);
scene.add(camera);

camera.lookAt(scene.position);

// Vars for rotating camera
const angularVelocity = Math.PI;
const radiusCamera = 7;
const distanceFromSphere = 0.6;

//helping functions
document.addEventListener("keydown", snakeHandler);

function moveSnake(key) {
  let x = dequeue.getFront().position.x;
  let y = dequeue.getFront().position.y;
  let head = dequeue.removeFront();
  let tail;

  if (dequeue.getBack() !== null) {
    tail = dequeue.removeBack();
    tail.position.y = y;
    tail.position.x = x;
    dequeue.insertFront(tail);
  }

  switch (key) {
    case 37:
      head.position.x -= 1;
      break;
    case 38:
      head.position.y += 1;
      break;
    case 39:
      head.position.x += 1;
      break;
    case 40:
      head.position.y -= 1;
      break;
  }
  dequeue.insertFront(head);
}

function snakeHandler(event) {
  pressedKeyCode = event.keyCode;
  if (event.keyCode == 37) {
    moveSnake(event.keyCode);
    const mLeft = setInterval(function () {
      if (pressedKeyCode == 37) {
        moveSnake(event.keyCode);
      } else clearInterval(mLeft);
    }, 250);
  }
  if (event.keyCode == 38) {
    moveSnake(event.keyCode);
    const mUp = setInterval(function () {
      if (pressedKeyCode == 38) {
        moveSnake(event.keyCode);
      } else clearInterval(mUp);
    }, 250);
  } else if (event.keyCode == 39) {
    moveSnake(event.keyCode);
    const mRight = setInterval(function () {
      if (pressedKeyCode == 39) {
        moveSnake(event.keyCode);
      } else clearInterval(mRight);
    }, 250);
  } else if (event.keyCode == 40) {
    moveSnake(event.keyCode);
    const mdown = setInterval(function () {
      if (pressedKeyCode == 40) {
        moveSnake(event.keyCode);
      } else clearInterval(mdown);
    }, 250);
  } else return;
  pressedKeyCode = event.keyCode;
}

//generates location for the ball and the head of snake
const generateRandomLocation = () =>
  Math.floor(
    Math.random() * (gridDivisions / 2 - -gridDivisions / 2) +
      -gridDivisions / 2
  );

/*Visual content of the game starts*/
//Plane & Grid
const plane = new THREE.PlaneGeometry(planeSize, planeSize);
const material = new THREE.MeshBasicMaterial({
  color: "#001524",
  side: THREE.DoubleSide,
});
const gameField = new THREE.Mesh(plane, material);
scene.add(gameField);

const gridHelper = new THREE.GridHelper(
  gridSize,
  gridDivisions,
  "#004472",
  "#004472"
);
gridHelper.rotation.x = Math.PI / 2;
scene.add(gridHelper);

//Snake visuals
function generateSnakePart() {
  const snakeBuildBlock = 0.95;
  const colorHead = "#06d6a0";
  const colorTail = "#118ab2";

  let x = 0;
  let y = 0;
  let colorPart;

  if (dequeue.getValues().length === 0) {
    x = generateRandomLocation() + positionStep;
    y = generateRandomLocation() + positionStep;
    colorPart = colorHead;
  } else if (pressedKeyCode == 37) {
    x = dequeue.getFront().position.x + 1;
    y = dequeue.getFront().position.y;
    colorPart = colorTail;
  } else if (pressedKeyCode == 38) {
    x = dequeue.getFront().position.x;
    y = dequeue.getFront().position.y - 1;
    colorPart = colorTail;
  } else if (pressedKeyCode == 39) {
    x = dequeue.getFront().position.x - 1;
    y = dequeue.getFront().position.y;
    colorPart = colorTail;
  } else if (pressedKeyCode == 40) {
    x = dequeue.getFront().position.x;
    y = dequeue.getFront().position.y + 1;
    colorPart = colorTail;
  }

  const geoCube = new THREE.BoxGeometry(
    snakeBuildBlock,
    snakeBuildBlock,
    snakeBuildBlock
  );
  const snakeMaterial = new THREE.MeshBasicMaterial({ color: colorPart });
  const snakePart = new THREE.Mesh(geoCube, snakeMaterial);

  snakePart.position.set(x, y, positionStep);

  dequeue.insertBack(snakePart);
  scene.add(snakePart);
  return snakePart;
}

const geoBall = new THREE.SphereGeometry(positionStep);
const ballMaterial = new THREE.MeshBasicMaterial({ color: "#ff2a42" });

//Ball visual
function generateBall() {
  const ballPart = new THREE.Mesh(geoBall, ballMaterial);

  let x = generateRandomLocation();
  let y = generateRandomLocation();

  for (let i = 1; i < snakeParts.length; i++) {
    while (snakeParts[i].position.x == x + positionStep && snakeParts[i].position.y == y + positionStep) {
      x = generateRandomLocation();
      y = generateRandomLocation();
    }
  }

  ballPart.position.set(x + positionStep, y + positionStep, positionStep);
  scene.add(ballPart);

  return ballPart;
}

const ball = generateBall();

function pickupBall() {
  if (
    dequeue.getFront().position.x == ball.position.x &&
    dequeue.getFront().position.y == ball.position.y
  ) {
    generateSnakePart();
  
    let x = generateRandomLocation();
    let y = generateRandomLocation();
    let sParts = dequeue.getValues();
    for (let i = 0; i < sParts.length; i++) {
      
      if (sParts[i] !== null) {
        while (sParts[i].position.x == x + positionStep && sParts[i].position.y == y + positionStep) {
          x = generateRandomLocation();
          y = generateRandomLocation();
        }
      }
    }
    ball.position.set(x + positionStep, y + positionStep, positionStep);

    generateSound(PICKUP_BALL_SOUND);
  }
}

const generateSound = (soundType) => {
  let soundSource;
  const listener = new THREE.AudioListener();
  camera.add(listener);

  const newSound = new THREE.PositionalAudio(listener);
  const audioLoader = new THREE.AudioLoader();
  if (soundType == GAME_OVER_SOUND) {
    soundSource = "sound1.wav";
  } else if (soundType == PICKUP_BALL_SOUND) {
    soundSource = "sound2.wav";
  }
  audioLoader.load(soundSource, function (buffer) {
    newSound.setBuffer(buffer);
    newSound.setRefDistance(20);
    newSound.play();
  });

  ball.add(newSound);
};

const detectGOver = () => {
  let snake = dequeue.getValues();
  let headX = dequeue.getFront().position.x;
  let headY = dequeue.getFront().position.y;

  //check if snake hits itself
  for (let i = 1; i < snake.length; i++) {
    if (headX == snake[i].position.x && headY == snake[i].position.y) {
      return true;
    }
  }

  //check if snake hits borders
  if (
    headX >= gridDivisions / 2 + positionStep ||
    headX <= -gridDivisions / 2 - positionStep ||
    headY >= gridDivisions / 2 + positionStep ||
    headY <= -gridDivisions / 2 - positionStep
  ) {
    return true;
  }
};

function restartGame() {
  let score = dequeue.size() - 1;
  let snake = dequeue.getValues();

  if (detectGOver()) {
    generateSound(GAME_OVER_SOUND);
    for (const part of snake) {
      scene.remove(part);
    }
    dequeue.clear();
    pressedKeyCode = 0;
    camera.position.set(7, -7, 18);
    setTimeout(function () {
      alert("Game over! You score is " + score);
    }, 200);
    const snakeHead = generateSnakePart();
  }
}

generateSnakePart();

// * Render loop
const controls = new THREE.TrackballControls(camera, renderer.domElement);
const clock = new THREE.Clock();

function render() {
  requestAnimationFrame(render);

  const h = clock.getDelta();
  const t = clock.getElapsedTime();

  pickupBall();
  restartGame();

  const cameraPosition = new THREE.Vector3(
    -Math.sin(angularVelocity * t),
    Math.cos(angularVelocity * t),
    0
  ).multiplyScalar(radiusCamera * angularVelocity * distanceFromSphere);
  camera.position.add(cameraPosition.multiplyScalar(h));

  renderer.render(scene, camera);
  controls.update();
}
render();

// * Deque: https://learnersbucket.com/tutorials/data-structures/implement-deque-data-structure-in-javascript/
function Deque() {
  //To track the elements from back
  let count = 0;

  //To track the elements from the front
  let lowestCount = 0;

  //To store the data
  let items = {};
  this.getValues = () => {
    return Object.values(items);
  };

  //Add an item on the front
  this.insertFront = (elm) => {
    if (this.isEmpty()) {
      //If empty then add on the back
      this.insertBack(elm);
    } else if (lowestCount > 0) {
      //Else if there is item on the back
      //then add to its front
      items[--lowestCount] = elm;
    } else {
      //Else shift the existing items
      //and add the new to the front
      for (let i = count; i > 0; i--) {
        items[i] = items[i - 1];
      }

      count++;
      items[0] = elm;
    }
  };

  //Add an item on the back of the list
  this.insertBack = (elm) => {
    items[count++] = elm;
  };

  //Remove the item from the front
  this.removeFront = () => {
    //if empty return null
    if (this.isEmpty()) {
      return null;
    }

    //Get the first item and return it
    const result = items[lowestCount];
    delete items[lowestCount];
    lowestCount++;
    return result;
  };

  //Remove the item from the back
  this.removeBack = () => {
    //if empty return null
    if (this.isEmpty()) {
      return null;
    }

    //Get the last item and return it
    count--;
    const result = items[count];
    delete items[count];
    return result;
  };

  //Peek the first element
  this.getFront = () => {
    //If empty then return null
    if (this.isEmpty()) {
      return null;
    }

    //Return first element
    return items[lowestCount];
  };

  //Peek the last element
  this.getBack = () => {
    //If empty then return null
    if (this.isEmpty()) {
      return null;
    }

    //Return first element
    return items[count - 1];
  };

  //Check if empty
  this.isEmpty = () => {
    return this.size() === 0;
  };

  //Get the size
  this.size = () => {
    return count - lowestCount;
  };

  //Clear the dequeue
  this.clear = () => {
    count = 0;
    lowestCount = 0;
    items = {};
  };

  //Convert to the string
  //From front to back
  this.toString = () => {
    if (this.isEmpty()) {
      return "";
    }
    let objString = `${items[lowestCount]}`;
    for (let i = lowestCount + 1; i < count; i++) {
      objString = `${objString},${items[i]}`;
    }
    return objString;
  };
}
