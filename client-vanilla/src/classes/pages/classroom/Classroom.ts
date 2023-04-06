import Page from "../Page";

export default class ClassRoom extends Page {
  constructor(title: string) {
    super(title);
  }

  public render(): string {
    return `
      <div id="app-container">
        <canvas id="app"></canvas>
      </div>
    `;
  }
}
