/* global THREE */

const planeSize = 10;
const gridSize = 10;
const gridDivisions = 10;
const positionStep = 0.5;
const snakeBuildBlock = 1;

let ballFlag = false;
let eCode;

const snakeParts = [];
//let snakeParts = new Deque();
let dequeue = new Deque();

// * Initialize webGL
const canvas = document.getElementById("myCanvas");
const renderer = new THREE.WebGLRenderer({canvas,
                                          antialias: true});
renderer.setClearColor('#dfe7fd');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 100);
camera.position.set(7,-7, 18);
scene.add(camera);

camera.lookAt(scene.position);

// Game content starts

//helping functions
function moveSnake(key) {
  let x = dequeue.getFront().position.x;
  let y = dequeue.getFront().position.y;
  let head = dequeue.removeFront();
  let tail;

  if(dequeue.getBack() !== null) {
    tail = dequeue.removeBack();
    tail.position.y = y;
    tail.position.x = x;
    dequeue.insertFront(tail);
  } 

  switch(key) {
    case 37:
     head.position.x-=1;
      break;
    case 38:
      head.position.y+=1;
      break;
    case 39:
      head.position.x+=1;
      break;
    case 40:
      head.position.y-=1; 
      break; 
  }  
  dequeue.insertFront(head);
}

const generateRandomLocation = () => Math.floor(Math.random() * (gridDivisions / 2 - -gridDivisions / 2 ) + -gridDivisions / 2);

function snakeHandler(event) {
  eCode = event.keyCode;
  
 if((event.keyCode == 37) && dequeue.getFront().position.x > -gridDivisions/2+1) {
  moveSnake(event.keyCode);
  const mLeft = setInterval(function() {
    if((eCode == 37) && dequeue.getFront().position.x > -gridDivisions/2+1) {
      moveSnake(event.keyCode);
    } else clearInterval(mLeft);
  }, 250);
 } if(event.keyCode == 38) {
    moveSnake(event.keyCode);
    const mUp = setInterval(function() {
      if((eCode == 38)) {
        moveSnake(event.keyCode);
      } else clearInterval(mUp);
    }, 250);

 } else if(event.keyCode == 39) {
    moveSnake(event.keyCode);
    const mRight = setInterval(function() {
      if(eCode == 39) {
        moveSnake(event.keyCode);
      } else clearInterval(mRight);
    }, 250);

 } else if(event.keyCode == 40 && (dequeue.getFront().position.y > -gridDivisions/2 +1)) {
  moveSnake(event.keyCode);
  const mdown = setInterval(function() {
    if((eCode == 40) && dequeue.getFront().position.y > -gridDivisions/2 +1) {
      moveSnake(event.keyCode);
    } else clearInterval(mdown);
  }, 250);
 }
 eCode = event.keyCode;  
}

document.addEventListener('keydown', snakeHandler);

//Plane & Grid
const plane = new THREE.PlaneGeometry(planeSize, planeSize);
const material = new THREE.MeshBasicMaterial( {color: '#118ab2', side: THREE.DoubleSide} );
const gameField = new THREE.Mesh( plane, material );
scene.add(gameField);

const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, '#06d6a0', '#06d6a0');
gridHelper.rotation.x = Math.PI / 2;
scene.add(gridHelper);

//Snake
function generateSnakePart() {
  let x = 0;
  let y = 0;
  let colorPart;

  if(dequeue.getValues().length === 0) {
    x = generateRandomLocation() + positionStep;
    y = generateRandomLocation() + positionStep;  
    colorPart = '#ef476f';
  } else if (eCode == 37) {
    x = dequeue.getFront().position.x +1;
    y = dequeue.getFront().position.y;
    colorPart = 'blue'; 
  } else if (eCode == 38) {      
    x = dequeue.getFront().position.x;
    y = dequeue.getFront().position.y -1;
    colorPart = 'blue';
  } else if (eCode == 39) {      
    x = dequeue.getFront().position.x - 1;
    y = dequeue.getFront().position.y;
    colorPart = 'blue'; 
  } else if (eCode == 40) {      
    x = dequeue.getFront().position.x;
    y = dequeue.getFront().position.y +1;
    colorPart = 'blue';
  }

  const geoCube = new THREE.BoxGeometry(snakeBuildBlock, snakeBuildBlock, snakeBuildBlock);
  const snakeMaterial = new THREE.MeshBasicMaterial( {color: colorPart} );
  const snakePart = new THREE.Mesh(geoCube, snakeMaterial);

  snakePart.position.set(x,y,positionStep);
  
  dequeue.insertBack(snakePart);
  scene.add(snakePart);
} 

const geoBall = new THREE.SphereGeometry(positionStep);
const ballMaterial = new THREE.MeshBasicMaterial( {color: '#ffd166'} );

function generateBall() {
  const ballPart = new THREE.Mesh(geoBall, ballMaterial);

  //create function GenerateRandomNumber
  let x = generateRandomLocation();
  let y = generateRandomLocation();
  
  for(const part of snakeParts) {
    while(part.position.x == x && part.position.y == y) {
      x = generateRandomLocation();
      y = generateRandomLocation();
    }
  }
  ballPart.position.set(x + positionStep,y + positionStep,positionStep);
  scene.add(ballPart);

  ballFlag = true;
  return ballPart;
}

const ball = generateBall();

generateSnakePart();

function pickupBall() {
  if(dequeue.getFront().position.x == ball.position.x && dequeue.getFront().position.y == ball.position.y) {
   generateSnakePart();

    let x = generateRandomLocation();
    let y = generateRandomLocation();
    let sParts = dequeue.getValues();

    for(let i = 0; i < sParts.length - 1; i++) {
      if (sParts[i] !== null) {
        while(sParts[i].position.x == x && sParts[i].position.y == y) {
          x = generateRandomLocation();
          y = generateRandomLocation();
        }
      }      
    }
    ball.position.set(x + positionStep,y + positionStep,positionStep);
  }   
}
//setInterval(function(){ alert("Hello"); }, 3000);

// finish alert conditions for the field edge
// alert conditions for the hit the snake
// write restart game function to call in restart
//check if ball generated on the snake
//imlement camera rotation
//implement sounds

function restartGame() {
  let counter = dequeue.size();
  let headX = dequeue.getFront().position.x;
  let headY = dequeue.getFront().position.y;

  if(headX == gridDivisions / 2 + positionStep) {
    alert('Game over! You score is ' + counter);
  }  
}

// * Render loop
const controls = new THREE.TrackballControls(camera, renderer.domElement);
const clock = new THREE.Clock();

function render() {
  requestAnimationFrame(render);
  
  restartGame();
  pickupBall();

  

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
