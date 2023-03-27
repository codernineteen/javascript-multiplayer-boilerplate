export default class SocketClient {
  public socket: WebSocket | null;
  public protocol: string;
  public wsUri: string;

  constructor() {
    const { location } = window;

    this.protocol = location.protocol.startsWith("https") ? "wss" : "ws"; //If it is https , use wss. If not, use ws
    this.wsUri = `${this.protocol}://localhost:8080/ws`; //server listening connection on /ws
    this.socket = null;
  }

  Connect() {
    this.Disconnect(); //a user can't connect twice

    console.log("connecting to socket...");

    this.socket = new WebSocket(this.wsUri);

    this.socket.onopen = () => {
      console.log("connected!");
    };

    this.socket.onmessage = (evt) => {
      console.log("Received: " + evt.data);
    };

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
}
