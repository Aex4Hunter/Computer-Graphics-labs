/* global THREE */

/* Colors */
const colorGreen = '#3ED126';
const colorBlueGreen = '#3E9676';
const colorYellow = '#FFF500' ;
const colorLight = '#E4F0E4';
const colorLightBrown = '#933B14';
const colorDarkBrown = '#180305';

/* Sizes */
const roomSize = 150;
const ceilingHeight = 20;
const lampCordY = 7;

const filedW = 4;
const filedL = 8;
const filedH = 0.1;
                                            
const fieldFrameW = filedW + 0.2;
const fieldFrameL = filedL + 0.4;
const fieldFrameH = 0.2;

const tableHeight = 2.3;

"use strict";
// * Initialize webGL
const canvas = document.getElementById("myCanvas");
const renderer = new THREE.WebGLRenderer({canvas,
                                          antialias: true});
renderer.setClearColor(colorLight);    // set background color
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

//light source
const chordGeo = new THREE.BoxGeometry(0.1, 0.1, filedL);
const chordMat = new THREE.MeshBasicMaterial( {color: 'grey'} );
const lampChord = new THREE.Mesh( chordGeo, chordMat );
lampChord.position.y = lampCordY;
scene.add( lampChord );

const wireGeo = new THREE.BoxGeometry(0.05, ceilingHeight - lampCordY, 0.05);
const wireMat = new THREE.MeshBasicMaterial( {color: 'grey'} );
const lampWire = new THREE.Mesh( wireGeo, wireMat );
lampWire.position.y = ceilingHeight - lampCordY;
scene.add(lampWire);

function createLightSource (zPosition) {
    const spotLight = new THREE.SpotLight( 0xffffff );

    //work on adding shadows
    scene.add( spotLight );

    const wireGeo = new THREE.BoxGeometry(0.05, 1, 0.05);
    const lampWire = new THREE.Mesh( wireGeo, wireMat );
    lampWire.position.y = lampCordY - 0.5;
    lampWire.position.z = zPosition;
    scene.add( lampWire );
    
    const lampGeo = new THREE.CylinderGeometry( 0, 0.8, 1, 32, 6, true );
    const lamMat = new THREE.MeshBasicMaterial( {color: colorBlueGreen} );
    const lamp = new THREE.Mesh( lampGeo, lamMat );
    lamp.position.y = -0.8;
    lampWire.add( lamp );
    
    const bulbGeo = new THREE.SphereGeometry( 0.3, 32, 16 );
    const bulbMat = new THREE.MeshBasicMaterial( { color: colorYellow } );
    const bulb = new THREE.Mesh( bulbGeo, bulbMat );
    bulb.position.y = lamp.position.y;
    lampWire.add( bulb );
    
    spotLight.position.set(bulb.position.clone()) ;
}

createLightSource(0);
createLightSource(filedL / 2 - 0.2);
createLightSource(-filedL / 2 + 0.2);



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

const floor = createPlane(colorBlueGreen, 0);
const ceiling = createPlane(colorLight, ceilingHeight);

// Create table 
//playfield
const boxGeo = new THREE.BoxGeometry(filedW, filedH, filedL);
const boxMat = new THREE.MeshBasicMaterial( {color: colorGreen} );
const playFiled = new THREE.Mesh( boxGeo, boxMat );
playFiled.position.y = tableHeight - 0.3;
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
	bevelEnabled: true,
	bevelThickness: 0.05,
	bevelSize: 0.1,
	bevelOffset: 0.1,
	bevelSegments: 10,
    depth: 0.4,
};
const frameGeo = new THREE.ExtrudeGeometry(outerFrame, extrudeSettings);
const buildFrame = new THREE.Mesh(frameGeo, frameMat);

buildFrame.rotation.x = Math.PI / 2;
buildFrame.rotation.z = Math.PI / 2;
buildFrame.position.set(fieldFrameW / 2, tableHeight, -fieldFrameL / 2);
scene.add(buildFrame);

// Add table legs 
function buildLegs() {
  w = 0.2;
  l = 0.2;
  h = 2;  
  legPositionY = h / 2;

  const boxGeo = new THREE.BoxGeometry(w, h, l);
  const boxMat = new THREE.MeshBasicMaterial( {color: colorDarkBrown} );
  const tableLegFL = new THREE.Mesh( boxGeo, boxMat );
  const tableLegFR = new THREE.Mesh( boxGeo, boxMat );
  const tableLegBL = new THREE.Mesh( boxGeo, boxMat );
  const tableLegBR = new THREE.Mesh( boxGeo, boxMat );
  const tableLegFM = new THREE.Mesh( boxGeo, boxMat );
  const tableLegBM = new THREE.Mesh( boxGeo, boxMat );

  tableLegFL.position.set(fieldFrameW / 2 - w/2, legPositionY, fieldFrameL / 2 -  l/2);
  tableLegFR.position.set(fieldFrameW / 2 - w/2, legPositionY, -fieldFrameL / 2 + l/2);
  tableLegBL.position.set(-fieldFrameW / 2 + w/2, legPositionY, fieldFrameL / 2 -  l/2);
  tableLegBR.position.set(-fieldFrameW / 2 + w/2, legPositionY, -fieldFrameL / 2 + l/2);
  tableLegFM.position.set(fieldFrameW / 2 - w/2, legPositionY, 0);
  tableLegBM.position.set(-fieldFrameW / 2 + w/2, legPositionY, 0);
  scene.add( tableLegFL );
  scene.add( tableLegFR );
  scene.add( tableLegBL );
  scene.add( tableLegBR );
  scene.add( tableLegFM );
  scene.add( tableLegBM );
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
1. Create room settings +
2. Create table 198 × 99 cm for playing field + 68 мм * 2 для луз +
3. Create Light above the table and the celing +
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
