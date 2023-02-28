import ChatBox from "./ChatBox";
import type { ClientChannel } from "@geckos.io/client";

export default class UserInterface {
  public chatBox: ChatBox;

  constructor(public channel: ClientChannel) {
    this.chatBox = new ChatBox(channel);
  }
}
