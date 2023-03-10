import Page from "../Page";

export default class Home extends Page {
  constructor(title: string) {
    super(title);
  }

  public render(): string {
    return `
        <h1>Welcome to the Home Page</h1>
        <p>This is the home page content.</p>
      `;
  }
}
