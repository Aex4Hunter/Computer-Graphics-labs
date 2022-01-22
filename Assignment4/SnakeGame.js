/* global THREE */

// Playground sizes 
const scenePlaneSize = 200;

const planeSize = 12;
const gridSize = 12;
const gridDivisions = 12;
const positionStep = 0.5;

const boardW = 0.1;
const boardH = 4;
const boardL = 10;
const poleW = 0.3;
const poleH = 0.3;
const poleL = 4;
const poleOffset = 0.3;
const boardPartL = 0.4;
const boardPartS = 0.6;

const displayPlaneLW = boardL - boardL * boardPartL;
const displayPlaneLH = boardH;
const displayPlaneSW = boardL - boardL * boardPartS;
const displayPlaneSH = boardH / 2;

const GAME_OVER_SOUND = "GameOver";
const PICKUP_BALL_SOUND = "pickup";
const WALL_TOP = "Top";
const WALL_LEFT = "Left";
const WALL_RIGHT = "Right";
const WALL_BTM = "Bottom";

// Colors
const wallColor = "#00ff00";
const playfieldColor = "#001524";
const gridColor = "#004472";
const colorHead = "#06d6a0";
const colorTail = "#118ab2";
const ballColor = "#ff2a42";
const scenePlaneColor = "#fbfafb";
const boardColor = "#222222"

const lightsourcePositionZ = 16;
const lightsourcePositionY = 42;

let dequeue = new Deque();
let pressedKeyCode;

const snakeParts = dequeue.getValues();

// * Initialize webGL
const canvas = document.getElementById("myCanvas");
const renderer = new THREE.WebGLRenderer({canvas,
                                          antialias: true});
renderer.setClearColor('rgb(255,255,255)');
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0,-18, 12);
scene.add(camera);

camera.lookAt(scene.position);
// remove in final version:
scene.add(new THREE.AxesHelper(2.5));

/* Lightning */
const ambLight = new THREE.PointLight();
scene.add(ambLight);
scene.add(new THREE.AmbientLight(0x606060));

const spotLight = new THREE.SpotLight(0xffffff);
spotLight.castShadow = true;
spotLight.position.z = lightsourcePositionZ;
spotLight.position.y = lightsourcePositionY;
scene.add(spotLight);

window.addEventListener("resize", function() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
});

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
const material = new THREE.MeshStandardMaterial({
  color: playfieldColor,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.9,
});
const gameField = new THREE.Mesh(plane, material);
gameField.receiveShadow = true;

scene.add(gameField);

const gridHelper = new THREE.GridHelper(
  gridSize,
  gridDivisions,
  gridColor,
  gridColor
);
gridHelper.rotation.x = Math.PI / 2;
scene.add(gridHelper);

const scenePlane = new THREE.PlaneGeometry(scenePlaneSize, scenePlaneSize);
const scenePlaneMat = new THREE.MeshStandardMaterial({
  color: scenePlaneColor,
});
const scenePlayground = new THREE.Mesh(scenePlane, scenePlaneMat);
scenePlayground.receiveShadow = true;
scenePlayground.position.z = -0.001;
scene.add(scenePlayground);

const wallL = planeSize + positionStep*2;
const wallW = positionStep*2;
const wallH = positionStep*2;
//Room
const wallGeo = new THREE.BoxGeometry(wallW, planeSize + positionStep*2, wallH);
const wallMat = new THREE.MeshStandardMaterial({color: wallColor});

function buidWalls(side) {
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.castShadow = true;
  wall.receiveShadow = true;  
  switch(side) {
    case WALL_TOP:
      wall.position.set(positionStep,planeSize / 2+positionStep,positionStep);
      wall.rotation.set(0,0,Math.PI /2);
      break;
    case WALL_RIGHT:
      wall.position.set(planeSize / 2+positionStep,-positionStep,positionStep);
      break;
    case WALL_LEFT:
      wall.position.set(-planeSize / 2-positionStep,positionStep,positionStep);
      break;
    case WALL_BTM:
      wall.position.set(-positionStep,-planeSize / 2-positionStep,positionStep);
      wall.rotation.set(0,0,Math.PI /2);
      break;
    default:
      break;        
  }
  gameField.add(wall);
}
buidWalls(WALL_TOP);
buidWalls(WALL_RIGHT);
buidWalls(WALL_LEFT);
buidWalls(WALL_BTM);

//screen

// Board & poles
const poleGeo = new THREE.BoxGeometry(poleW, poleH,poleL);
const boardMat = new THREE.MeshStandardMaterial({color: boardColor});

const boardGeo = new THREE.BoxGeometry(boardL, boardW, boardH);
const board = new THREE.Mesh(boardGeo, boardMat);
board.castShadow = true;
board.position.set(0, planeSize/2 +wallW, poleL);
scene.add(board);

const poleLeft = new THREE.Mesh(poleGeo, boardMat);
poleLeft.castShadow = true;
poleLeft.position.set(-boardL/2 + poleOffset, planeSize/2 + poleW/2 +wallW, poleL/2);
scene.add(poleLeft);

