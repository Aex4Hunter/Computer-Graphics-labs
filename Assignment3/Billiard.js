/* global THREE */

"use strict";
// * Initialize webGL
const canvas = document.getElementById("myCanvas");
const renderer = new THREE.WebGLRenderer({canvas,
                                          antialias: true});
renderer.setClearColor('#ffffff');    // set background color
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

// * Add your billiard simulation here



// * Render loop
const controls = new THREE.TrackballControls( camera, renderer.domElement );

function render() {
  requestAnimationFrame(render);


  controls.update();
  renderer.render(scene, camera);
}
render();
