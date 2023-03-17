import Page from "../Page";

export default class Login extends Page {
  constructor(title: string) {
    super(title);
  }

  public async sendLoginRequest() {
    window.location.href = `http://127.0.0.1:5555/auth/google/callback`;
  }

  public async logOut() {
    window.location.href = `http://127.0.0.1:5555/logout`;
  }

  public render(): string {
    return `
        <h1>This is Login page</h1>
      `;
  }
}
