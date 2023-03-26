import Page from "../Page";

export default class Login extends Page {
  constructor(title: string) {
    super(title);
  }

  public async sendLoginRequest() {
    window.location.href = `http://localhost:3333/auth/google/callback`;
  }

  public async logOut() {
    window.location.href = `http://localhost:3333/logout`;
  }

  public render(): string {
    return `
        <h1>This is Login page</h1>
      `;
  }
}
