import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const SCALE_VARIATION = 0.2; //Мультипликатор вариативности размеров камней от 0
const ROCK_PATHS = ['static/models/rock1.gltf', 'static/models/rock2.gltf'];
const ROCK_DENSITY = 2.5; // Предположим плотность камня 2.5 г/см³

export async function loadRockModels() {
  const gltfLoader = new GLTFLoader();
  const promises = ROCK_PATHS.map((path) => gltfLoader.loadAsync(path));
  const models = await Promise.all(promises);
  return models.map((model) => model.scene.children[0]);
}

export function createRock(originalRocks, position, scene, world) {
  const originalRock = originalRocks[Math.floor(Math.random() * originalRocks.length)];
  const rockMesh = originalRock.clone();

  const scale = 1 + (Math.random() * 2 - 1) * SCALE_VARIATION;
  rockMesh.scale.set(scale, scale, scale);

  const boundingBox = new THREE.Box3().setFromObject(rockMesh);
  const size = boundingBox.getSize(new THREE.Vector3());
  const radius = (size.x + size.y + size.z) / 6;

  rockMesh.position.copy(position);
  rockMesh.position.y += radius + 0.1; // Смещение по высоте

  const rockShape = new CANNON.Sphere(radius);

  // Вычисление объема и массы на основе плотности
  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
  const mass = ROCK_DENSITY * volume;

  console.log('mass', mass);

  const rockBody = new CANNON.Body({ mass });
  rockBody.addShape(rockShape);
  rockBody.position.copy(rockMesh.position);

  const rockMaterial = new CANNON.Material();
  rockMaterial.friction = 0.9;
  rockBody.material = rockMaterial;
  // Добавление демпфирования
  rockBody.linearDamping = 0.35; // Линейное демпфирование
  rockBody.angularDamping = 0.35; // Угловое демпфирование

  const randomQuat = new CANNON.Quaternion();
  randomQuat.setFromEuler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
  rockBody.quaternion.copy(randomQuat);
  rockMesh.quaternion.copy(randomQuat);

  rockMesh.castShadow = true;
  rockMesh.receiveShadow = true;

  world.addBody(rockBody);
  scene.add(rockMesh);

  return { mesh: rockMesh, body: rockBody };
}
