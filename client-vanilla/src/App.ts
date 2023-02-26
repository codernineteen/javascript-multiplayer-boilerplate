//runtime
import * as THREE from "three";
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
import UserInterface from "./classes/ui/UserInterface";

export type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

export default class VirtualClassroom {
  private canvas: Canvas;
  private gltfInstance: GLTFModels;
  private controlledPlayer: Character | null;
  private players: { [id: string]: Character };
  private clock: THREE.Clock;
  private socket: SocketType;
  private ui: UserInterface;

  constructor() {
    this.socket = io("http://localhost:3333", { transports: ["websocket"] });
    this.canvas = new Canvas();
    this.clock = new Clock();
    this.gltfInstance = new GLTFModels();
    this.controlledPlayer = null;
    this.players = {};
    new MouseRaycaster(this.canvas); // create member later if it needed
    this.ui = new UserInterface(this.socket);

    //Create level
    const Room = CreateARoom();
    this.canvas.scene.add(Room);

    this.socket.on("connect", () => {});

    //initialize a player which in controlled by current client
    this.socket.on("Initialize", (data) => {
      const { userId, pos, quat } = data;
      const newPlayer = new Character(this.socket, userId, false);
      newPlayer.LoadFromGLTFModels(this.gltfInstance);
      newPlayer.Mesh.position.set(...pos);
      newPlayer.Mesh.quaternion.set(...quat);
      this.canvas.scene.add(newPlayer.Mesh);
      this.controlledPlayer = newPlayer;
      //User input on/off for chat focus
      this.ui.chatBox.OnFocusInHandler(this.controlledPlayer);
      this.ui.chatBox.OnFocusOutHandler(this.controlledPlayer);
    });

    //listening on movement user's input and send it to socket server
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

    this.socket.on("ResponseMessage", (message, id) => {
      this.ui.chatBox.CreateMessageList(message, id);
    });
  }

  Run() {
    let previousTime = 0;

    const EventTick = () => {
      requestAnimationFrame(EventTick);

      const elapsedTime = this.clock.getElapsedTime();
      const deltaTime = elapsedTime - previousTime;
      previousTime = elapsedTime;

      if (this.controlledPlayer) {
        this.controlledPlayer.Controller.Update(deltaTime);
        this.canvas.topViewCamera.Update(deltaTime, this.controlledPlayer);
        for (let userId in this.players) {
          this.players[userId].Controller.Update(deltaTime);
        }
      }

      this.canvas.composer.render(deltaTime);
      //This is the most important tip.
      //When we use composer, we only need to use render method of composer because we already passed scene and camera component to render pass
      //If we render twice(composer and renderer), we can't see the post processing effects because renderer override render pass's rendering
      //this.canvas.renderer.render(this.canvas.scene, this.canvas.camera);
    };

    EventTick();
  }
}
