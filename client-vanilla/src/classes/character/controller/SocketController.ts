import { Socket, io } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../../../types/socket-client-types";

export default class SocketController {
  public id: number | null;
  public socket: Socket<ServerToClientEvents, ClientToServerEvents>;

  constructor() {
    this.id = null;

    this.socket = io("http://localhost:5555", {
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      console.log(this.socket.id + " connected");
    });

    this.socket.on("disconnect", () => {
      console.log(this.socket.id + " disconnected");
    });
  }

  //transform : position, rotation, scale
  RequestTransformUpdate(transform: any) {
    this.socket.emit("TransformUpdate", transform);
  }
}
