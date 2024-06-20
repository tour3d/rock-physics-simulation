// Устаревная рабочая версия "все в одном"
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as CANNON from 'cannon-es';
import CannonUtils from './utils/cannonUtils.js';
import CannonDebugRenderer from './utils/cannonDebugRenderer.js';
import { createHeightfieldShape } from './utils/createHeightfield.js';

const clock = new THREE.Clock();
let delta;

// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.CineonToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas').appendChild(renderer.domElement);

camera.position.set(-20, 10, 5);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

// Add HemisphereLight
const hemiLight = new THREE.HemisphereLight(0xffeec9, 0x343c46, 0.6);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

// Add skybox
const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  'static/skybox/skybox_r.jpg', // right
  'static/skybox/skybox_l.jpg', // left
  'static/skybox/skybox_u.jpg', // up
  'static/skybox/skybox_d.jpg', // down
  'static/skybox/skybox_f.jpg', // front
  'static/skybox/skybox_b.jpg', // back
]);
scene.background = texture;

// Initialize controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Initialize physics
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
world.solver.iterations = 100;
world.solver.tolerance = 0.01;

const cannonDebugRenderer = new CannonDebugRenderer(scene, world);

// Load models
const gltfLoader = new GLTFLoader();

async function loadModels() {
  // Load terrain
  const terrainData = await gltfLoader.loadAsync('static/models/terrain.gltf');
  const terrainMesh = terrainData.scene.children[0];
  scene.add(terrainMesh);

  // Create terrain body
  // const terrainShape = CannonUtils.CreateTrimesh(terrainMesh.geometry);
  // const terrainBody = new CANNON.Body({ mass: 0 });
  // terrainBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0);
  // terrainBody.addShape(terrainShape);
  // world.addBody(terrainBody);

  // Create terrain body using Heightfield
  const terrainShape = createHeightfieldShape(terrainMesh, 20, 20, 0);
  const terrainBody = new CANNON.Body({ mass: 0 });
  terrainBody.addShape(terrainShape);
  terrainBody.position.copy(terrainMesh.position);
  terrainBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

  world.addBody(terrainBody);

  const planeShape = new CANNON.Plane();
  const planeBody = new CANNON.Body({ mass: 0 });
  planeBody.addShape(planeShape);
  planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(planeBody);

  const rockModels = [];

  // Load rocks
  for (let i = 0; i < 10; i++) {
    const rockData = await gltfLoader.loadAsync('static/models/rock1.gltf');
    const rockMesh = rockData.scene.children[0];
    rockMesh.position.set(Math.random() * 2 + 14, Math.random() * 5 + 10, Math.random() * 2 + i * 0.5 - 10);

    const rockShape = new CANNON.Sphere(0.4);
    const rockBody = new CANNON.Body({ mass: 1 });
    rockBody.addShape(rockShape);
    rockBody.position.copy(rockMesh.position);

    // Set random initial rotation
    const randomQuat = new CANNON.Quaternion();
    randomQuat.setFromEuler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
    rockBody.quaternion.copy(randomQuat);
    rockMesh.quaternion.copy(randomQuat);

    world.addBody(rockBody);

    scene.add(rockMesh);
    rockModels.push({ mesh: rockMesh, body: rockBody });
  }

  return rockModels;
}

let rockModels = [];

loadModels().then((models) => {
  rockModels = models;
  animate();
});

// Update physics and render the scene
function animate() {
  requestAnimationFrame(animate);

  delta = Math.min(clock.getDelta(), 0.1);
  world.step(delta);

  cannonDebugRenderer.update();

  rockModels.forEach(({ mesh, body }) => {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  });

  controls.update(); // Update controls

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Add event listener for window resize
window.addEventListener('resize', onWindowResize, false);
