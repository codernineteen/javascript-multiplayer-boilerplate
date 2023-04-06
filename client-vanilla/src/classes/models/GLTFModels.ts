import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import { Group } from "three";
//types
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

export default class GLTFModels {
  public models: {
    [name: string]: {
      loader: GLTFLoader;
      asset: GLTF;
      queue: Array<(gltfObject: GLTF) => void> | null;
    };
  };
  public textures: any;

  constructor() {
    this.models = {};
  }

  LoadGLTFModel(
    path: string,
    name: string,
    onLoadCallback: (gltfObject: GLTF) => void
  ) {
    if (!(name in this.models)) {
      const loader = new GLTFLoader();

      loader.load(path, (gltf) => {
        this.models[name] = {
          loader,
          asset: gltf,
          queue: [onLoadCallback],
        };

        const queue = this.models[name].queue; //waiting queues;
        this.models[name].queue = null; // after declare waiting queues, change queue property
        //iterate callbacks
        if (queue) {
          for (let q of queue) {
            //cloning gltf asset
            const clone = { ...gltf };
            clone.scene = SkeletonUtils.clone(clone.scene) as Group;
            q(clone);
          }
        }
      });
    } else if (this.models[name].asset == null) {
      this.models[name].queue?.push(onLoadCallback);
    } else {
      const clone = { ...this.models[name].asset };

      clone.scene = SkeletonUtils.clone(clone.scene) as Group;
      onLoadCallback(clone);
    }
  }
}
