import Page from "../Page";

export default class Home extends Page {
  constructor(title: string) {
    super(title);
  }

  public render(): string {
    return `
        <h1>중앙대학교 가상 강의실</h1>
        <p>가상 강의실을 마음껏 즐겨보세요!</p>
      `;
  }
}
