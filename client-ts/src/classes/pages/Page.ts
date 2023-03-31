export default class Page {
  public title: string;

  constructor(title: string) {
    this.title = title;
  }

  public render(): string {
    return `
            <h1>Just page</h1>
        `;
  }
}
