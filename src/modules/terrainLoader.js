import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { heightTerrainData, elementSize } from '../heightTerainData.js';
import { createHeightfieldShape } from '../utils/createHeightfield.js';

export async function terrainLoader(scene, world) {
  const gltfLoader = new GLTFLoader();
  const textureLoader = new THREE.TextureLoader();

  // Load terrain
  const terrainData = await gltfLoader.loadAsync('static/models/terrain.gltf');
  const terrainMesh = terrainData.scene.children[0];
  const terrainGeometry = terrainMesh.geometry;
  terrainGeometry.computeBoundingBox();
  const terrainBoundingBox = terrainGeometry.boundingBox;
  console.log('terrainBoundingBox=', terrainBoundingBox);

  terrainMesh.receiveShadow = true;

  scene.add(terrainMesh);

  // Используем предпросчитанный набор данных высот для создания формы ландшафта
  const terrainShape = new CANNON.Heightfield(heightTerrainData, {
    elementSize: elementSize,
  });

  // Создание формы ландшафта на основе мэша
  // const terrainShape = createHeightfieldShape(terrainMesh, 50, 10);

  const terrainBody = new CANNON.Body({ mass: 0 });
  terrainBody.addShape(terrainShape);
  terrainBody.position.set(22.48, 0, -17.9); // Apply the deltas to position the shape correctly
  terrainBody.quaternion.setFromEuler(Math.PI / 2, Math.PI, 0);
  const material = new CANNON.Material();
  material.friction = 0.5;
  terrainBody.material = material;
  world.addBody(terrainBody);

  // Load terrain
  const environmentData = await gltfLoader.loadAsync('static/models/environment.gltf');
  scene.add(environmentData.scene.children[0]);

  return terrainMesh;
}
