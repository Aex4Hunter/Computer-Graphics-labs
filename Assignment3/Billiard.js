/* global THREE */
const randomBtn = document.getElementById("randomize");
const toggleBtn = document.getElementById("material");

/* Colors */
const colorGreen = "#1E6613";
const colorBlueGreen = "#3E9676";
const colorYellow = "#FFF500";
const colorLight = "#E4F0E4";
const colorLightBrown = "#933B14";
const colorDarkBrown = "#180305";
const colorObjShadow = "#336A54";

/* Sizes */
const roomSize = 150;
const ceilingHeight = 20;
const lampCordY = 7;

// playfield and frame
const filedW = 4;
const filedL = 8;
const filedH = 0.1;
const fieldFrameW = filedW + 0.81;
const fieldFrameL = filedL + 0.81;
const fieldFrameH = 0.2;

const tableHeight = 2.3;
const yOffset = 5;

// tight ball radius to table width
const ballRadius = (filedW / 100) * 3;
let ballSpeed = [];
let ballPos = [];

/* materials & textures */
let matWireframe = true;
const wireframeMat = new THREE.MeshStandardMaterial({
  color: 0x0026ff,
  wireframeLinewidth: 0.2,
  wireframe: true,
});
const loader = new THREE.TextureLoader();
const txtMatArr = [];

("use strict");
// * Initialize webGL
const canvas = document.getElementById("myCanvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setClearColor(colorLight); // set background color
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// Create a new Three.js scene with camera and light
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  canvas.width / canvas.height,
  0.1,
  1000
);

