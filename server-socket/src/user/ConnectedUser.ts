import { Socket } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
  Vector3Array,
} from "../types/socket-server-types";

export default class ConnectedUser {
  public pos: Vector3Array;
  public id: number;

  constructor(
    public socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    public clients: []
  ) {
    this.pos = [Math.random() * 5, 0, Math.random() * 5];
    this.id = clients.length;

    //Listen on 'Pos' event
    this.socket.on("Pos", (data) => {
      this.pos = [...data.pos];
      this.Broadcast();
    });
    this.Broadcast();
  }

  Broadcast() {
    const data: SocketData = { id: this.id, pos: this.pos };
    //Emit an event to users listening on 'Pos' event
    this.socket.emit("Pos", data);
  }
}
