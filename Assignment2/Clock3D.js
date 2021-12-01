/* global setInterval */
const CLOCK_FRONT = "front";
const CLOCK_REVERSE = "reverse";
/* Colors */
const primaryColor = "#000002";
const secondaryColor = "#49FF00";
const aggressiveGreen = "#49FF00";
const aggressiveRed = "#FF5200";

("use strict");
// * Initialize webGL
const canvas = document.getElementById("myCanvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setClearColor("rgb(0,0,0)"); // set background color
renderer.setSize(window.innerWidth, window.innerHeight);
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

const defaultPos = new THREE.Vector3(0, 20, -7);
camera.position.copy(defaultPos);
camera.lookAt(scene.position);

const light = new THREE.PointLight();
scene.add(light);
scene.add(new THREE.AmbientLight(0x606060));

// * Add your clock here
const cylinderRadius = 4;
const cylinderHeight = 1;
const cylinderGeo = new THREE.CylinderGeometry(
  cylinderRadius,
  cylinderRadius,
  cylinderHeight,
  52
);
const cylinderMat = new THREE.MeshPhysicalMaterial({ color: primaryColor });
const clockBody = new THREE.Mesh(cylinderGeo, cylinderMat);
scene.add(clockBody);

// Arrow & Center of the clock
const hourArrowRadius = 0.012;
const secondsArrowHeight = cylinderRadius - 0.2;

// second time zone clock
const createClockBody = (clockPosition) => {
  const clockCenterRadius = 0.05;
  const sphereGeo = new THREE.SphereGeometry(clockCenterRadius, 32, 16);
  const sphereMaterial = new THREE.MeshPhysicalMaterial({
    color: aggressiveGreen,
  });
  const clockCenter = new THREE.Mesh(sphereGeo, sphereMaterial);

  if (clockPosition == CLOCK_REVERSE) {
    clockCenter.position.y = -(cylinderHeight / 2 + clockCenterRadius);
  } else clockCenter.position.y = cylinderHeight / 2 + clockCenterRadius;

  const minArrowRadius = 0.015;
  const arrowSphereGeo = new THREE.SphereGeometry(minArrowRadius, 32, 16);
  const minArrow = new THREE.Mesh(arrowSphereGeo, sphereMaterial);
  const minArrowMatrix = new THREE.Matrix4();
  minArrowMatrix.makeScale(14, 1, 120);

  if (clockPosition == CLOCK_REVERSE) {
    minArrow.position.set(0, -cylinderHeight / 2, minArrowRadius);
  } else minArrow.position.set(0, cylinderHeight / 2, minArrowRadius);

  minArrow.applyMatrix4(minArrowMatrix);

  const hourArrowRadius = 0.012;
  const hourArrowSphereGeo = new THREE.SphereGeometry(hourArrowRadius, 32, 16);
  const hourArrow = new THREE.Mesh(hourArrowSphereGeo, sphereMaterial);
  const hourArrowMatrix = new THREE.Matrix4();
  hourArrowMatrix.makeScale(20, 1, 100);

  if (clockPosition == CLOCK_REVERSE) {
    hourArrow.position.set(0, -(cylinderHeight / 2), hourArrowRadius);
  } else hourArrow.position.set(0, cylinderHeight / 2, hourArrowRadius);
  hourArrow.applyMatrix4(hourArrowMatrix);

  const secondsArrowWidth = 0.04;
  const secondsArrowHeight = cylinderRadius - 0.2;
  const secondsArrowLength = 0.1;
  const boxGeo = new THREE.BoxGeometry(
    secondsArrowWidth,
    secondsArrowLength,
    secondsArrowHeight
  );
  const boxMaterial = new THREE.MeshBasicMaterial({ color: aggressiveGreen });
  const secondsArrow = new THREE.Mesh(boxGeo, boxMaterial);

  if (clockPosition == CLOCK_REVERSE) {
    secondsArrow.position.set(
      hourArrowRadius / 2,
      -cylinderHeight / 2,
      secondsArrowHeight / 2
    );
  } else
    secondsArrow.position.set(
      hourArrowRadius / 2,
      cylinderHeight / 2,
      secondsArrowHeight / 2
    );
  clockBody.add(secondsArrow);

  const shearMatrix = new THREE.Matrix4();
  shearMatrix.makeShear(0, 6, 0, 0, 6, 0);
  clockCenter.applyMatrix4(shearMatrix);

  clockBody.add(clockCenter);
  clockBody.add(secondsArrow);
  clockBody.add(minArrow);
  clockBody.add(hourArrow);

  const clockParts = [clockCenter, secondsArrow, minArrow, hourArrow];
  return clockParts;
};

const frontClockParts = createClockBody(CLOCK_FRONT);
let [frontClockCenter, frontSecondsArrow, frontMinArrow, frontHourArrow] =
  frontClockParts;
const reverseClockParts = createClockBody(CLOCK_REVERSE);
let [
  reverseClockCenter,
  reverseSecondsArrow,
  reverseMinArrow,
  reverseHourArrow,
] = reverseClockParts;

/* Clock Frame */
const outerRadius = 4.12;
const height = 1;
const innerRadius = cylinderRadius;
const deltaPhi = (2 * Math.PI) / 26;

const points = [];
points[0] = new THREE.Vector2(innerRadius, 0);
points[1] = new THREE.Vector2(innerRadius, height);
points[2] = new THREE.Vector2(outerRadius, height);
points[3] = new THREE.Vector2(outerRadius, 0);
points[4] = new THREE.Vector2(innerRadius, 0);
const frameGeo = new THREE.LatheGeometry(points, 120);
const frameMat = new THREE.MeshStandardMaterial({
  color: secondaryColor,
  metalness: 0.5,
  roughness: 0.1,
  flatShading: true, // see chapter 12 why we need this
  side: THREE.DoubleSide,
});

const clockFrame = new THREE.Mesh(frameGeo, frameMat);
clockFrame.position.y = - cylinderHeight/2;
clockBody.add(clockFrame);

/* Clock Ticks */

const buildClockTicks = () => {
  const bigTickWidth = 0.08;
  const bigTickHeight = 0.8;
  const bigTickLength = 1.04;
  let largeAngle = 0;
  let tickColor;

  const smallTickWidth = 0.04;
  const smallTickHeight = 0.3;
  const smallTickLength = 1.04;
  let smallAngle = 0;

  for (let i = 0; i < 12; i++) {
    if (i === 0) {
      tickColor = aggressiveRed;
    } else tickColor = aggressiveGreen;

    const boxGeo = new THREE.BoxGeometry(
      bigTickWidth,
      bigTickLength,
      bigTickHeight
    );
    const boxMaterial = new THREE.MeshBasicMaterial({ color: tickColor });
    const clockTick = new THREE.Mesh(boxGeo, boxMaterial);
    clockTick.position.z = cylinderRadius - bigTickHeight / 2;

    //translate and rotate
    const eu = new THREE.Euler(0, largeAngle, 0);
    const m = new THREE.Matrix4();
    m.makeRotationFromEuler(eu);
    clockTick.rotation.y = largeAngle;
    clockTick.position.applyMatrix4(m);

    largeAngle += Math.PI / 6;
    clockBody.add(clockTick);
  }

  for (let i = 0; i < 59; i++) {
    smallAngle += 6 * (Math.PI / 180.0);

    const boxGeo = new THREE.BoxGeometry(
      smallTickWidth,
      smallTickLength,
      smallTickHeight
    );
    const boxMaterial = new THREE.MeshBasicMaterial({ color: tickColor });
    const clockTick = new THREE.Mesh(boxGeo, boxMaterial);
    clockTick.position.z = cylinderRadius - smallTickHeight / 2;
    //translate and rotate
    const eu = new THREE.Euler(0, smallAngle, 0);
    const m = new THREE.Matrix4();
    m.makeRotationFromEuler(eu);
    clockTick.rotation.y = smallAngle;
    clockTick.position.applyMatrix4(m);
    clockBody.add(clockTick);
  }
};

buildClockTicks();

/* Run the clock */
const setArrowsDefault = (clockSide) => {
  if (clockSide == CLOCK_FRONT) {
    frontSecondsArrow.position.set(
      hourArrowRadius / 2,
      cylinderHeight / 2,
      secondsArrowHeight / 2
    );
    frontMinArrow.position.set(0, cylinderHeight / 2, 1.6);
    frontHourArrow.position.set(0, cylinderHeight / 2, 1.2);
  } else
    reverseSecondsArrow.position.set(
      hourArrowRadius / 2,
      -cylinderHeight / 2,
      secondsArrowHeight / 2
    );
  reverseMinArrow.position.set(0, -cylinderHeight / 2, 1.6);
  reverseHourArrow.position.set(0, -cylinderHeight / 2, 1.2);
};

const rotateArrow = (secondsNow, minutesNow, hoursNow, clockSide) => {
  setArrowsDefault(clockSide);
  const secondsratio = secondsNow / 60;

  //seconds
  if (clockSide == CLOCK_FRONT) {
    let secAngle = -secondsNow * 6 * (Math.PI / 180.0);
    const secEu = new THREE.Euler(0, secAngle, 0);
    const secMat = new THREE.Matrix4();
    secMat.makeRotationFromEuler(secEu);
    frontSecondsArrow.position.applyMatrix4(secMat);
    frontSecondsArrow.rotation.y = secAngle;
  } else {
    let secAngle = secondsNow * 6 * (Math.PI / 180.0);
    const secEu = new THREE.Euler(0, secAngle, 0);
    const secMat = new THREE.Matrix4();
    secMat.makeRotationFromEuler(secEu);
    reverseSecondsArrow.position.applyMatrix4(secMat);
    reverseSecondsArrow.rotation.y = secAngle;
  }

  //minutes
  if (clockSide == CLOCK_FRONT) {
    let minAngle = -(minutesNow + secondsratio) * 6 * (Math.PI / 180.0);
    const minEu = new THREE.Euler(0, minAngle, 0);
    const minMat = new THREE.Matrix4();
    minMat.makeRotationFromEuler(minEu);
    frontMinArrow.position.applyMatrix4(minMat);
    frontMinArrow.rotation.y = minAngle;
  } else {
    let minAngle = (minutesNow + secondsratio) * 6 * (Math.PI / 180.0);
    const minEu = new THREE.Euler(0, minAngle, 0);
    const minMat = new THREE.Matrix4();
    minMat.makeRotationFromEuler(minEu);
    reverseMinArrow.position.applyMatrix4(minMat);
    reverseMinArrow.rotation.y = minAngle;
  }

  //hours
  if (clockSide == CLOCK_FRONT) {
    let hourAngle =
      -(hoursNow + (secondsratio + minutesNow) / 60) * 30 * (Math.PI / 180.0);
    const hourEu = new THREE.Euler(0, hourAngle, 0);
    const hourMat = new THREE.Matrix4();
    hourMat.makeRotationFromEuler(hourEu);
    frontHourArrow.position.applyMatrix4(hourMat);
    frontHourArrow.rotation.y = hourAngle;
  } else {
    let hourAngle =
      (hoursNow + (secondsratio + minutesNow) / 60) * 30 * (Math.PI / 180.0);
    const hourEu = new THREE.Euler(0, hourAngle, 0);
    const hourMat = new THREE.Matrix4();
    hourMat.makeRotationFromEuler(hourEu);
    reverseHourArrow.position.applyMatrix4(hourMat);
    reverseHourArrow.rotation.y = hourAngle;
  }
};

const runClock = () => {
  //date Hamburg +1 Hour
  const frontDate = setTimeZone(1);

  const secondsFront = frontDate.getSeconds();
  const minutesFront = frontDate.getMinutes();
  const hoursFront = frontDate.getHours();

  // Vladivostok, Primorsky Krai, Russia +10 Hours
  const reverseDate = setTimeZone(10);

  const secondsReverse = reverseDate.getSeconds();
  const minutesReverse = reverseDate.getMinutes();
  const hoursReverse = reverseDate.getHours();

  rotateArrow(secondsFront, minutesFront, hoursFront, CLOCK_FRONT);
  rotateArrow(secondsReverse, minutesReverse, hoursReverse, CLOCK_REVERSE);
};

const setTimeZone = (timeOffset) => {
  const date = new Date();

  /* 60000 1000msec = 1 sec, 1 min = 60 sec => 60 * 1000 = 60000
     1 hour = 3600 sec. => 3600 * 1000 = 3600000  */
  let utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const clockDate = new Date(utc + 3600000 * timeOffset);
  return clockDate;
};

// * Render loop
const controls = new THREE.TrackballControls(camera, renderer.domElement);
controls.dynamicDampingFactor = 1;
controls.rotateSpeed = 3.0;
controls.zoomSpeed = 2;
controls.panSpeed = 1;
function render() {
  requestAnimationFrame(render);
  controls.update();
  runClock();
  // light always from direction of camera
  light.position.copy(camera.position.clone());
  renderer.render(scene, camera);
}
render();
