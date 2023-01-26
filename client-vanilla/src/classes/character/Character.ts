import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import GLTFModels from "../models/GLTFModels";
import PlayerController from "./controller/PlayerController";

interface AnimationObject {
  [animName: string]: {
    clip: THREE.AnimationClip;
    action: THREE.AnimationAction;
  } | null;
}

export default class Character {
  private group: THREE.Group;
  private bones: any;
  private animMixer: THREE.AnimationMixer;
  private animations: AnimationObject;
  private controller: PlayerController;

  constructor() {
    this.group = new THREE.Group();
    this.bones = {};
    this.animMixer = new THREE.AnimationMixer(this.group); // empty actions at this moment
    this.animations = {};
    this.controller = new PlayerController(this); // give 'this' context to state machine
  }

  /**
   * This load function is deprecated
   */
  public LoadModels() {
    const loader = new GLTFLoader();
    loader.load(
      "models/testCharacter2.glb",
      //onLoad
      (gltf) => {
        gltf.scene.scale.setScalar(3);
        gltf.scene.traverse((obj: any) => {
          if (!obj.skeleton) {
            return;
          }
          for (let bone of obj.skeleton.bones) {
            this.bones[bone.name] = bone;
          }
        });

        gltf.scene.traverse((obj: any) => {
          obj.castShadow = true;
          obj.receiveShadow = true;
          if (obj.material && obj.material.map) {
            obj.material.map.encoding = THREE.sRGBEncoding;
          }
        });
        this.group.add(gltf.scene);
      }
    );
  }

  //use this load function instead
  /**
   * Load GLTF 3d model and add its scene to group mesh of Character instance
   * @param gltfModel gltfModel taking (path, name, loadCallback) as parameters. load callback becomes a queue and is executed inside of gltfModel instance
   */
  public LoadFromGLTFModels(gltfModel: GLTFModels) {
    gltfModel.LoadGLTFModel("models/testCharacter2.glb", "ybot", (gltf) => {
      const model = gltf.scene;
      model.scale.setScalar(3);

      model.traverse((obj: any) => {
        if (!obj.skeleton) {
          return;
        }
        for (let bone of obj.skeleton.bones) {
          this.bones[bone.name] = bone;
        }
      });
      model.rotation.y = Math.PI;
      this.group.add(model);

      this.group.traverse((obj: any) => {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material && obj.material.map) {
          obj.material.map.encoding = THREE.sRGBEncoding;
        }
      });

      const animations = gltf.animations;
      const animationsLength = animations.length;
      this.animMixer = new THREE.AnimationMixer(model);

      /**
       * Find animation by given name
       * @param animName animation name
       * @returns object { clip, action } to assign it into this.animations property
       */
      const FindAnimation = (animName: string) => {
        for (let i = 0; i < animationsLength; ++i) {
          if (animations[i].name == animName) {
            const clip = animations[i];
            const action = this.animMixer.clipAction(clip);
            return {
              clip,
              action,
            };
          }
        }

        return null;
      };

      this.animations["idle"] = FindAnimation("BreathingIdle");
      this.animations["walkForward"] = FindAnimation("WalkingInPlace");
      this.animations["runForward"] = FindAnimation("RunningInPlace");
      this.animations["walkBackward"] = FindAnimation("RunningBackward");
      this.animations["runBackward"] = FindAnimation("WalkingBackward");
    });
  }

  /**
   * return character group mesh
   */
  public get Mesh() {
    return this.group;
  }

  /**
   * return character animations
   */
  public get Animations() {
    return this.animations;
  }

  public get Controller() {
    return this.controller;
  }

  public get AnimMixer(): THREE.AnimationMixer {
    return this.animMixer;
  }
}
