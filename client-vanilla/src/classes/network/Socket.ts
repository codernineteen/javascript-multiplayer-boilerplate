export default class SocketClient {
  public socket: WebSocket | null;
  public protocol: string;
  public wsUri: string;
  public room: string;
  public messageHandlers: {
    [type: string]: (data: any) => Promise<void>;
  };

  constructor(public state: HTMLParagraphElement) {
    const { location } = window;

    this.protocol = location.protocol.startsWith("https") ? "wss" : "ws"; //If it is https , use wss. If not, use ws
    this.wsUri = `${this.protocol}://localhost:8080/ws`; //server listening connection on /ws
    this.socket = null;
    this.room = "main";
    this.messageHandlers = {
      "/Connect": async (data) => {
        console.log(data);
      },
      "/Disconnect": async (data) => {
        console.log(data);
      },
      "/Status": async (data) => {
        console.log(data);
        this.room = data;
      },
      "/Name": async (data) => {
        console.log(data);
      },
    };
  }

  Connect() {
    this.Disconnect(); //a user can't connect twice

    console.log("connecting to socket...");

    this.socket = new WebSocket(this.wsUri);

    this.socket.addEventListener("open", () => {
      this.state.innerText = "Connect";
      this.state.style.backgroundColor = "rgba(0, 255, 3, 0.2)";
      this.state.style.color = "green";

      console.log("connected");
    });

    this.socket.addEventListener("message", (evt) => {
      const eventInfo = evt.data.split("|", 2); // 0 - type , 1 - message
      this.messageHandlers[eventInfo[0]](eventInfo[1]); //execute handler
    });

    this.socket.addEventListener("close", () => {
      console.log("disconnected");
      this.socket = null;
    });
  }

  Disconnect() {
    if (this.socket) {
      console.log("disconnecting...");
      this.socket.close();
      this.socket = null;
    }
  }

  On(type: string, callback: (data: any) => Promise<void>) {
    this.messageHandlers[`/${type}`] = callback;
  }

  EmitMessage(event: string, data: string | RTCSessionDescriptionInit | null) {
    if (this.socket) {
      switch (event) {
        case "text":
          this.socket.send(`${data}`);
          break;
        case "offer":
          this.socket.send(`/${event} ${JSON.stringify(data)}`);
          break;
        case "answer":
          this.socket.send(`/${event} ${JSON.stringify(data)}`);
          break;
        case "join":
          this.socket.send(`/${event} ${data}`);
          this.room = data as string;
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
