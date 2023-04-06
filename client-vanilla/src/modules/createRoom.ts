import * as THREE from "three";

const CreateARoom = () => {
  const room = new THREE.Group();
  const planeGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);
  const cubeGeometry = new THREE.BoxGeometry(100, 30, 3);
  const whiteStandardMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
  });

  const plane = new THREE.Mesh(planeGeometry, whiteStandardMat);
  plane.receiveShadow = true;
  plane.castShadow = false;
  plane.rotation.x = -Math.PI / 2;

  const wallOne = new THREE.Mesh(cubeGeometry, whiteStandardMat);
  const wallThree = new THREE.Mesh(cubeGeometry, whiteStandardMat);
  wallOne.position.set(0, 15, -50);
  wallThree.rotation.y = -Math.PI / 2;
  wallThree.position.set(-50, 15, 0);

  wallOne.receiveShadow = true;
  wallThree.receiveShadow = true;
  room.add(plane, wallOne, wallThree);

  return room;
};

export { CreateARoom };
