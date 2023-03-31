import SocketClient from "./Socket";
import { v4 as uuidv4 } from "uuid";

export default class Peer {
  public servers: any;
  public id: string;
  public conn: RTCPeerConnection;
  //public dataChannel: RTCDataChannel;

  constructor(public signalingChannel: SocketClient) {
    this.servers = {
      iceServers: [
        {
          urls: [
            "stun.l.google.com:19302",
            "stun1.l.google.com:19302",
            "stun2.l.google.com:19302",
            "stun3.l.google.com:19302",
            "stun4.l.google.com:19302",
          ],
        },
      ],
    };
    this.id = uuidv4();
    this.conn = new RTCPeerConnection();
    //When new user comes in Room
    // this.signalingChannel.on("UserConnected", async (roomId, _userId) => {
    //   //create offer to exchange SDP
    //   await this.CreateOffer(roomId);
    // });

    // this.signalingChannel.on("PeerOffer", async (payload, roomId) => {
    //   //set given offer as remote
    //   this.conn.setRemoteDescription(payload);
    //   const answer = await this.conn.createAnswer(); //create answer
    //   this.conn.setLocalDescription(answer); //An answer created is for local
    //   this.signalingChannel.emit("PeerAnswer", answer, roomId);
    // });

    // this.signalingChannel.on("PeerAnswer", (payload) => {
    //   //set given answer as remote
    //   this.conn.setRemoteDescription(payload);
    // });
  }

  async CreateOffer() {
    console.log("let's create offer!");
    let offer = await this.conn.createOffer();
    await this.conn.setLocalDescription(offer);
    this.signalingChannel.EmitMessage("offer", offer);
  }
}
