import * as THREE from "three";

//Canvas
const canvas = document.getElementById("app") as HTMLCanvasElement;
//scene - container box of mesh, camera and other similar things
const scene = new THREE.Scene();
//camera - perspective
// the last two parameters represent of range of rendering. If there is an object far from the limitation, it will be cut off
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
//renderer - integrate everything and make it visible on browser
const renderer = new THREE.WebGLRenderer({ canvas });

const resizeRenderer = (renderer: THREE.WebGLRenderer) => {
  const canvas = renderer.domElement;
  //handling hd-dpi depending on a type of device
  const pixelRatio = window.devicePixelRatio;
  const width = (canvas.clientWidth * pixelRatio) | 0;
  const height = (canvas.clientHeight * pixelRatio) | 0;
  const needResize =
    canvas.clientWidth !== width || canvas.clientHeight !== height;
  if (needResize) {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }
  return needResize;
};

renderer.setSize(window.innerWidth, window.innerHeight);

export { scene, camera, renderer, resizeRenderer };
