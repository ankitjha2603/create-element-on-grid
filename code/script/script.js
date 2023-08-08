//Import
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
//--------------------------------------------
//NOTE Constant
const dimentions = [20, 20];
//--------------------------------------------

//--------------------------------------------
//NOTE Creating renderer
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//--------------------------------------------

//--------------------------------------------
//NOTE Creating scene
const scene = new THREE.Scene();
//--------------------------------------------

//--------------------------------------------
//NOTE Perspective Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-10, 5, 2);
//--------------------------------------------

//--------------------------------------------
//NOTE Percpective controll
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.minDistance = 5;
orbit.maxDistance = 20;
//--------------------------------------------

//--------------------------------------------
//NOTE - plain
const planeMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(...dimentions),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    visible: false,
  })
);
scene.add(planeMesh);
planeMesh.rotation.x = -0.5 * Math.PI;
planeMesh.receiveShadow = true;
planeMesh.name = "ground";
//--------------------------------------------

//--------------------------------------------
//NOTE - Grid herlper
const gridHelper = new THREE.GridHelper(...dimentions);
scene.add(gridHelper);
//--------------------------------------------

//--------------------------------------------
//NOTE - highlight plane
const highlight_planeMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    visible: false,
  })
);
scene.add(highlight_planeMesh);
highlight_planeMesh.name = "highlight";
highlight_planeMesh.rotation.x = -0.5 * Math.PI;
highlight_planeMesh.receiveShadow = true;
highlight_planeMesh.position.set(0.5, 0, 0.5);
//--------------------------------------------

//--------------------------------------------
//NOTE - cursor position and highlight plane mesh position
const mousePosition = new THREE.Vector2();
const rayCaster = new THREE.Raycaster();
let intersects = [];
window.addEventListener("mousemove", (e) => {
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
  rayCaster.setFromCamera(mousePosition, camera);
  intersects = rayCaster.intersectObjects(scene.children);
  let found = false;
  for (let i = 0; i < intersects.length; i++) {
    const dintersect = intersects[i];
    if (dintersect.object.name === "ground") {
      found = true;
      const { x, z } = new THREE.Vector3()
        .copy(dintersect.point)
        .floor()
        .addScalar(0.5);
      highlight_planeMesh.position.set(x, 0, z);
      highlight_planeMesh.material.color.setHex(
        collection[[x, z]] ? 0xff0000 : 0x00ff00
      );
      break;
    }
  }
  highlight_planeMesh.material.visible = found;
});
//--------------------------------------------

//--------------------------------------------
//NOTE - create and delete diomond
const collection = {};
const gen = (x, y, z) => {
  const boxGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
  const boxMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
  });
  const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
  scene.add(boxMesh);
  boxMesh.position.set(x, y, z);
  boxMesh.rotation.set(Math.PI / 4, Math.PI / 4, Math.PI / 4);
  boxMesh.castShadow = true;
  return boxMesh;
};
//Create
window.addEventListener("dblclick", () => {
  for (let i = 0; i < intersects.length; i++) {
    const dintersect = intersects[i];
    if (dintersect.object.name === "ground") {
      const { x, z } = new THREE.Vector3()
        .copy(dintersect.point)
        .floor()
        .addScalar(0.5);
      if (!collection[[x, z]]) {
        collection[[x, z]] = gen(x, 1, z);
        highlight_planeMesh.material.color.setHex(0xff0000);
      }
    }
  }
});
//Delete
window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  for (let i = 0; i < intersects.length; i++) {
    const dintersect = intersects[i];
    if (dintersect.object.name === "ground") {
      const { x, z } = new THREE.Vector3()
        .copy(dintersect.point)
        .floor()
        .addScalar(0.5);
      if (collection[[x, z]]) {
        scene.remove(collection[[x, z]]);
        highlight_planeMesh.material.color.setHex(0x00ff00);
        delete collection[[x, z]];
        break;
      }
    }
  }
});
//--------------------------------------------

//--------------------------------------------
//NOTE - animate function
const animate = (time) => {
  Object.values(collection).forEach((box) => {
    box.rotateX(0.04);
    box.rotateZ(-0.04);
    box.position.y = 0.5 + 0.5 * Math.abs(Math.sin(time / 1000));
  });
  renderer.render(scene, camera);
};
renderer.setAnimationLoop(animate);
//--------------------------------------------

//--------------------------------------------
//NOTE - resize camera view
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
//--------------------------------------------
