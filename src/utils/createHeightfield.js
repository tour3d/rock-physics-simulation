import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export function createHeightfieldShape(mesh, maxDimension, defaultHeight) {
  const geometry = mesh.geometry;
  geometry.computeBoundingBox();
  const boundingBox = geometry.boundingBox;

  const raycaster = new THREE.Raycaster();
  const rayOrigin = new THREE.Vector3();
  const rayDirection = new THREE.Vector3(0, -1, 0); // Cast rays downwards

  const width = boundingBox.max.x - boundingBox.min.x;
  const depth = boundingBox.max.z - boundingBox.min.z;

  let rows, cols;
  let elementSize;

  if (width > depth) {
    elementSize = width / (maxDimension - 1);
    rows = maxDimension;
    cols = Math.ceil(depth / elementSize) + 1;
  } else {
    elementSize = depth / (maxDimension - 1);
    cols = maxDimension;
    rows = Math.ceil(width / elementSize) + 1;
  }

  const heights = [];

  for (let i = 0; i < rows; i++) {
    heights.push([]);
    for (let j = 0; j < cols; j++) {
      const x = boundingBox.min.x + (i / (rows - 1)) * width;
      const z = boundingBox.min.z + (j / (cols - 1)) * depth;
      rayOrigin.set(x, boundingBox.max.y + 10, z); // Start ray above the highest point
      raycaster.set(rayOrigin, rayDirection);
      const intersects = raycaster.intersectObject(mesh, false);

      if (intersects.length > 0) {
        heights[i].push(intersects[0].point.y);
      } else {
        heights[i].push(defaultHeight);
      }
    }
  }

  // Invert the order of rows to fix the mirroring issue
  heights.reverse();

  const heightfieldShape = new CANNON.Heightfield(heights, {
    elementSize: elementSize,
  });

  return heightfieldShape;
}
