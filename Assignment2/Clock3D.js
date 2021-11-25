/* global setInterval */

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
