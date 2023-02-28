import Character from "../character/Character";
import PlayerInput from "../character/inputs/PlayerInput";
import type { ClientChannel } from "@geckos.io/client";

export default class ChatBox {
  public inputElement: HTMLInputElement | null;
  public formElement: HTMLFormElement | null;
  public messageList: HTMLElement | null;
  public message: string;

  constructor(public channel: ClientChannel) {
    this.message = "";
    this.inputElement = document.getElementById(
      "chat-input"
    ) as HTMLInputElement;
    this.formElement = document.getElementById("chat-form") as HTMLFormElement;
    this.messageList = document.getElementById("chat-list");

    this.OnChangeHandler();
    this.OnSubmitHandler();
  }

  OnSubmitHandler() {
    this.formElement?.addEventListener("submit", (evt) => {
      evt.preventDefault();
      this.channel.emit("chat message", {
        message: this.message,
        id: this.channel.id,
      });
      if (this.inputElement) this.inputElement.value = "";
    });
  }

  OnChangeHandler() {
    this.inputElement?.addEventListener("change", (evt: any) => {
      this.message = evt.target ? (evt.target.value as string) : "";
    });
  }
  //When an input focused, disable user movement key input
  OnFocusInHandler(controlledPlayer: Character) {
    this.inputElement?.addEventListener("focusin", () => {
      const input = controlledPlayer.Controller.input as PlayerInput;
      input.RemoveKeydownHandler();
    });
  }
  //When focus out, enable user movement again
  OnFocusOutHandler(controlledPlayer: Character) {
    this.inputElement?.addEventListener("focusout", () => {
      const input = controlledPlayer.Controller.input as PlayerInput;
      input.EnrollKeyDownHandler();
    });
  }

  CreateMessageList(message: string, id: string) {
    const listItem = document.createElement("li");
    listItem.innerText = `${id.slice(0, 5)} : ${message}`;
    listItem.className = "chat-list-item";
    this.messageList?.appendChild(listItem);
  }

  CreateLeaveMessage(id: string) {
    const listItem = document.createElement("li");
    listItem.innerText = `${id.slice(0, 5)}가 퇴장하였습니다.`;
    listItem.className = "chat-list-item";
    listItem.style.color = "blue";
    this.messageList?.appendChild(listItem);
  }
}
