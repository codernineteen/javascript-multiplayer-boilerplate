//runtime
import Canvas from "./classes/scene/Canvas";
import Character from "./classes/character/Character";
import { CreateARoom } from "./modules/createRoom";
import GLTFModels from "./classes/models/GLTFModels";
import { Clock } from "three";
import { io, Socket } from "socket.io-client";

export default class VirtualClassroom {
  private canvas: Canvas;
  private gltfInstance: GLTFModels;
  private player: Character;
  private clock: THREE.Clock;
  private socket: Socket;
  //private socket:

  constructor() {
    this.canvas = new Canvas();
    this.gltfInstance = new GLTFModels();
    this.player = new Character();
    this.clock = new Clock();
    this.socket = io("http://localhost:5555", { transports: ["websocket"] });
  }

  Run() {
    this.socket.on("connect", () => {});

    const room = CreateARoom();
    this.player.LoadFromGLTFModels(this.gltfInstance);
    const playerMesh = this.player.Mesh;

    this.canvas.scene.add(room, playerMesh);
    let previousTime = 0;

    const EventTick = () => {
      requestAnimationFrame(EventTick);

      const elapsedTime = this.clock.getElapsedTime();
      const deltaTime = elapsedTime - previousTime;
      previousTime = elapsedTime;

      this.canvas.renderer.render(this.canvas.scene, this.canvas.camera);
      this.player.Controller.Update(deltaTime);
      this.canvas.topViewCamera.Update(deltaTime, this.player);
      //this.canvas.controls.update(); <- orbit control update(for debug)
    };

    EventTick();
  }
}
