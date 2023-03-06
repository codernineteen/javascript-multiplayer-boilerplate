import type { KeyInput, TransformPacket } from "../types/PlayerType";
import type { ChannelId, Data, ServerChannel } from "@geckos.io/server";

export default class Player {
  private id: ChannelId;
  private pos: [x: number, y: number, z: number];
  private quat: [x: number, y: number, z: number, w: number];
  private state: string | undefined;
  private input: KeyInput;

  constructor(public channel: ServerChannel) {
    this.id = channel.id;
    this.pos = [Math.random() * 5, 0, Math.random() * 5];
    this.quat = [0, 0, 0, 1];
    this.state = undefined;
    this.input = {
      Forward: false,
      Backward: false,
      Left: false,
      Right: false,
      Shift: false,
      Space: false,
    };

    channel.emit("initialize", {
      id: this.id,
      pos: this.pos,
      quat: this.quat,
      state: this.state,
      input: this.input,
    });

    channel.on("transform update", (data: Data) => {
      const { pos, quat, state, input } = data as TransformPacket;
      this.pos = pos;
      this.quat = quat;
      this.state = state;
      this.input = input;
      this.Broadcast();
    });

    this.Broadcast();
  }

  Broadcast() {
    this.channel.broadcast.emit("transform update", {
      id: this.id,
      pos: this.pos,
      quat: this.quat,
      state: this.state,
      input: this.input,
    });
  }

  CleanUp() {
    this.channel.broadcast.emit("cleanup mesh", this.id as string);
  }
}
