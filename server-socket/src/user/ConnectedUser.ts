//import { Quaternion, Vector3 } from "three";
import { Socket } from "socket.io";
import {
  ClientToServerEvents,
  KeyInput,
  ServerToClientEvents,
} from "../types/socket-server-types";

export default class ConnectedUser {
  public userId: string;
  public pos: [x: number, y: number, z: number];
  public quat: [x: number, y: number, z: number, w: number];
  public state: string | undefined;
  public input: KeyInput;

  constructor(
    public socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    public clients: { [id: string]: ConnectedUser }
  ) {
    this.userId = socket.id;
    this.pos = [Math.random() * 5, 0, Math.random() * 5]; // random spawn position
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

    this.socket.emit("Initialize", {
      userId: this.userId,
      pos: this.pos,
      quat: this.quat,
      state: this.state,
      input: this.input,
    });

    //Request from client
    this.socket.on("TransformUpdate", (data) => {
      const { pos, quat, state, input } = data;
      this.pos = pos;
      this.quat = quat;
      this.state = state;
      this.input = input;
      this.Broadcast();
    });

    this.Broadcast(); // broadcast when a new user constructed
  }

  Broadcast() {
    //Emit an event to users listening on 'Pos' event
    this.socket.broadcast.emit("TransformUpdate", {
      userId: this.userId,
      pos: this.pos,
      quat: this.quat,
      state: this.state,
      input: this.input,
    });
  }
}
