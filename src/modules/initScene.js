import * as THREE from 'three';

export function initScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('canvas').appendChild(renderer.domElement);

  camera.position.set(-4, 4, 6);

  const light = new THREE.DirectionalLight(0xffffff, 5);
  light.position.set(-20, 50, 70);

  light.castShadow = true; // Включение теней от света

  // Настройка параметров теней для источника света
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 500;
  light.shadow.camera.left = -50;
  light.shadow.camera.right = 50;
  light.shadow.camera.top = 50;
  light.shadow.camera.bottom = -50;

  scene.add(light);

  const hemiLight = new THREE.HemisphereLight(0xffeec9, 0x343c46, 1);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([
    'static/skybox/skybox-bw_r.jpg',
    'static/skybox/skybox-bw_l.jpg',
    'static/skybox/skybox-bw_u.jpg',
    'static/skybox/skybox-bw_d.jpg',
    'static/skybox/skybox-bw_f.jpg',
    'static/skybox/skybox-bw_b.jpg',
  ]);

  scene.background = texture;

  // Add fog effect
  const fogColor = 0xeeeeee; // You can change this to any color you prefer
  const fogNear = 10;
  const fogFar = 100;
  scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);

  return { scene, camera, renderer };
}
