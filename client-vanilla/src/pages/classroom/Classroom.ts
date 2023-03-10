import Page from "../Page";

export default class ClassRoom extends Page {
  constructor(title: string) {
    super(title);
  }

  public render(): string {
    return `
        <div id="app-container">
        <!-- Client -->
        <canvas id="app"></canvas>
    
        <!-- UI -->
        <div id="chat-box">
        <div id="chat-list-container">
            <ul id="chat-list"></ul>
        </div>
            <div class="border-line"></div>
                <form id="chat-form" action="">
                    <div class="input-section">
                    <input id="chat-input" type="text" value="" />
                    <button class="chat-button">
                        <div class="chat-button-text">전송</div>
                    </button>
                    </div>
                </form>
            </div>
        </div>
    `;
  }
}
