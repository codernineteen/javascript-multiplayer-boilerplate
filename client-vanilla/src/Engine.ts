//packages
import * as THREE from "three";
import Canvas from "./classes/scene/Canvas";
import Character from "./classes/character/Character";
import GLTFModels from "./classes/models/GLTFModels";
import MouseRaycaster from "./classes/events/MouseRaycaster";
import { CreateARoom } from "./modules/createRoom";

export default class Engine {
  private canvas: Canvas;
  private gltfInstance: GLTFModels;
  private controlledPlayer: Character | null;
  private clock: THREE.Clock;
  //boolean states. b is for convention

  constructor(public canvasParent: HTMLDivElement) {
    this.canvas = new Canvas(canvasParent);
    this.clock = new THREE.Clock();
    this.gltfInstance = new GLTFModels();
    this.controlledPlayer = null;
    //this.players = {};
    new MouseRaycaster(this.canvas); // create member later if it needed

    //Create level
    const Room = CreateARoom();
    this.canvas.scene.add(Room);

    // this.socket.on("connect", () => {});

    //initialize a player which in controlled by current client
    const newPlayer = new Character();
    newPlayer.LoadFromGLTFModels(this.gltfInstance);
    newPlayer.Mesh.position.set(0, 0, 0);
    newPlayer.Mesh.quaternion.set(0, 0, 0, 1);
    this.canvas.scene.add(newPlayer.Mesh);
    this.controlledPlayer = newPlayer;
  }

  Run() {
    const EventTick = () => {
      requestAnimationFrame(EventTick);

      const delta = this.clock.getDelta();

      if (this.controlledPlayer) {
        this.controlledPlayer.Controller.Update(delta);
        this.canvas.topViewCamera.Update(delta, this.controlledPlayer);
      }

      this.canvas.composer.render(delta);
    };

    EventTick();
  }
}
