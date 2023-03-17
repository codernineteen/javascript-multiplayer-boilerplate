import React, { Component, useEffect, useRef } from "react";
import * as THREE from "three";
import Canvas from "../classes/scene/Canvas";
import Character from "../classes/character/Character";
import GLTFModels from "../classes/models/GLTFModels";
import MouseRaycaster from "../classes/events/MouseRaycaster";
import NetworkPlayerController from "../classes/character/controller/NetworkPlayerController";
import UserInterface from "../classes/ui/UserInterface";
//import { CreateARoom } from "./modules/createRoom";
import { Clock } from "three";
//udp server modules
import { geckos } from "@geckos.io/client";
import type { ClientChannel } from "@geckos.io/client";
import type { TransformPacket } from "../types/PlayerType";

//types for udp channel data
export type ChatDataType = { message: string; id: string };

interface Props {
  width: number;
  height: number;
}

const ThreeScene = ({ width, height }: Props) => {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    //gecko server should use 127.0.0.1 for local environment instead of localhost
    //Connect app to udp server
    const channel = geckos({ port: 5555, url: "http://127.0.0.1" });
    const canvas = new Canvas();
    const clock = new Clock();
    const gltfInstance = new GLTFModels();
    const players = new Map();
    const ui = new UserInterface(channel);
    let controlledPlayer: Character | null = null;
    new MouseRaycaster(canvas); // create member later if it needed

    mount.current?.appendChild(canvas.renderer.domElement);

    //channel connect
    let channelId;
    channel.onConnect((error) => {
      //if there is any connection error, stop application
      if (error) {
        console.log("UDP channel connection error: " + error.message);
        return;
      }
      window.addEventListener("beforeunload", () => {
        channelId = channel.id;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://127.0.0.1:5555/leave");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({ key: channelId }));
      });
    });

    //initialize a player which in controlled by current client
    channel.on("initialize", (data) => {
      const { id, pos, quat } = data as TransformPacket;
      const newPlayer = new Character(channel, id, false);
      newPlayer.LoadFromGLTFModels(gltfInstance);
      newPlayer.Mesh.position.set(...pos);
      newPlayer.Mesh.quaternion.set(...quat);
      canvas.scene.add(newPlayer.Mesh);
      //canvas.scene.add(Room); // create level after player initialized

      /**GRID helper */
      const size = 1000;
      const division = 50;
      const gridHelper = new THREE.GridHelper(size, division);
      canvas.scene.add(gridHelper);

      controlledPlayer = newPlayer;
      //User input on/off for chat focus
      ui.chatBox.OnFocusInHandler(controlledPlayer);
      ui.chatBox.OnFocusOutHandler(controlledPlayer);
    });

    //listening on movement user's input and send it to socket server
    channel.on("transform update", (data) => {
      const { id, pos, quat, state, input } = data as TransformPacket;

      if (!players.has(id)) {
        const remotePlayer = new Character(channel, id, true, input);
        remotePlayer.LoadFromGLTFModels(gltfInstance);
        remotePlayer.Mesh.position.set(...pos);
        remotePlayer.Mesh.quaternion.set(...quat);
        canvas.scene.add(remotePlayer.Mesh);
        players.set(id, remotePlayer);
      } else {
        const networkController = players.get(id)
          ?.Controller as NetworkPlayerController;
        players.get(id)?.Mesh.position.set(...pos);
        players.get(id)?.Mesh.quaternion.set(...quat);
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
    channel.on("chat message", (data: Object) => {
      const chatData = data as ChatDataType;
      ui.chatBox.CreateMessageList(chatData.message, chatData.id);
    });

    //Cleanup mesh when a user logout from application
    channel.on("cleanup mesh", (userId) => {
      const player = players.get(userId as string);
      if (player) {
        canvas.scene.remove(player.Mesh);
        ui.chatBox.CreateLeaveMessage(userId as string);
        players.delete(userId as string);
      }
    });

    const EventTick = () => {
      requestAnimationFrame(EventTick);

      //calculate delta time
      const deltaTime = clock.getDelta();
      if (controlledPlayer) {
        controlledPlayer.Controller.Update(deltaTime);
        canvas.topViewCamera.Update(deltaTime, controlledPlayer);
        //can't iterate map with in keyword
        for (let userId of players.keys()) {
          players.get(userId)?.Controller.Update(deltaTime);
        }
      }

      //composer render(render pass handle this)
      canvas.composer.render(deltaTime);
      //This is the most important tip.
      //When we use composer, we only need to use render method of composer because we already passed scene and camera component to render pass
      //If we render twice(composer and renderer), we can't see the post processing effects because renderer override render pass's rendering
      //canvas.renderer.render(canvas.scene, canvas.camera); <-- Don't use this duplicate render with composer
    };

    EventTick();
  }, []);

  return <div ref={mount} />;
};

export default ThreeScene;
