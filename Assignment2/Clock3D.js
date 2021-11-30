/* global setInterval */
/* Colors */
const primaryColor = '#FEFEDF';
const secondaryColor = '#845EC2';
const bgColor = '#00C9A7';
const secondaryShadeColor = '#F3C5FF';

"use strict";
// * Initialize webGL
const canvas = document.getElementById("myCanvas");
const renderer = new THREE.WebGLRenderer({canvas,
                                          antialias: true});
renderer.setClearColor('rgb(0,0,0)');    // set background color
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

const defaultPos = new THREE.Vector3(0,20,-7);
camera.position.copy(defaultPos);
camera.lookAt(scene.position);

const light = new THREE.PointLight();
scene.add( light );
scene.add(new THREE.AmbientLight(0x606060));

// * Add your clock here
const cylinderRadius = 4;
const cylinderHeight = 1;
const cylinderGeo = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderHeight, 52);
const cylinderMat = new THREE.MeshPhysicalMaterial({color: primaryColor});
const clockBody = new THREE.Mesh(cylinderGeo, cylinderMat);
scene.add(clockBody);

// Arrow & Center of the clock
const clockCenterRadius = 0.05;
const sphereGeo = new THREE.SphereGeometry(clockCenterRadius, 32, 16);
const sphereMaterial = new THREE.MeshPhysicalMaterial({color: secondaryColor});
const clockCenter = new THREE.Mesh( sphereGeo, sphereMaterial );
clockCenter.position.y = cylinderHeight / 2 + clockCenterRadius;

const minArrowRadius = 0.012;
const arrowSphereGeo = new THREE.SphereGeometry(minArrowRadius, 32, 16);
const minArrow = new THREE.Mesh(arrowSphereGeo, sphereMaterial);
minArrow.position.set(0.1, cylinderHeight / 2, 0);

const hourArrowRadius = 0.022;
const hourArrowSphereGeo = new THREE.SphereGeometry(hourArrowRadius, 32, 16);
const hourArrow = new THREE.Mesh(hourArrowSphereGeo, sphereMaterial);
hourArrow.position.set(hourArrowRadius/2, cylinderHeight / 2, -hourArrowRadius);

const secondsArrowWidth = 0.04;
const secondsArrowHeight = cylinderRadius -0.2;
const secondsArrowLength = 0.1;
const boxGeo = new THREE.BoxGeometry(secondsArrowWidth, secondsArrowLength, secondsArrowHeight);
const boxMaterial = new THREE.MeshBasicMaterial({color: secondaryColor});
const secondsArrow = new THREE.Mesh(boxGeo, boxMaterial);
secondsArrow.position.set(hourArrowRadius/2, cylinderHeight / 2, secondsArrowHeight/2);

const arrowMatrix = new THREE.Matrix4();
arrowMatrix.makeShear(0, 10, 0, 0, 80, 0);
minArrow.applyMatrix4(arrowMatrix);
hourArrow.applyMatrix4(arrowMatrix);
minArrow.rotation.y += Math.PI/2;

const shearMatrix = new THREE.Matrix4();
shearMatrix.makeShear(0, 6, 0, 0, 6, 0);
clockCenter.applyMatrix4(shearMatrix);

clockBody.add(clockCenter);
clockBody.add(secondsArrow);
clockBody.add(minArrow);
clockBody.add(hourArrow);

/* Clock Frame */
const outerRadius = 5.5; 
const height = 1;
const innerRadius = 4;
const deltaPhi = 2*Math.PI / 26;

const points = [];
points[0] = new THREE.Vector2(innerRadius, 0);
points[1] = new THREE.Vector2(innerRadius, height);
points[2] = new THREE.Vector2(outerRadius, height);
points[3] = new THREE.Vector2(outerRadius, 0);
points[4] = new THREE.Vector2(innerRadius,0);
const frameGeo = new THREE.LatheGeometry(points, 120);
const frameMat = new THREE.MeshStandardMaterial({color:secondaryColor,
metalness:0.5,
roughness:0.1,
flatShading:true,   // see chapter 12 why we need this
side: THREE.DoubleSide});



const clockFrame = new THREE.Mesh(frameGeo, frameMat);
clockFrame.position.y = -0.5;
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

  /* UNITE THIS LOOPS LATER */

  for(let i = 0; i < 12; i++) {
    if(i === 0) {
      tickColor = secondaryShadeColor;
    } else tickColor = secondaryColor;
    
    const boxGeo = new THREE.BoxGeometry(bigTickWidth, bigTickLength, bigTickHeight);
    const boxMaterial = new THREE.MeshBasicMaterial({color: tickColor});
    const clockTick = new THREE.Mesh(boxGeo, boxMaterial);
    clockTick.position.z = cylinderRadius - bigTickHeight/2;
  
    //translate and rotate
    const eu = new THREE.Euler(0, largeAngle, 0);
    const m = new THREE.Matrix4();
    m.makeRotationFromEuler(eu);
    clockTick.rotation.y = largeAngle;
    clockTick.position.applyMatrix4(m);
    
    largeAngle+=Math.PI/6;
    clockBody.add(clockTick);
  }

  for(let i = 0; i < 59; i++) {
    smallAngle+= 6 * (Math.PI / 180.0);

  const boxGeo = new THREE.BoxGeometry(smallTickWidth, smallTickLength, smallTickHeight);
  const boxMaterial = new THREE.MeshBasicMaterial({color: tickColor});
  const clockTick = new THREE.Mesh(boxGeo, boxMaterial);
  clockTick.position.z = cylinderRadius - smallTickHeight/2;
  //translate and rotate
  const eu = new THREE.Euler(0, smallAngle, 0);
  const m = new THREE.Matrix4();
  m.makeRotationFromEuler(eu);
  clockTick.rotation.y = smallAngle;
  clockTick.position.applyMatrix4(m);  
  clockBody.add(clockTick);
  }
  
} 

/* Run the clock */



buildClockTicks();


// * Render loop
const controls = new THREE.TrackballControls( camera, renderer.domElement );
controls.dynamicDampingFactor = 1;
controls.rotateSpeed = 3.0;
controls.zoomSpeed = 2;
controls.panSpeed = 1;
function render() {
  requestAnimationFrame(render);


  controls.update();
  // light always from direction of camera
  light.position.copy(camera.position.clone());
  renderer.render(scene, camera);
}
render();


// Plan
// 1. Create cylinder for body +
// 2. Create clock ticks +
// 3. create outline +
// 4. create arrows +
// 5. make arrow dynamic 
// 6. make a copy of the clock on the other side
// 7. rework the arrows to scale not shear
// 7. play with the styles
// 8. Clean code
// 9. Fix axis position
// 10. Kill axes
