import VirtualClassroom from "../Engine";
import Home from "../pages/home/Home";
import Classroom from "../pages/classroom/Classroom";
//socket client
import SocketClient from "../socket/Socket";

export default class Router {
  public content: HTMLDivElement;
  public links: NodeListOf<HTMLAnchorElement>;
  public classroomPage: Classroom;
  public homePage: Home;
  public socket: SocketClient;

  constructor() {
    this.content = document.querySelector("#content") as HTMLDivElement; // id가 content임을 알기 때문에 null없이 타입 강제
    this.links = document.querySelectorAll(".route");

    this.homePage = new Home("home");
    this.classroomPage = new Classroom("classroom");

    // socket client
    this.socket = new SocketClient();
    this.socket.Connect();

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
        this.content.innerHTML = this.homePage.render();
        break;

      case "/classroom/726": {
        this.content.innerHTML = this.classroomPage.render();
        const roomId = "726";

        const VC = new VirtualClassroom();
        VC.Run();
        break;
      }

      case "/classroom/727": {
        this.content.innerHTML = this.classroomPage.render();
        const roomId = "727";

        const VC = new VirtualClassroom();
        VC.Run();
        break;
      }

      default:
        this.content.innerHTML = `<h1>404 Not Found</h1>`;
    }
  }
}
