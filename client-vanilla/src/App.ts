//runtime
import Canvas from "./classes/scene/Canvas";
import Character from "./classes/character/Character";
import GLTFModels from "./classes/models/GLTFModels";
import MouseRaycaster from "./classes/events/MouseRaycaster";
import { CreateARoom } from "./modules/createRoom";
import { Clock } from "three";
import { io, Socket } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "./types/socket-client-types";
import NetworkPlayerController from "./classes/character/controller/NetworkPlayerController";
import * as THREE from "three";

export type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

export default class VirtualClassroom {
  private canvas: Canvas;
  private gltfInstance: GLTFModels;
  private controlledPlayer: Character | null;
  private players: { [id: string]: Character };
  private mouseRaycaster: MouseRaycaster;
  private clock: THREE.Clock;
  private socket: SocketType;
  //private socket:

  constructor() {
    this.socket = io("http://localhost:5555", { transports: ["websocket"] });
    this.canvas = new Canvas();
    this.gltfInstance = new GLTFModels();
    this.controlledPlayer = null;
    this.players = {};
    this.mouseRaycaster = new MouseRaycaster(this.canvas.renderer);
    this.clock = new Clock();

    const Room = CreateARoom();
    this.canvas.scene.add(Room);

    this.socket.on("connect", () => {});
    this.socket.on("Initialize", (data) => {
      const { userId, pos, quat } = data;
      const newPlayer = new Character(this.socket, userId, false);
      newPlayer.LoadFromGLTFModels(this.gltfInstance);
      newPlayer.Mesh.position.set(...pos);
      newPlayer.Mesh.quaternion.set(...quat);
      this.canvas.scene.add(newPlayer.Mesh);
      this.controlledPlayer = newPlayer;
    });

    this.socket.on("ResponseMessage", (message) => {
      console.log(message);
    });

    this.socket.on("TransformUpdate", (data) => {
      const { userId, pos, quat, state, input } = data;

      if (!(userId in this.players)) {
        const remotePlayer = new Character(this.socket, userId, true, input);
        remotePlayer.LoadFromGLTFModels(this.gltfInstance);
        remotePlayer.Mesh.position.set(...pos);
        remotePlayer.Mesh.quaternion.set(...quat);
        this.canvas.scene.add(remotePlayer.Mesh);
        this.players[userId] = remotePlayer;
      } else {
        const networkController = this.players[userId]
          .Controller as NetworkPlayerController;
        this.players[userId].Mesh.position.set(...pos);
        this.players[userId].Mesh.quaternion.set(...quat);
        networkController.input.Forward = input.Forward;
        networkController.input.Backward = input.Backward;
        networkController.input.Left = input.Left;
        networkController.input.Right = input.Right;
        networkController.input.Shift = input.Shift;
        const networkStateMachine = networkController.stateMachine;
        if (state) networkStateMachine.UpdateState(state);
      }
    });

    this.socket.on("CleanUpMesh", (userId: string) => {
      this.canvas.scene.remove(this.players[userId].Mesh);
      delete this.players[userId];
    });
  }

  Run() {
    let previousTime = 0;

    const EventTick = () => {
      requestAnimationFrame(EventTick);

      const elapsedTime = this.clock.getElapsedTime();
      const deltaTime = elapsedTime - previousTime;
      previousTime = elapsedTime;

      this.mouseRaycaster.HoverObject(this.canvas);

      if (this.controlledPlayer) {
        this.controlledPlayer.Controller.Update(deltaTime);
        this.canvas.topViewCamera.Update(deltaTime, this.controlledPlayer);
        for (let userId in this.players) {
          this.players[userId].Controller.Update(deltaTime);
        }
      }

      this.canvas.renderer.render(this.canvas.scene, this.canvas.camera);
    };

    EventTick();
  }
}
