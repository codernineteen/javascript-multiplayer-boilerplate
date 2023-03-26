import VirtualClassroom from "../Engine";
import Home from "../pages/home/Home";
import Classroom from "../pages/classroom/Classroom";
import ClassroomPannel from "../pages/classroom/ClassroomPannel";
import Login from "../pages/login/Login";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../types/socket-client-types";
//import { Peer } from "peerjs";

export type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

export default class Router {
  public content: HTMLDivElement;
  public links: NodeListOf<HTMLAnchorElement>;
  public classroomPage: Classroom;
  public classroomPanelpage: ClassroomPannel;
  public homePage: Home;
  public loginPage: Login;
  //socket client
  private socket: SocketType;

  constructor() {
    this.content = document.querySelector("#content") as HTMLDivElement; // id가 content임을 알기 때문에 null없이 타입 강제
    this.links = document.querySelectorAll(".route");

    this.homePage = new Home("home");
    this.classroomPanelpage = new ClassroomPannel("classroom-panel");
    this.classroomPage = new Classroom("classroom");
    this.loginPage = new Login("login");

    //create socket instance
    this.socket = io("http://localhost:3333", {
      transports: ["websocket"],
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
    let VC: VirtualClassroom;
    switch (path) {
      case "/":
        this.content.innerHTML = this.homePage.render();
        break;

      case "/classroom-pannel":
        this.GuardRoute().then((res) => {
          if (res == true) {
            this.content.innerHTML = this.classroomPanelpage.render();
          } else {
            alert("강의실 입장 권한이 없습니다. 로그인을 해주세요");
            window.location.href = "/";
          }
        });

        break;

      case "/classroom726":
        const res = await this.GuardRoute();
        if (res == false) {
          alert("강의실 접근 권한이 없습니다.");
        }
        this.content.innerHTML = this.classroomPage.render();
        const roomId = "726";
        this.socket.emit("JoinRoom", { roomId, userId: this.socket.id });

        VC = new VirtualClassroom(this.socket);
        VC.Run();
        break;

      case "/auth":
        this.content.innerHTML = this.loginPage.render();
        const loginBtn = document.querySelector(".login-button");
        const looutBtn = document.querySelector(".logout-button");
        loginBtn?.addEventListener("click", () => {
          this.loginPage.sendLoginRequest();
        });
        looutBtn?.addEventListener("click", () => {
          this.loginPage.logOut();
        });
        break;

      default:
        this.content.innerHTML = `<h1>404 Not Found</h1>`;
    }
  }

  async GuardRoute() {
    const jwtToken = localStorage.getItem("jwtToken");
    const config = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    };
    console.log("called");
    try {
      await axios.get("http://localhost:3333/auth/status", config);
      return true;
    } catch (error) {
      window.location.href = "/";
      return false;
    }
  }

  async GetRoomId() {
    try {
      await axios.get("http://localhost:3333/room");
    } catch (err) {
      console.log(err);
    }
  }
}
