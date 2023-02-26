import { SocketType } from "../../App";

export default class ChatBox {
  public inputElement: HTMLElement | null;
  public formElement: HTMLElement | null;
  public messageList: HTMLElement | null;
  public message: string;

  constructor(public socket: SocketType) {
    this.message = "";
    this.inputElement = document.getElementById("chat-input");
    this.formElement = document.getElementById("chat-form");
    this.messageList = document.getElementById("chat-list");

    this.OnChangeHandler();
    this.OnSubmitHandler();
  }

  OnSubmitHandler() {
    this.formElement?.addEventListener("submit", (evt) => {
      evt.preventDefault();
      this.socket.emit("RequestMessage", this.message);
    });
  }

  OnChangeHandler() {
    this.inputElement?.addEventListener("change", (evt: any) => {
      this.message = evt.target ? (evt.target.value as string) : "";
    });
  }

  CreateMessageList(message: string) {
    const listItem = document.createElement("li");
    listItem.innerText = message;
    listItem.className = "chat-list-item";
    this.messageList?.appendChild(listItem);
  }
}
