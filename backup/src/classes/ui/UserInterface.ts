import ChatBox from "./ChatBox";
import { SocketType } from "../../App";

export default class UserInterface {
  public chatBox: ChatBox;

  constructor(public socket: SocketType) {
    this.chatBox = new ChatBox(socket);
  }
}
