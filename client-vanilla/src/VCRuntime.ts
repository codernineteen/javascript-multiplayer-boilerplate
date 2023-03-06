//client modules
import * as THREE from "three";
import Canvas from "./classes/scene/Canvas";
import Character from "./classes/character/Character";
import GLTFModels from "./classes/models/GLTFModels";
import MouseRaycaster from "./classes/events/MouseRaycaster";
import NetworkPlayerController from "./classes/character/controller/NetworkPlayerController";
import UserInterface from "./classes/ui/UserInterface";
import { CreateARoom } from "./modules/createRoom";
import { Clock } from "three";
//udp server modules
import { geckos } from "@geckos.io/client";
import type { ClientChannel } from "@geckos.io/client";
import type { TransformPacket } from "./types/PlayerType";

//types for udp channel data
export type ChatDataType = { message: string; id: string };

export default class VirtualClassroom {
  private canvas: Canvas;
  private gltfInstance: GLTFModels;
  private controlledPlayer: Character | null;
  private players: Map<string, Character>;
  private clock: THREE.Clock;
  //private socket: SocketType;
  private channel: ClientChannel;
  private ui: UserInterface;

  constructor() {
    //production server url : https://virtual-classroom-backend.onrender.com/
    //dev server (socket) : localhost:3333
    //dev server (gecko) : 127.0.0.1:5555;
    //gecko server should use 127.0.0.1 for local environment instead of localhost
    //Connect app to udp server
    this.channel = geckos({ port: 5555, url: "http://127.0.0.1" });
    this.canvas = new Canvas();
    this.clock = new Clock();
    this.gltfInstance = new GLTFModels();
    this.controlledPlayer = null;
    this.players = new Map();
    this.ui = new UserInterface(this.channel);
    new MouseRaycaster(this.canvas); // create member later if it needed
    //Create level
    const Room = CreateARoom();

    // window.addEventListener("beforeunload", () => {
    //   // Send an HTTP request to your server to notify it that the tab has been closed
    // });

    //channel connect
    let channelId;
    this.channel.onConnect((error) => {
      //if there is any connection error, stop application
      if (error) {
        console.log("UDP channel connection error: " + error.message);
        return;
      }
      window.addEventListener("beforeunload", () => {
        channelId = this.channel.id;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://127.0.0.1:5555/leave");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({ key: channelId }));
      });
    });

    //initialize a player which in controlled by current client
    this.channel.on("initialize", (data) => {
      const { id, pos, quat } = data as TransformPacket;
      const newPlayer = new Character(this.channel, id, false);
      newPlayer.LoadFromGLTFModels(this.gltfInstance);
      newPlayer.Mesh.position.set(...pos);
      newPlayer.Mesh.quaternion.set(...quat);
      this.canvas.scene.add(newPlayer.Mesh);
      this.canvas.scene.add(Room); // create level after player initialized
      this.controlledPlayer = newPlayer;
      //User input on/off for chat focus
      this.ui.chatBox.OnFocusInHandler(this.controlledPlayer);
      this.ui.chatBox.OnFocusOutHandler(this.controlledPlayer);
    });

    //listening on movement user's input and send it to socket server
    this.channel.on("transform update", (data) => {
      const { id, pos, quat, state, input } = data as TransformPacket;

      if (!this.players.has(id)) {
        const remotePlayer = new Character(this.channel, id, true, input);
        remotePlayer.LoadFromGLTFModels(this.gltfInstance);
        remotePlayer.Mesh.position.set(...pos);
        remotePlayer.Mesh.quaternion.set(...quat);
        this.canvas.scene.add(remotePlayer.Mesh);
        this.players.set(id, remotePlayer);
      } else {
        const networkController = this.players.get(id)
          ?.Controller as NetworkPlayerController;
        this.players.get(id)?.Mesh.position.set(...pos);
        this.players.get(id)?.Mesh.quaternion.set(...quat);
        networkController.input.Forward = input.Forward;
        networkController.input.Backward = input.Backward;
        networkController.input.Left = input.Left;
        networkController.input.Right = input.Right;
        networkController.input.Shift = input.Shift;
        const networkStateMachine = networkController.stateMachine;
        if (state) networkStateMachine.UpdateState(state);
      }
    });

    //listen chat message from server
    this.channel.on("chat message", (data: Object) => {
      const chatData = data as ChatDataType;
      this.ui.chatBox.CreateMessageList(chatData.message, chatData.id);
    });

    //Cleanup mesh when a user logout from application
    this.channel.on("cleanup mesh", (userId) => {
      const player = this.players.get(userId as string);
      if (player) {
        this.canvas.scene.remove(player.Mesh);
        this.ui.chatBox.CreateLeaveMessage(userId as string);
        this.players.delete(userId as string);
      }
    });
  }

  Run() {
    let previousTime = 0;

    const EventTick = () => {
      requestAnimationFrame(EventTick);

      //calculate delta time
      const elapsedTime = this.clock.getElapsedTime();
      const deltaTime = elapsedTime - previousTime;
      previousTime = elapsedTime;

      if (this.controlledPlayer) {
        this.controlledPlayer.Controller.Update(deltaTime);
        this.canvas.topViewCamera.Update(deltaTime, this.controlledPlayer);
        //can't iterate map with in keyword
        for (let userId of this.players.keys()) {
          this.players.get(userId)?.Controller.Update(deltaTime);
        }
      }

      //composer render(render pass handle this)
      this.canvas.composer.render(deltaTime);
      //This is the most important tip.
      //When we use composer, we only need to use render method of composer because we already passed scene and camera component to render pass
      //If we render twice(composer and renderer), we can't see the post processing effects because renderer override render pass's rendering
      //this.canvas.renderer.render(this.canvas.scene, this.canvas.camera); <-- Don't use this duplicate render with composer
    };

    EventTick();
  }

  get Channel() {
    return this.channel;
  }
}
