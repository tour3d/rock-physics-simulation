import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as CANNON from 'cannon-es';
import CannonDebugRenderer from './utils/cannonDebugRenderer.js';
import { initScene } from './modules/initScene.js';
import { terrainLoader } from './modules/terrainLoader.js';
import { loadRockModels } from './modules/rocksLoader.js';
import { addEventListeners } from './modules/eventHandlers.js';

// Импортируем дополнительные модули для пост-обработки
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass.js';

const clock = new THREE.Clock();
let delta;

const { scene, renderer, camera } = initScene();

// Создаем композитор для пост-обработки
const renderPass = new RenderPass(scene, camera);
const composer = new EffectComposer(renderer);
composer.addPass(renderPass);

// Настраиваем эффекты
// const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.1, 0.1, 0.85);
// const effectFilmBW = new FilmPass(0.35, true);
// const dotScreenPass = new DotScreenPass(new THREE.Vector2(0, 0), 0.3, 0.8);

// composer.addPass(bloomPass);
// composer.addPass(effectFilmBW);
// composer.addPass(dotScreenPass);

// Initialize controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 4, 3);

// Initialize physics
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
// world.solver.iterations = 100;
// world.solver.tolerance = 0.01;

const cannonDebugRenderer = new CannonDebugRenderer(scene, world);

let originalRocks = [];
let rockModels = [];

// Load models and start animation
async function loadModels() {
  await terrainLoader(scene, world);
  originalRocks = await loadRockModels();
  addEventListeners(camera, scene, originalRocks, rockModels, world); // Add event listeners after models are loaded
}

loadModels().then(() => {
  animate();
});

// Update physics and render the scene
function animate() {
  requestAnimationFrame(animate);

  delta = Math.min(clock.getDelta(), 0.1);
  world.step(delta);

  // cannonDebugRenderer.update();

  rockModels.forEach(({ mesh, body }) => {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  });

  controls.update(); // Update controls

  composer.render(delta); // Используем композитор для рендера сцены с пост-обработкой
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight); // Обновляем размер композитора

  // Обновляем размер bloomPass
  // bloomPass.setSize(window.innerWidth, window.innerHeight);
}

// Add event listener for window resize
window.addEventListener('resize', onWindowResize, false);
