import VirtualClassroom from "../../Engine";
import Home from "../pages/home/Home";
import Classroom from "../pages/classroom/Classroom";
//socket client
import { Socket, io } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../../types/socket-client-types";
import Peer from "../network/Peer";

export type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>;

export default class Router {
  public content: HTMLDivElement;
  public connectBtn: HTMLButtonElement;
  public links: NodeListOf<HTMLAnchorElement>;
  public classroomPage: Classroom;
  public homePage: Home;
  public connectionState: HTMLParagraphElement;
  //networking instance
  public socketClient: SocketClient;
  public peer: Peer;

  constructor() {
    // -- Network Code --
    // socket client
    this.socketClient = io("http://localhost:3333", {
      transports: ["websocket"],
    });
    // peer instance
    this.peer = new Peer(this.socketClient);

    //** Dom Element */
    this.content = document.querySelector("#content") as HTMLDivElement; // id가 content임을 알기 때문에 null없이 타입 강제
    this.links = document.querySelectorAll(".route");
    this.connectBtn = document.querySelector(".connect") as HTMLButtonElement;
    this.connectionState = document.querySelector(
      ".connection-state"
    ) as HTMLParagraphElement;

    this.homePage = new Home("home");
    this.classroomPage = new Classroom("classroom");

    // - Socket -
    this.socketClient.on("UserConnected", async (roomid, userId) => {
      console.log("send offer");
      let offer = await this.peer.conn.createOffer();
      await this.peer.conn.setLocalDescription(offer);
      console.log(this.peer.conn.iceConnectionState);
      this.peer.signalingChannel.emit("PeerOffer", offer, roomid);
      console.log("local ", this.peer.conn.localDescription);
    });

    // Attach click event listeners to the navigation links
    this.links.forEach((link) => {
      this.SetRoute(link);
    });

    this.UpdateContent();
  }

  SetRoute(link: HTMLAnchorElement) {
    link.addEventListener("click", (evt) => {
      // Prevent the default behavior of the link, which would cause a page refresh
      evt.preventDefault();
      // Update the URL without causing a page refresh
      const path = link.pathname;
      history.pushState({}, "", path);
      // Update the content area based on the new URL
      this.UpdateContent();
    });
  }

  async UpdateContent() {
    const path = window.location.pathname;

    switch (path) {
      case "/":
        //!! TODO : below hardcoding should be changed later
        this.content.innerHTML = this.homePage.render();
        break;

      case "/classroom/726": {
        this.content.innerHTML = this.classroomPage.render();
        //!! TODO : below hardcoding should be changed later
        this.peer.roomName = "726";
        this.socketClient.emit("JoinRoom", {
          roomId: "726",
          userId: this.socketClient.id,
        });

        const VC = new VirtualClassroom();
        VC.Run();
        break;
      }

      case "/classroom/727": {
        this.content.innerHTML = this.classroomPage.render();
        //!! TODO : below hardcoding should be changed later
        this.peer.roomName = "726";
        this.socketClient.emit("JoinRoom", {
          roomId: "726",
          userId: this.socketClient.id,
        });

        const VC = new VirtualClassroom();
        VC.Run();
        break;
      }

      default:
        this.content.innerHTML = `<h1>404 Not Found</h1>`;
    }
  }
}
