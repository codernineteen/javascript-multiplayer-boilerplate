import VirtualClassroom from "../../Engine";
import Home from "../pages/home/Home";
import Classroom from "../pages/classroom/Classroom";
//socket client
import SocketClient from "../network/Socket";
import Peer from "../network/Peer";

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
    //** Dom Element */
    this.content = document.querySelector("#content") as HTMLDivElement; // id가 content임을 알기 때문에 null없이 타입 강제
    this.links = document.querySelectorAll(".route");
    this.connectBtn = document.querySelector(".connect") as HTMLButtonElement;
    this.connectionState = document.querySelector(
      ".connection-state"
    ) as HTMLParagraphElement;
    const $form = document.querySelector("#chatform") as HTMLFormElement;
    const $input = document.querySelector("#text") as HTMLInputElement;

    $form.addEventListener("submit", (ev) => {
      ev.preventDefault();

      const text = $input.value;

      console.log("Sending: " + text);
      this.socketClient.EmitMessage("text", text);

      $input.value = "";
      $input.focus();
    });

    this.homePage = new Home("home");
    this.classroomPage = new Classroom("classroom");

    // -- Network --
    // socket client
    this.socketClient = new SocketClient(this.connectionState);
    // peer instance
    this.peer = new Peer(this.socketClient);

    // Attach click event listeners to the navigation links
    this.links.forEach((link) => {
      this.SetRoute(link);
    });

    this.connectBtn.addEventListener("click", async () => {
      this.socketClient.Connect();
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
        this.socketClient.EmitMessage("join", "main");
        this.socketClient.EmitMessage("status", null);
        this.socketClient.room = "main";

        this.content.innerHTML = this.homePage.render();
        break;

      case "/classroom/726": {
        this.content.innerHTML = this.classroomPage.render();
        const roomId = "726";
        //!! TODO : below hardcoding should be changed later
        this.socketClient.EmitMessage("join", roomId);
        this.socketClient.EmitMessage("status", null);
        this.socketClient.room = "main";

        this.peer.CreateOffer();

        const VC = new VirtualClassroom();
        VC.Run();
        break;
      }

      case "/classroom/727": {
        this.content.innerHTML = this.classroomPage.render();
        const roomId = "727";
        //!! TODO : below hardcoding should be changed later
        this.socketClient.EmitMessage("join", roomId);
        this.socketClient.EmitMessage("status", null);
        this.socketClient.room = "main";

        //this.peer.CreateOffer();

        const VC = new VirtualClassroom();
        VC.Run();
        break;
      }

      default:
        this.content.innerHTML = `<h1>404 Not Found</h1>`;
    }
  }
}
