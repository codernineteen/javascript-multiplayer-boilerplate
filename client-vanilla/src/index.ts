import VirtualClassroom from "./Engine";
//socket client
import { io } from "socket.io-client";
import Peer from "./classes/network/Peer";

//network
const socket = io("http://localhost:3333", {
  transports: ["websocket"],
});
let peer = new Peer(socket);
let dataChannel;
let runtime;

//HTML element
const content = document.getElementById("content") as HTMLDivElement;
const joinForm = document.getElementById("join") as HTMLDivElement;
content.hidden = true;

//Peer
async function InitRoomConnection(parentEl: HTMLDivElement) {
  content.hidden = false;
  runtime = new VirtualClassroom(parentEl);
  runtime.Run();
  peer.InitConnection();
}

async function HandleJoinSubmit(evt: SubmitEvent) {
  evt.preventDefault();
  const input = joinForm.querySelector("input") as HTMLInputElement;
  await InitRoomConnection(content);
  socket.emit("join_room", input.value);
  peer.roomName = input.value;
  input.value = "";
}
joinForm.addEventListener("submit", HandleJoinSubmit);
