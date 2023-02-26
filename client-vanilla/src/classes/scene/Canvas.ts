import * as THREE from "three";
import Character from "../character/Character";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";

export default class Canvas {
  //member variables
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public dirLight: THREE.DirectionalLight;
  public ambLight: THREE.AmbientLight;
  //public controls: OrbitControls;
  public topViewCamera: TopViewCamera;
  //shader effect members
  public composer: EffectComposer;
  public renderPass: RenderPass;
  public outlinePass: OutlinePass;
  public effectFXAA: ShaderPass;

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
    this.camera.position.set(20, 30, 30);

    this.topViewCamera = new TopViewCamera(this.camera);

    // - scene
    this.scene = new THREE.Scene();

    // - light
    // - directional light
    this.dirLight = new THREE.DirectionalLight(0xffffff);
    this.dirLight.position.set(0, 100, 50);
    this.dirLight.target.position.set(0, 0, 0);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.radius = 10;
    //For performance, use low resolution than 2048
    this.dirLight.shadow.mapSize.width = 2048; // detail of shadow edge
    this.dirLight.shadow.mapSize.height = 2048; // detail of shadow edge
    this.dirLight.shadow.camera.near = 1; // available range of shadow existence (start point)
    this.dirLight.shadow.camera.far = 500; // available range of shadow existence (end point)
    //amplitude
    this.dirLight.shadow.camera.left = 100;
    this.dirLight.shadow.camera.right = -100;
    this.dirLight.shadow.camera.top = 100;
    this.dirLight.shadow.camera.bottom = -100;
    this.dirLight.intensity = 0.6;
    this.scene.add(this.dirLight);
    // - ambient light
    this.ambLight = new THREE.AmbientLight(0x404040);
    this.ambLight.intensity = 0.9;
    this.scene.add(this.ambLight);

    // -- skybox
    // const loader = new THREE.CubeTextureLoader();
    // const texture = loader.load([
    //   "textures/beachTexture/posx.jpg",
    //   "textures/beachTexture/negx.jpg",
    //   "textures/beachTexture/posy.jpg",
    //   "textures/beachTexture/negy.jpg",
    //   "textures/beachTexture/posz.jpg",
    //   "textures/beachTexture/negz.jpg",
    // ]);

    // -- shader effect
    // - composer
    this.composer = new EffectComposer(this.renderer);
    this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // - render pass
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);
    // - outline pass
    this.outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.scene,
      this.camera
    );
    // -- parameter config
    this.outlinePass.edgeStrength = 3.0;
    this.outlinePass.edgeGlow = 1.0;
    this.outlinePass.edgeThickness = 3.0;
    this.outlinePass.pulsePeriod = 0;
    this.outlinePass.usePatternTexture = false; // patter texture for an object mesh
    this.outlinePass.visibleEdgeColor.set("#1abaff"); // set basic edge color
    this.outlinePass.hiddenEdgeColor.set("#1abaff"); // set edge color when it hidden by other objects
    this.composer.addPass(this.outlinePass);

    //shader
    this.effectFXAA = new ShaderPass(FXAAShader);
    this.effectFXAA.uniforms["resolution"].value.set(
      1 / window.innerWidth,
      1 / window.innerHeight
    );
    this.effectFXAA.renderToScreen = true;
    this.composer.addPass(this.effectFXAA);

    // - background color
    this.scene.background = new THREE.Color("#eee");
  }

  //responsive screen
  OnWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix(); // ?

    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);

    this.effectFXAA.uniforms["resolution"].value.set(
      1 / window.innerWidth,
      1 / window.innerHeight
    );
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
    const offset = new THREE.Vector3(20, 30, 30); //hardcoded offset - this work as a spring arm(local space)
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
