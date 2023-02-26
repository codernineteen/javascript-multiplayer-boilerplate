import { Raycaster, Vector2, WebGLRenderer } from "three";
import Canvas from "../scene/Canvas";

export default class MouseRaycaster {
  public raycaster: Raycaster;
  public pointer: Vector2;
  public clickableMaterial: any;
  constructor(public renderer: WebGLRenderer) {
    this.raycaster = new Raycaster();
    this.pointer = new Vector2();

    document.addEventListener(
      "mousemove",
      (evt) => {
        this.pointer.x = (evt.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(evt.clientY / window.innerHeight) * 2 + 1;
      },
      false
    );
  }

  HoverObject(canvas: Canvas) {
    this.raycaster.setFromCamera(
      {
        x: this.pointer.x,
        y: this.pointer.y,
      },
      canvas.camera
    );

    // for (let id in players) {
    //   const intersects = this.raycaster.intersectObjects(
    //     players[id].Mesh.children
    //   );
    //   if (intersects.length > 0) console.log(intersects);
    // }
    const intersects = this.raycaster.intersectObjects(
      canvas.scene.children.slice(3)
    );
    if (intersects.length > 0) {
      return intersects;
    } else {
      return null;
    }
  }
}
