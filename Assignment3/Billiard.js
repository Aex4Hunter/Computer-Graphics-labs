/* global THREE */

/* Colors */
const colorGreen = '#3ED126';
const colorBlueGreen = '#3E9676';
const colorYellow = '#FFF500';
const colorLight = '#E4F0E4';
const colorLightBrown = '#933B14';
const colorDarkBrown = '#180305';
const colorObjShadow = '#336A54';

/* Sizes */
const roomSize = 150;
const ceilingHeight = 20;
const lampCordY = 7;

const filedW = 4;
const filedL = 8;
const filedH = 0.1;
                                            
const fieldFrameW = filedW + 0.81;
const fieldFrameL = filedL + 0.81;
const fieldFrameH = 0.2;

const tableHeight = 2.3;
const yOffset = 5;

// tight ball radius to table width
const ballRadius = filedW / 100 * 3;

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

camera.position.set(13, 3, 13);
camera.lookAt(scene.position);

// remove this in the final version1
scene.add(new THREE.AxesHelper());

// Lightning

const ambLight = new THREE.PointLight();
scene.add(ambLight);
scene.add(new THREE.AmbientLight(0x606060));

//light source
const chordGeo = new THREE.BoxGeometry(0.1, 0.1, filedL);
const chordMat = new THREE.MeshBasicMaterial({color: 'grey'});
const lampChord = new THREE.Mesh(chordGeo, chordMat);
lampChord.position.y = lampCordY -yOffset;
scene.add( lampChord );

const wireGeo = new THREE.BoxGeometry(0.05, ceilingHeight - lampCordY, 0.05);
const wireMat = new THREE.MeshBasicMaterial( {color: 'grey'} );
const lampWire = new THREE.Mesh( wireGeo, wireMat );
lampWire.position.y = ceilingHeight - lampCordY - yOffset;
scene.add(lampWire);

function createLightSource (zPosition) {

    const wireGeo = new THREE.BoxGeometry(0.05, 1, 0.05);
    const lampWire = new THREE.Mesh( wireGeo, wireMat );
    lampWire.position.y = lampCordY - 0.5 - yOffset;
    lampWire.position.z = zPosition;
    scene.add( lampWire );
    
    const lampGeo = new THREE.CylinderGeometry( 0, 0.8, 1, 32, 6, true );
    const lamMat = new THREE.MeshBasicMaterial( {color: colorBlueGreen} );
    const lamp = new THREE.Mesh(lampGeo, lamMat);
    lamp.position.y = -0.8;
    lampWire.add(lamp);
    
    const bulbGeo = new THREE.SphereGeometry( 0.3, 32, 16 );
    const bulbMat = new THREE.MeshBasicMaterial( { color: colorYellow } );
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.y = lamp.position.y;
    lampWire.add(bulb);

    return bulb;
}

createLightSource(filedL / 2 - 0.2);
createLightSource(-filedL / 2 + 0.2);

const lightbulb = createLightSource(0);
const spotLight = new THREE.SpotLight(0xffffff);
//spotLight.position.set(lightbulb.position.clone());
spotLight.position.set(lightbulb.position.clone());
scene.add(spotLight);



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

const floor = createPlane(colorBlueGreen, -yOffset);
const ceiling = createPlane(colorLight, ceilingHeight -yOffset);

// Create table 
//playfield
const boxGeo = new THREE.BoxGeometry(filedW, filedH, filedL);
const boxMat = new THREE.MeshBasicMaterial( {color: colorGreen} );
const playFiled = new THREE.Mesh( boxGeo, boxMat );
playFiled.position.y = tableHeight - 0.3 -yOffset;
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
buildFrame.position.set(fieldFrameW / 2, tableHeight - yOffset, -fieldFrameL / 2);
scene.add(buildFrame);

// Add table legs 
function buildLegs() {
  w = 0.2;
  l = 0.2;
  h = 2;  
  legPositionY = h / 2 - yOffset;

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
  
  const boxShadowGeo = new THREE.BoxGeometry(0.23, 0.01, 0.22);
  const boxShadowMat = new THREE.MeshBasicMaterial( {color: 'black'} );
  boxShadowMat.transparent = true;
  boxShadowMat.opacity = 0.8;
  const boxShadow = new THREE.Mesh( boxShadowGeo, boxShadowMat );
  boxShadow.position.set(-fieldFrameW / 2 + w/2 - 0.01, -yOffset, 0);
  scene.add( boxShadow );

  scene.add( tableLegFL );
  scene.add( tableLegFR );
  scene.add( tableLegBL );
  scene.add( tableLegBR );
  scene.add( tableLegFM );
  scene.add( tableLegBM );
}

buildLegs();

//add table shadow on the floor
const planeNormal = new THREE.Vector3(0,1,0);
const dist = floor.position.length(); 
playFiled.updateMatrixWorld();

const Qnd = new THREE.Matrix4().multiplyScalar(dist-0.001);
Qnd.elements[3] = -planeNormal.x;
Qnd.elements[7] = -planeNormal.y;
Qnd.elements[11] = -planeNormal.z;
Qnd.elements[15] = 0;

let shadowTableGeo = boxGeo.clone();
const playfield2Plane = Qnd.multiply(playFiled.matrixWorld);
shadowTableGeo.applyMatrix4(playfield2Plane);

let shadowTable = new THREE.Mesh(shadowTableGeo,
  new THREE.MeshBasicMaterial({color: colorObjShadow}));
scene.add(shadowTable);

// Create balls
function buildBalls(amount) {
  const ballsArray = [];
  //fieldFrameL - fieldFrameH*2 - gives length
  //fieldFrameW - fieldFrameH*2 - gives width
  const framePartL = fieldFrameH;
  
  for (let i = 0; i < amount; i++) {
    const ballGeo = new THREE.SphereGeometry(ballRadius, 8, 4);
    const ballMat = new THREE.MeshBasicMaterial( {color: 0x0000ff, wireframeLinewidth:1, wireframe:true} );
    const ball = new THREE.Mesh( ballGeo, ballMat );
    ball.position.y = ballRadius + filedH;
    //Math.random() * (max - min) + min;
    ball.position.x = Math.random() * ((filedW/2 - ballRadius) - (-filedW/2 + ballRadius)) + (-filedW/2 + ballRadius);
    //ball.position.x = Math.random() * ((fieldFrameW - fieldFrameH*2)/2-ballRadius - (-(fieldFrameW - fieldFrameH*2)/2)+ballRadius) + ((-(fieldFrameW - fieldFrameH*2)/2)+ballRadius);
    ball.position.z = Math.random() * ((filedL/2- ballRadius) - (-filedL/2 + ballRadius)) + (-filedL/2 + ballRadius);
    playFiled.add( ball );  
    ballsArray.push(ball);
  }
  return ballsArray;
}

const ballSetArray = buildBalls(8);



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
5. Add shadow from the table on the floor +
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
