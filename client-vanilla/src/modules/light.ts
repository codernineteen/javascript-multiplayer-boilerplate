import * as THREE from "three";

const setLight = (
  color: string,
  intensity: number,
  position: number[],
  scene: THREE.Scene
) => {
  const dLight = new THREE.DirectionalLight(color, intensity);
  const aLight = new THREE.AmbientLight(color, intensity);
  dLight.position.set(position[0], position[1], position[2]);
  scene.add(dLight, aLight);
};

export { setLight };