window.addEventListener("resize", function () {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

camera.position.set(13, 3, 13);
camera.lookAt(scene.position);

/* Lightning */
const ambLight = new THREE.PointLight();
scene.add(ambLight);
scene.add(new THREE.AmbientLight(0x606060));

// Lamp geo and Spotlight source 
const chordGeo = new THREE.BoxGeometry(0.1, 0.1, filedL);
const chordMat = new THREE.MeshBasicMaterial({ color: "grey" });
const lampChord = new THREE.Mesh(chordGeo, chordMat);
lampChord.position.y = lampCordY - yOffset;
scene.add(lampChord);

const wireGeo = new THREE.BoxGeometry(0.05, ceilingHeight - lampCordY, 0.05);
const wireMat = new THREE.MeshBasicMaterial({ color: "grey" });
const lampWire = new THREE.Mesh(wireGeo, wireMat);
lampWire.position.y = ceilingHeight - lampCordY - yOffset;
scene.add(lampWire);

function createLightSource(zPosition) {
  const wireGeo = new THREE.BoxGeometry(0.05, 1, 0.05);
  const lampWire = new THREE.Mesh(wireGeo, wireMat);
  lampWire.position.y = lampCordY - 0.5 - yOffset;
  lampWire.position.z = zPosition;
  scene.add(lampWire);

  const lampGeo = new THREE.CylinderGeometry(0.4, 0.8, 1, 32, 6, true);
  const lamMat = new THREE.MeshStandardMaterial({
    color: colorBlueGreen,
    side: THREE.DoubleSide,
  });
  const lamp = new THREE.Mesh(lampGeo, lamMat);
  lamp.position.y = -0.8;
  lampWire.add(lamp);

  const bulbGeo = new THREE.SphereGeometry(0.3, 32, 16);
  const bulbMat = new THREE.MeshBasicMaterial({ color: colorYellow });
  const bulb = new THREE.Mesh(bulbGeo, bulbMat);
  bulb.position.y = 0.16;
  lamp.add(bulb);
  return bulb;
}

createLightSource(filedL / 2 - 0.2);
createLightSource(-filedL / 2 + 0.2);

const lightbulb = createLightSource(0);
const spotLight = new THREE.SpotLight(0xffffff);
spotLight.castShadow = true;
spotLight.position.y = lightbulb.position.y;

scene.add(spotLight);

/* Create room environment */
// Add floor & ceiling
const createPlane = (planeColor, position) => {
  const planeMat = new THREE.MeshPhongMaterial({
    color: planeColor,
    side: THREE.DoubleSide,
  });

  const planeGeo = new THREE.PlaneGeometry(roomSize, roomSize);
  const newPlane = new THREE.Mesh(planeGeo, planeMat);
  newPlane.rotation.x = -Math.PI / 2;
  newPlane.position.y = position;
  scene.add(newPlane);
  return newPlane;
};

const floor = createPlane(colorBlueGreen, -yOffset);
floor.receiveShadow = true;
const ceiling = createPlane(colorLight, ceilingHeight - yOffset);

// Create table
const boxGeo = new THREE.BoxGeometry(filedW, filedH, filedL);
const boxMat = new THREE.MeshStandardMaterial({ color: colorGreen });
const playFiled = new THREE.Mesh(boxGeo, boxMat);
playFiled.receiveShadow = true;
playFiled.position.y = tableHeight - 0.3 - yOffset;
scene.add(playFiled);

// Add table frame
const frameMat = new THREE.MeshStandardMaterial({
  color: colorLightBrown,
  metalness: 0.1,
  roughness: 0.8,
  flatShading: true, 
  side: THREE.DoubleSide,
});

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
buildFrame.position.set(
  fieldFrameW / 2,
  tableHeight - yOffset,
  -fieldFrameL / 2
);
scene.add(buildFrame);

// Add table legs
function buildLegs() {
  w = 0.2;
  l = 0.2;
  h = 2;
  legPositionY = h / 2 - yOffset;

  const boxGeo = new THREE.BoxGeometry(w, h, l);
  const boxMat = new THREE.MeshStandardMaterial({ color: colorDarkBrown });
  const tableLegFL = new THREE.Mesh(boxGeo, boxMat);
  const tableLegFR = new THREE.Mesh(boxGeo, boxMat);
  const tableLegBL = new THREE.Mesh(boxGeo, boxMat);
  const tableLegBR = new THREE.Mesh(boxGeo, boxMat);
  const tableLegFM = new THREE.Mesh(boxGeo, boxMat);
  const tableLegBM = new THREE.Mesh(boxGeo, boxMat);

  tableLegFL.position.set(
    fieldFrameW / 2 - w / 2,
    legPositionY,
    fieldFrameL / 2 - l / 2
  );
  tableLegFR.position.set(
    fieldFrameW / 2 - w / 2,
    legPositionY,
    -fieldFrameL / 2 + l / 2
  );
  tableLegBL.position.set(
    -fieldFrameW / 2 + w / 2,
    legPositionY,
    fieldFrameL / 2 - l / 2
  );
  tableLegBR.position.set(
    -fieldFrameW / 2 + w / 2,
    legPositionY,
    -fieldFrameL / 2 + l / 2
  );
  tableLegFM.position.set(fieldFrameW / 2 - w / 2, legPositionY, 0);
  tableLegBM.position.set(-fieldFrameW / 2 + w / 2, legPositionY, 0);

  scene.add(tableLegFL);
  scene.add(tableLegFR);
  scene.add(tableLegBL);
  scene.add(tableLegBR);
  scene.add(tableLegFM);
  scene.add(tableLegBM);
}

buildLegs();

/* Create balls */
function buildBalls(amount) {
  const ballGeo = new THREE.SphereGeometry(ballRadius, 16, 8);
  const ballsArray = [];
  let ball;
  let ballY = -ballRadius - yOffset + tableHeight;

  for (let i = 0; i < amount; i++) {
    const txt = loader.load(`./PoolBallSkins/Ball${8 + i}.jpg`);
    const txMat = new THREE.MeshPhongMaterial({ color: 0xffffff, map: txt });
    txtMatArr.push(txMat);
    const maxW = filedW / 2 - filedH - ballRadius * 3;
    const minW = -(filedW / 2 - filedH - ballRadius * 3);
    const maxL = filedL / 2 - filedH - ballRadius * 3;
    const minL = -(filedW / 2 - filedH - ballRadius * 3);

    ball = new THREE.Mesh(ballGeo, txMat);
    ball.castShadow = true;
    let ballSpeedX = Math.random() * (3 - -3) + -3;
    let ballSpeedZ = Math.random() * (3 - -3) + -3;

    let ballPositionX = Math.random() * (maxW - minW) + minW;
    let ballPositionZ = Math.random() * (maxL - minL) + minL;

    for (let j = 0; j < ballPos.length; j++) {
      let currentBallPos = new THREE.Vector3(
        ballPositionX,
        ballY,
        ballPositionZ
      );
      while (currentBallPos.distanceTo(ballPos[j]) <= ballRadius * 2) {
        ballPositionX = Math.random() * (maxW - minW) + minW;
        ballPositionZ = Math.random() * (maxL - minL) + minL;
      }
    }

    ballSpeed.push(new THREE.Vector3(ballSpeedX, 0, ballSpeedZ));
    ballPos.push(new THREE.Vector3(ballPositionX, ballY, ballPositionZ));
    ball.matrixAutoUpdate = false;

    scene.add(ball);
    ballsArray.push(ball);
  }
  return ballsArray;
}

//add table shadow on the floor
const planeNormal = new THREE.Vector3(0, 1, 0);
const dist = floor.position.length();
playFiled.updateMatrixWorld();

const Qnd = new THREE.Matrix4().multiplyScalar(dist - 0.001);
Qnd.elements[3] = -planeNormal.x;
Qnd.elements[7] = -planeNormal.y;
Qnd.elements[11] = -planeNormal.z;
Qnd.elements[15] = 0;

let shadowTableGeo = boxGeo.clone();
const playfield2Plane = Qnd.multiply(playFiled.matrixWorld);
shadowTableGeo.applyMatrix4(playfield2Plane);

let shadowTable = new THREE.Mesh(
  shadowTableGeo,
  new THREE.MeshBasicMaterial({ color: colorObjShadow })
);
scene.add(shadowTable);

const ballSetArray = buildBalls(8);

/* Event listeners */
randomBtn.addEventListener("click", function () {
  ballSpeed = [];
  let ballSpeedX;
  let ballSpeedZ;

  for (let i = 0; i < ballSetArray.length; i++) {
    for (let j = i + 1; j < ballSetArray.length; j++) {
      if (ballPos[i].distanceTo(ballPos[j]) <= ballRadius * 2) {
        let vectorD = ballPos[j].clone().sub(ballPos[i].clone());
        ballSpeedX = Math.random() * vectorD.getComponent(0);
        ballSpeedZ = Math.random() * vectorD.getComponent(2);
      } else {
        ballSpeedX = Math.random() * (3 - -3) + -3;
        ballSpeedZ = Math.random() * (3 - -3) + -3;
      }
      ballSpeed.push(new THREE.Vector3(ballSpeedX, 0, ballSpeedZ));
    }
  }
});

toggleBtn.addEventListener("click", function () {
  if (matWireframe) {
    for (let i = 0; i < ballSetArray.length; i++) {
      ballSetArray[i].material = wireframeMat;
    }
  } else {
    for (let i = 0; i < ballSetArray.length; i++) {
      ballSetArray[i].material = txtMatArr[i];
    }
  }

  matWireframe = !matWireframe;
});

// * Render loop
const computerClock = new THREE.Clock();
const controls = new THREE.TrackballControls(camera, renderer.domElement);

function render() {
  requestAnimationFrame(render);

  const h = computerClock.getDelta();

  for (let i = 0; i < ballSetArray.length; i++) {
    if (ballPos[i].x >= filedW / 2 - filedH) {
      ballSpeed[i].x = -Math.abs(ballSpeed[i].x - ballSpeed[i].x * 0.2);
    }
    if (ballPos[i].x <= -filedW / 2 + filedH) {
      ballSpeed[i].x = Math.abs(ballSpeed[i].x - ballSpeed[i].x * 0.2);
    }
    if (ballPos[i].z >= filedL / 2 - filedH) {
      ballSpeed[i].z = -Math.abs(ballSpeed[i].z - ballSpeed[i].z * 0.2);
    }
    if (ballPos[i].z <= -filedL / 2 + filedH) {
      ballSpeed[i].z = Math.abs(ballSpeed[i].z - ballSpeed[i].z * 0.2);
    }

    ballPos[i].add(ballSpeed[i].clone().multiplyScalar(h));
    const om = ballSpeed[i].length() / ballRadius;
    const axis = planeNormal.clone().cross(ballSpeed[i]).normalize();

    const dR = new THREE.Matrix4().makeRotationAxis(axis, om * h);
    ballSetArray[i].matrix.premultiply(dR);
    ballSetArray[i].matrix.setPosition(ballPos[i]);

    for (let j = i + 1; j < ballSetArray.length; j++) {
      let inSpeedI = ballSpeed[i].clone();
      let inSpeedJ = ballSpeed[j].clone();
      let outSpeedI;
      let outSpeedJ;
      let vectorD;
      let semiResults;
      let dotProd;
      let inSpeedDiff;

      if (ballPos[i].distanceTo(ballPos[j]) <= ballRadius * 2) {
        vectorD = ballPos[j].clone().sub(ballPos[i].clone());
        inSpeedDiff = inSpeedI.clone().sub(inSpeedJ.clone());
        dotProd = vectorD.clone().dot(inSpeedDiff);
        semiResults = dotProd / vectorD.clone().lengthSq();
        semiResults = vectorD.clone().multiplyScalar(semiResults);

        outSpeedI = inSpeedI.clone().sub(semiResults);
        outSpeedJ = inSpeedJ.clone().add(semiResults);

        ballSpeed[i] = outSpeedI
          .clone()
          .sub(outSpeedI.clone().multiplyScalar(0.3));
        ballSpeed[j] = outSpeedJ
          .clone()
          .sub(outSpeedJ.clone().multiplyScalar(0.3));
      }
    }
  }

  controls.update();
  renderer.render(scene, camera);
}
render();
