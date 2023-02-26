import { Object3D, Raycaster, Vector2, Event, Group } from "three";
import Canvas from "../scene/Canvas";

export default class MouseRaycaster {
  public raycaster: Raycaster;
  public pointer: Vector2;
  public selectedObjects: Object3D<Event>[];

  constructor(public canvas: Canvas) {
    this.raycaster = new Raycaster();
    this.pointer = new Vector2();

    this.canvas.renderer.domElement.addEventListener(
      "pointermove",
      this.OnPointerMove.bind(this)
    );
    this.selectedObjects = [];
  }

  OnPointerMove(evt: PointerEvent) {
    if (evt.isPrimary === false) return; // what's this?

    this.pointer.x = (evt.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(evt.clientY / window.innerHeight) * 2 + 1;

    this.CheckIntersection();
  }

  AddSelectedObject(group: Group) {
    this.selectedObjects = [];
    this.selectedObjects.push(group.children[0]); // group : [gltf, cylinder]
  }

  CheckIntersection() {
    this.raycaster.setFromCamera(
      {
        x: this.pointer.x,
        y: this.pointer.y,
      },
      this.canvas.camera
    );

    const intersects = this.raycaster.intersectObjects(
      this.canvas.scene.children.slice(4), // detection on only remote characters except player
      true
    );
    if (intersects.length > 0) {
      const selectedGroup = intersects[0].object.parent as Group;
      this.AddSelectedObject(selectedGroup);
      this.canvas.outlinePass.selectedObjects = this.selectedObjects;
    } else {
      this.canvas.outlinePass.selectedObjects = [];
    }
  }
}
