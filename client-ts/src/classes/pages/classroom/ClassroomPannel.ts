import Page from "../Page";

export default class ClassroomPannel extends Page {
  constructor(title: string) {
    super(title);
  }

  public render(): string {
    return `
        <a href="/classroom726">726호</a>
    `;
  }
}
