import { v4 as uuidv4 } from "uuid";
import { Socket } from "socket.io-client";

export default class Peer {
  public servers: any;
  public id: string;
  public conn: RTCPeerConnection | null;
  public roomName: string;
  public dataChannel: RTCDataChannel | undefined;
  //public dataChannel: RTCDataChannel;

  constructor(public signalingChannel: Socket) {
    this.id = uuidv4();
    this.conn = null;
    this.roomName = "";
    this.dataChannel = undefined;

    //Socket code
    this.signalingChannel.on("welcome", async () => {
      this.dataChannel = this.conn?.createDataChannel("chat");
      this.dataChannel?.addEventListener("message", (event) =>
        console.log(event.data)
      );
      console.log("made data channel");
      await this.CreateOffer();
    });

    //-- listen offer description
    this.signalingChannel.on("offer", async (offer) => {
      this.conn?.addEventListener("datachannel", (event) => {
        this.dataChannel = event.channel;
        this.dataChannel.addEventListener("message", (event) =>
          console.log(event.data)
        );
      });
      console.log("received the offer");
      this.conn?.setRemoteDescription(offer);
      this.CreateAnswer();
      console.log("sent the answer");
    });

    //-- Listen answer description(A peer who sends offer listen to answer)
    this.signalingChannel.on("answer", (answer) => {
      console.log("received answer");
      //set given answer as remote
      this.conn?.setRemoteDescription(answer);
    });

    //-- listen candidate establishment
    this.signalingChannel.on("ice", (ice) => {
      console.log("received candidate");
      this.conn?.addIceCandidate(ice);
    });
  }

  //send offer to signal channel
  //If new user join the room, call this function
  async CreateOffer() {
    console.log("send offer");
    const offer = await this.conn?.createOffer();
    await this.conn?.setLocalDescription(offer);
    this.signalingChannel.emit("offer", offer, this.roomName);
    console.log("local ", this.conn?.localDescription);
  }

  async CreateAnswer() {
    const answer = await this.conn?.createAnswer();
    await this.conn?.setLocalDescription(answer);
    this.signalingChannel.emit("answer", answer, this.roomName);
  }

  async InitConnection() {
    this.conn = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
            "stun:stun3.l.google.com:19302",
            "stun:stun4.l.google.com:19302",
          ],
        },
      ],
    });
    this.conn.addEventListener("icecandidate", (evt) => {
      this.signalingChannel.emit("ice", evt, this.roomName);
    });

    this.conn.addEventListener("iceconnectionstatechange", (evt) => {
      console.log(evt);
    });
  }
}
