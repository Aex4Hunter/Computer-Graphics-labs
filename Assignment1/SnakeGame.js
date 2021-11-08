/* global THREE */

const planeSize = 10;
const gridSize = 10;
const gridDivisions = 10;
const positionStep = 0.5;
const snakeBuildBlock = 1;

// * Initialize webGL
const canvas = document.getElementById("myCanvas");
const renderer = new THREE.WebGLRenderer({canvas,
                                          antialias: true});
renderer.setClearColor('rgb(255,255,255)');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 100);
camera.position.set(7,-7, 18);
scene.add(camera);

camera.lookAt(scene.position);
scene.add(new THREE.AxesHelper(1.5));

// Game content starts

//helping functions
const generateRandomLocation = () => Math.floor(Math.random() * (gridDivisions / 2 - -gridDivisions / 2 ) + -gridDivisions / 2);
function snakeHandler(event) {
 if(event.keyCode == 37 && (snakeParts[0].position.x > -gridDivisions/2+1)) {
  snakeParts[0].position.x -=1;
 } else if(event.keyCode == 38 && (snakeParts[0].position.y < gridDivisions/2 -1)) {
  snakeParts[0].position.y +=1;
 } else if(event.keyCode == 39 && (snakeParts[0].position.x < gridDivisions/2 -1)) {
  snakeParts[0].position.x +=1;
 } else if(event.keyCode == 40 && (snakeParts[0].position.y > -gridDivisions/2 +1)) {
  snakeParts[0].position.y -=1;
 }
// console.log(event.keyCode);
  
}


document.addEventListener('keydown', snakeHandler);

//Plane & Grid
const plane = new THREE.PlaneGeometry(planeSize, planeSize);
const material = new THREE.MeshBasicMaterial( {color: '#118ab2', side: THREE.DoubleSide} );
const gameField = new THREE.Mesh( plane, material );
scene.add(gameField);

const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, '#06d6a0', '#06d6a0');
console.log(gridHelper.position);
gridHelper.rotation.x = Math.PI / 2;
gridHelper.colorGrid = 'blue';
scene.add(gridHelper);

//Snake
const snakeParts = [];

function generateSnakePart() {
  const geoCube = new THREE.BoxGeometry(snakeBuildBlock, snakeBuildBlock, snakeBuildBlock);
  const snakeMaterial = new THREE.MeshBasicMaterial( {color: '#ef476f'} );
  const snakePart = new THREE.Mesh(geoCube, snakeMaterial);

  if(snakeParts.length === 0) {
    const x = generateRandomLocation();
    const y = generateRandomLocation();
    
    snakePart.position.set(x + positionStep,y + positionStep,positionStep);
  }
  
  snakeParts.push(snakePart);
  scene.add(snakePart);
}

function generateBall() {
  const geoBall = new THREE.SphereGeometry(positionStep);
  const ballMaterial = new THREE.MeshBasicMaterial( {color: '#ffd166'} );
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
}

generateSnakePart();
generateBall();


// const geoCube = new THREE.BoxGeometry(1,1,1);
// const snakeMaterial = new THREE.MeshBasicMaterial( {color: '#ef476f'} );
// const snakePart = new THREE.Mesh(geoCube, snakeMaterial);
// snakePart.position.set(positionStep,positionStep,positionStep);
// scene.add(snakePart);


// * Render loop
const controls = new THREE.TrackballControls(camera, renderer.domElement);
const clock = new THREE.Clock();

function render() {
  requestAnimationFrame(render);

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
