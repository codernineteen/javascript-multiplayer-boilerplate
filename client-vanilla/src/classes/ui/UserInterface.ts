import ChatBox from "./ChatBox";
import { SocketType } from "../../router/Router";

export default class UserInterface {
  public chatBox: ChatBox;

  constructor(public socket: SocketType) {
    this.chatBox = new ChatBox(socket);
  }
}
