/* global THREE */

/* Colors */
const colorGreen = '#3ED126';
const colorBlueGreen = '#3E9676';
const colorYellow = '#FFF500' ;
const colorLight = '#E4F0E4';
const colorLightBrown = '#933B14';
const colorDarkBrown = '#180305';

/* Sizes */
const roomSize = 50;

const filedW = 4;
const filedL = 8;
const filedH = 0.5;
                                            
const fieldFrameW = filedW + 0.1;
const fieldFrameL = filedL + 0.2;
const fieldFrameH = filedH;


"use strict";
// * Initialize webGL
const canvas = document.getElementById("myCanvas");
const renderer = new THREE.WebGLRenderer({canvas,
                                          antialias: true});
renderer.setClearColor(colorDarkBrown);    // set background color
renderer.setSize(window.innerWidth, window.innerHeight);
// Create a new Three.js scene with camera and light
const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper());
const camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height,
                                            0.1, 1000 );

window.addEventListener("resize", function() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
});


camera.position.set(10, 5, 8);
camera.lookAt(scene.position);

// remove this in the final version1
scene.add(new THREE.AxesHelper());

// Lightning

const ambLight = new THREE.PointLight();
scene.add(ambLight);
scene.add(new THREE.AmbientLight(0x606060));

//change spotlight position to above the ceiling
const spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 100, 1000, 100 );
spotLight.castShadow = true;
//work on adding shadows
scene.add( spotLight );


// Create room environment

// Add the floor N ceiling
const createPlane = (planeColor, position) => {
  const planeMat = new THREE.MeshPhongMaterial({color: planeColor,
    side:THREE.DoubleSide} );

    const planeGeo = new THREE.PlaneGeometry(roomSize,roomSize);
    const newPlane = new THREE.Mesh(planeGeo, planeMat);
    newPlane.rotation.x = -Math.PI/2;
    newPlane.position.y = position;
    scene.add(newPlane);
    return newPlane;
}

//const floor = createPlane(colorBlueGreen, -2);
//const ceiling = createPlane(colorLight, 10);

// Create table 
//playfield
const boxGeo = new THREE.BoxGeometry(filedW, filedH, filedL);
const boxMat = new THREE.MeshBasicMaterial( {color: colorGreen} );
const playFiled = new THREE.Mesh( boxGeo, boxMat );
playFiled.position.y = 2.4;
scene.add( playFiled );

//add table frame
  const frameMat = new THREE.MeshStandardMaterial({color: colorLightBrown,
    metalness:0.1,
    roughness:0.8,
    flatShading:true,   // see chapter 12 why we need this
    side: THREE.DoubleSide});

const outerFrame = new THREE.Shape();
outerFrame.moveTo(fieldFrameL, 0);
outerFrame.lineTo(fieldFrameL, fieldFrameW);
outerFrame.lineTo(0, fieldFrameW);
outerFrame.lineTo(0, 0);

const innerFrame = new THREE.Shape();  
innerFrame.moveTo(fieldFrameL - fieldFrameH, fieldFrameH);
innerFrame.lineTo(fieldFrameL - fieldFrameH, fieldFrameW - fieldFrameH);
innerFrame.lineTo(fieldFrameH, fieldFrameW - fieldFrameH);
innerFrame.lineTo(fieldFrameH, fieldFrameH);
outerFrame.holes.push(innerFrame);

const extrudeSettings = {
bevelEnabled: false,
depth: 1,
};
const frameGeo = new THREE.ExtrudeGeometry(outerFrame, extrudeSettings);
const buildFrame = new THREE.Mesh(frameGeo, frameMat);

buildFrame.rotation.x = Math.PI / 2;
buildFrame.rotation.z = Math.PI / 2;
buildFrame.position.set(fieldFrameW / 2, 3, -fieldFrameL / 2);
scene.add(buildFrame);

// Add table legs 
function buildLegs() {
  const boxGeo = new THREE.BoxGeometry(0.2, 3, 0.2);
  const boxMat = new THREE.MeshBasicMaterial( {color: colorLightBrown} );
  const tableLeg = new THREE.Mesh( boxGeo, boxMat );
  scene.add( tableLeg );
}

buildLegs();

// * Add your billiard simulation here



// * Render loop
const controls = new THREE.TrackballControls( camera, renderer.domElement );

function render() {
  requestAnimationFrame(render);


  controls.update();
  renderer.render(scene, camera);
}
render();


/* Planning the app */
/*
1. Create room settings
2. Create table 198 × 99 cm for playing field + 68 мм * 2 для луз
3. Create Light above the table and the celing
4. Add shadow casting
5. Add shadow from the table on the floor
6. Add 8 balls as wireframes size 68 мм
7. Make balls roll
8. Make balls roll random, add button to randomize
9. Add reflections off the table
10. Add reflection off each other
11. Add texture images
12. Make sure to use function to create the balls
13. Add holes to the table
14. Delete the axes
*/