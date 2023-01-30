export default class ChatBox {
  public inputElement: HTMLElement | null;
  public formElement: HTMLElement | null;
  public message: string;

  constructor() {
    this.message = "";
    this.inputElement = document.getElementById("chat-input");
    this.formElement = document.getElementById("chat-form");
  }

  OnSubmitHandler() {
    this.formElement?.addEventListener("submit", (evt) => {
      console.log("need to emit socket message");
    });
  }

  OnChangeHandler() {
    this.inputElement?.addEventListener("change", (evt) => {
      console.log(evt.target);
    });
  }
}