const poleRight = new THREE.Mesh(poleGeo, boardMat);
poleRight.castShadow = true;
poleRight.position.set(boardL/2 - poleOffset, planeSize/2 +poleW/2 + wallW, poleL/2);
scene.add(poleRight);

// Display parts
const displayOffset = 0.1;
const displayPlaneL = new THREE.PlaneGeometry(displayPlaneLW, displayPlaneLH);
const displayPlaneS = new THREE.PlaneGeometry(displayPlaneSW, displayPlaneSH);
const displayMat = new THREE.MeshStandardMaterial({
  color: 'white',
  side: THREE.DoubleSide,
});

const displayL = new THREE.Mesh(displayPlaneL, displayMat);
displayL.receiveShadow = true;
displayL.rotation.x = Math.PI / 2;
displayL.position.set(-boardL/2 + displayPlaneLW/2, -displayOffset, 0);
board.add(displayL);

const displaySTop = new THREE.Mesh(displayPlaneS, displayMat);
displaySTop.receiveShadow = true;
displaySTop.rotation.x = Math.PI / 2;
displaySTop.position.set(boardL/2 - displayPlaneSW/2, -displayOffset, displayPlaneSH/2);
board.add(displaySTop);

const displaySBtm = new THREE.Mesh(displayPlaneS, displayMat);
displaySBtm.receiveShadow = true;
displaySBtm.rotation.x = Math.PI / 2;
displaySBtm.position.set(boardL/2 - displayPlaneSW/2, -displayOffset, -displayPlaneSH/2);
board.add(displaySBtm);

//Snake
function generateSnakePart() {
  const snakeBuildBlock = 0.95;

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
  const snakeMaterial = new THREE.MeshStandardMaterial({ color: colorPart });
  const snakePart = new THREE.Mesh(geoCube, snakeMaterial);
  snakePart.castShadow = true;

  snakePart.position.set(x, y, positionStep);

  dequeue.insertBack(snakePart);
  scene.add(snakePart);
  return snakePart;
}

const geoBall = new THREE.SphereGeometry(positionStep);
const ballMaterial = new THREE.MeshStandardMaterial({ color: ballColor });

//Ball visual
function generateBall() {
  const ballPart = new THREE.Mesh(geoBall, ballMaterial);
  ballPart.castShadow = true;

  let x = generateRandomLocation();
  let y = generateRandomLocation();

  for (let i = 1; i < snakeParts.length; i++) {
    while (
      snakeParts[i].position.x == x + positionStep &&
      snakeParts[i].position.y == y + positionStep
    ) {
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
        while (
          sParts[i].position.x == x + positionStep &&
          sParts[i].position.y == y + positionStep
        ) {
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
  //  soundSource = "./resources/sound1.wav";
  } else if (soundType == PICKUP_BALL_SOUND) {
  //  soundSource = "./resources/sound2.wav";
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
    setTimeout(function () {
      alert("Game over! You score is " + score);
    }, 200);
    generateSnakePart();
  }
}

generateSnakePart();


// * Render loop
const controls = new THREE.TrackballControls(camera, renderer.domElement);
const clock = new THREE.Clock();

function render() {
  requestAnimationFrame(render);
  pickupBall();
  restartGame();

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
  this.getValues = () => {return Object.values(items);};

  //Add an item on the front
  this.insertFront = (elm) => {

    if(this.isEmpty()){
      //If empty then add on the back
      this.insertBack(elm);

    }else if(lowestCount > 0){
      //Else if there is item on the back
      //then add to its front
      items[--lowestCount] = elm;

    }else{
      //Else shift the existing items
      //and add the new to the front
      for(let i = count; i > 0; i--){
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
    if(this.isEmpty()){
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
    if(this.isEmpty()){
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
    if(this.isEmpty()){
      return null;
    }

    //Return first element
    return items[lowestCount];
  };

  //Peek the last element
  this.getBack = () => {
    //If empty then return null
    if(this.isEmpty()){
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

  //Clear the deque
  this.clear = () => {
    count = 0;
    lowestCount = 0;
    items = {};
  };

  //Convert to the string
  //From front to back
  this.toString = () => {
    if (this.isEmpty()) {
      return '';
    }
    let objString = `${items[lowestCount]}`;
    for (let i = lowestCount + 1; i < count; i++) {
      objString = `${objString},${items[i]}`;
    }
    return objString;
  };
}

/*
- Add lights and shadow casting +
- Create a playing +grey plane, +walls (height - 1), dashboard +
- Make cubes with rounded corners for the snake (extrude, bevel req-6)
- Replace balls by the apples
- Add image from the snake head camera to the display 
- Add clock on the right side of the display board
- Add shadow casting from the walls, apples, display board and the snake itself
- Add score counter to the bottom right
- Apply textures:
-- Cube environment
-- Checker board texture and map
-- Walls repeat-wrapping to value 3, apply bump map (scale 0,1)
-- Apply texture to the snake (sorokonozka, gusenica?)
-- Apple: texture, maps
- Uncomment the sounds
- Delete axis helpers
- position camera properly 
- Block default scrolling of the browser
- rename key numbers to variables or update event listener -> key
- Make walls thiner
- Investigate white cube
- delete grid helpers and colors of grid helper
*/