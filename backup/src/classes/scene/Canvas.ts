import * as THREE from "three";
import Character from "../character/Character";
//import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class Canvas {
  //member variables
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public dirLight: THREE.DirectionalLight;
  public ambLight: THREE.AmbientLight;
  //public controls: OrbitControls;
  public topViewCamera: TopViewCamera;

  constructor() {
    // canvas
    const canvas = document.getElementById("app") as HTMLCanvasElement;

    // -- configuration
    // - renderer & window size
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    window.addEventListener(
      "resize",
      () => {
        this.OnWindowResize();
      },
      false
    );

    // - camera
    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 1000.0;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(11, 14, 13);

    this.topViewCamera = new TopViewCamera(this.camera);

    // - scene
    this.scene = new THREE.Scene();

    // - light
    // - directional light
    this.dirLight = new THREE.DirectionalLight(0xffffff);
    this.dirLight.position.set(0, 100, 10);
    this.dirLight.target.position.set(0, 0, 0);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.bias = -0.01; // ?
    this.dirLight.shadow.mapSize.width = 2048; // ?
    this.dirLight.shadow.mapSize.width = 2048; // ?
    this.dirLight.shadow.camera.near = 1.0; // ?
    this.dirLight.shadow.camera.far = 500; // ?
    this.dirLight.shadow.camera.left = 200; // ?
    this.dirLight.shadow.camera.right = -200; // ?
    this.dirLight.shadow.camera.top = 200; // ?
    this.dirLight.shadow.camera.bottom = -200; // ?
    this.dirLight.intensity = 0.6;
    this.scene.add(this.dirLight);
    // - ambient light
    this.ambLight = new THREE.AmbientLight(0x404040);
    this.ambLight.intensity = 0.9;
    this.scene.add(this.ambLight);

    // -- skybox
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      "textures/beachTexture/posx.jpg",
      "textures/beachTexture/negx.jpg",
      "textures/beachTexture/posy.jpg",
      "textures/beachTexture/negy.jpg",
      "textures/beachTexture/posz.jpg",
      "textures/beachTexture/negz.jpg",
    ]);

    // -- orbit controls (use this only for debug mode)
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.target.set(0, 0, 0);
    // this.controls.enableDamping = true;

    this.scene.background = texture;
  }

  //responsive screen
  OnWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix(); // ?
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

class TopViewCamera {
  public currentPosition: THREE.Vector3;
  public currentLookat: THREE.Vector3;

  constructor(public camera: THREE.Camera) {
    this.currentPosition = new THREE.Vector3();
    this.currentLookat = new THREE.Vector3();
  }

  CalculateOffset(player: Character) {
    const offset = new THREE.Vector3(13, 17, 14); //hardcoded offset - this work as a spring arm(local space)
    offset.add(player.Mesh.position);
    return offset;
  }

  CalculateLookAt(player: Character) {
    const lookAt = player.Mesh.position;
    return lookAt;
  }

  Update(deltaTime: number, player: Character) {
    const idealOffset = this.CalculateOffset(player);
    const idealLookat = this.CalculateLookAt(player);

    const lerpCoef = 4.0 * deltaTime;

    this.currentPosition.lerp(idealOffset, lerpCoef);
    this.currentLookat.lerp(idealLookat, lerpCoef);

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookat);
  }
}
