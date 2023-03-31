export default class SocketClient {
  public socket: WebSocket | null;
  public protocol: string;
  public wsUri: string;
  public room: string;
  public messageList: string[];

  constructor(public state: HTMLParagraphElement) {
    const { location } = window;

    this.protocol = location.protocol.startsWith("https") ? "wss" : "ws"; //If it is https , use wss. If not, use ws
    this.wsUri = `${this.protocol}://localhost:8080/ws`; //server listening connection on /ws
    this.socket = null;
    this.room = "main";
    this.messageList = [];
  }

  Connect() {
    this.Disconnect(); //a user can't connect twice

    console.log("connecting to socket...");

    this.socket = new WebSocket(this.wsUri);

    this.socket.onopen = () => {
      this.state.innerText = "Connect";
      this.state.style.backgroundColor = "rgba(0, 255, 3, 0.2)";
      this.state.style.color = "green";

      console.log("connected");
    };
    this.socket.addEventListener("message", (evt) => {
      console.log(evt.data);
    });

    this.socket.onclose = () => {
      console.log("disconnected");
      this.socket = null;
    };
  }

  Disconnect() {
    if (this.socket) {
      console.log("disconnecting...");
      this.socket.close();
      this.socket = null;
    }
  }

  EmitMessage(event: String, data: String | RTCSessionDescriptionInit | null) {
    if (this.socket) {
      switch (event) {
        case "text":
          this.socket.send(`${data}`);
          break;
        case "offer":
          this.socket.send(``);
          break;

        default:
          if (data) {
            this.socket.send(`/${event} ${data}`);
          } else {
            this.socket.send(`/${event}`);
          }
      }
    }
  }
}
