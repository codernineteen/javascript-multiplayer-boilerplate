import ChatBox from "./ChatBox";

export default class UserInterface {
  public chatBox: ChatBox;

  constructor() {
    this.chatBox = new ChatBox();
  }
}
