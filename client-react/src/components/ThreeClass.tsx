//react
import { Component } from "react";
//패키지
import * as THREE from "three";
import { Clock } from "three";
import axios from "axios";
//클래스
import Canvas from "../classes/scene/Canvas";
import Character from "../classes/character/Character";
import GLTFModels from "../classes/models/GLTFModels";
import MouseRaycaster from "../classes/events/MouseRaycaster";
import NetworkPlayerController from "../classes/character/controller/NetworkPlayerController";
import UserInterface from "../classes/ui/UserInterface";
//UDP 서버 패키지
import { geckos } from "@geckos.io/client";
//타입
import type { ClientChannel } from "@geckos.io/client";
import type { TransformPacket } from "../types/PlayerType";

export type ChatDataType = { message: string; id: string };

interface Props {
  width: number;
  height: number;
}

export default class ThreeClass extends Component {
  private channel: ClientChannel;
  private canvas: Canvas;
  private gltfInstance: GLTFModels;
  private controlledPlayer: Character | null;
  private players: Map<string, Character>;
  private clock: THREE.Clock;
  private ui: UserInterface;

  constructor(props: Props) {
    super(props);
    this.state = {};
    this.channel = geckos({ port: 5555, url: "http://127.0.0.1" });
    this.canvas = new Canvas();
    this.clock = new Clock();
    this.gltfInstance = new GLTFModels();
    this.controlledPlayer = null;
    this.players = new Map();
    this.ui = new UserInterface(this.channel);
    new MouseRaycaster(this.canvas);

    this.channel.onConnect((error) => {
      //채널 연결에 문제가 있으면, 어플리케이션 중단
      if (error) {
        console.log("UDP channel connection error: " + error.message);
        return;
      }
      window.addEventListener("beforeunload", () => {
        axios.post("http://127.0.0.1:5555/leave", { key: this.channel.id });
      });
    });
  }

  componentDidMount(): void {
    this.channel.on("initialize", (data) => {
      const { id, pos, quat } = data as TransformPacket;
      const newPlayer = new Character(this.channel, id, false);
      newPlayer.LoadFromGLTFModels(this.gltfInstance);
      newPlayer.Mesh.position.set(...pos);
      newPlayer.Mesh.quaternion.set(...quat);
      this.canvas.scene.add(newPlayer.Mesh);

      /**GRID helper */
      const size = 1000;
      const division = 50;
      const gridHelper = new THREE.GridHelper(size, division);
      this.canvas.scene.add(gridHelper);

      this.controlledPlayer = newPlayer;
      //채팅창 입력에 포커싱되면 움짐임 이동을 on/off
      this.ui.chatBox.OnFocusInHandler(this.controlledPlayer);
      this.ui.chatBox.OnFocusOutHandler(this.controlledPlayer);
    });

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

    const EventTick = () => {
      requestAnimationFrame(EventTick);

      //calculate delta time
      const deltaTime = this.clock.getDelta();

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

  render() {
    return <div>{this.canvas.renderer.domElement}</div>;
  }
}
