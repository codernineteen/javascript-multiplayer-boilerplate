import Page from "../Page";
import axios from "axios";

export default class Login extends Page {
  constructor(title: string) {
    super(title);
  }

  public async sendRequest() {
    window.open(`http://127.0.0.1:5555/auth/google/callback`, "_self");
  }

  public render(): string {
    return `
        <h1>This is Login page</h1>
        <button class="login-button">
            <img src="/logos/google-login.png" width="30px" height="30px"/>
        </button>
      `;
  }
}
