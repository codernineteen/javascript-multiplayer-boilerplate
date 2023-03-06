import VirtualClassroom from "../VCRuntime";
import Home from "../pages/home/Home";
import Classroom from "../pages/classroom/Classroom";

export default class Router {
    public route: any;
    public content: HTMLDivElement | null;
    public links: NodeListOf<HTMLAnchorElement>
    public classroomPage: Classroom;
    public homePage: Home;


    constructor() {
        this.content = document.querySelector("#content");
        this.links = document.querySelectorAll(".route");

        this.homePage = new Home("home");
        this.classroomPage = new Classroom("classroom");

        // Attach an event listener to the window object for the popstate even
        window.onpopstate = this.HandlePopState;

        // Attach click event listeners to the navigation links
        this.links.forEach((link) => {
            this.SetRoute(link);
        })
    }

    SetRoute(link: HTMLAnchorElement) {
        link.addEventListener('click', (evt) => {
            // Prevent the default behavior of the link, which would cause a page refresh
            evt.preventDefault();
            // Update the URL without causing a page refresh
            const path = link.pathname;
            history.pushState({}, "", path);
            // Update the content area based on the new URL
            this.HandlePopState();
        });
    }

    HandlePopState() {
        const path = window.location.pathname;
        switch (path) {
            case "/home":
            this.UpdateContent(this.homePage.render());
            break;
            case "/classroom":
            this.UpdateContent(this.classroomPage.render());
            const VC = new VirtualClassroom();
            VC.Run();
            break;
            default:
            this.UpdateContent("<h1>404 Not Found</h1>");
            break;
        }
    }

    UpdateContent(html: string) {
        if(this.content) this.content.innerHTML = html;
    }
}