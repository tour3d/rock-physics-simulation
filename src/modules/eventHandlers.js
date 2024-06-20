import * as THREE from 'three';
import { createRock } from './rocksLoader.js';

let isMouseMove = false;
let mouseDownTime = 0;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onDocumentKeyDown(event, camera, scene, originalRocks, rockModels, world) {
  if (event.code === 'Space') {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const rock = createRock(originalRocks, intersect.point, scene, world);
      rockModels.push(rock);
    }
  }
}

function onMouseDown() {
  isMouseMove = false;
  mouseDownTime = Date.now();
}

function onMouseUp(camera, scene, originalRocks, rockModels, world) {
  const mouseUpTime = Date.now();
  const timeDiff = mouseUpTime - mouseDownTime;

  if (isMouseMove || timeDiff > 300) return;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const intersect = intersects[0];
    const rock = createRock(originalRocks, intersect.point, scene, world);
    rockModels.push(rock);
  }
}

function onDocumentMouseMove(event) {
  isMouseMove = true;
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function addEventListeners(camera, scene, originalRocks, rockModels, world) {
  document.addEventListener('mousedown', onMouseDown, false);
  document.addEventListener('mouseup', () => onMouseUp(camera, scene, originalRocks, rockModels, world), false);
  document.addEventListener(
    'keydown',
    (event) => onDocumentKeyDown(event, camera, scene, originalRocks, rockModels, world),
    false
  );
  document.addEventListener('mousemove', onDocumentMouseMove, false);
}

export { addEventListeners };
