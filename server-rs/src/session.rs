///Session is direct interface for Socket Client
///Messages always pass first session actor
///Then if session need a message to communicate with RoomServer, it sends message to server.

use std::time::{Duration, Instant};

use actix::prelude::*;
use actix_web_actors::ws;

use serde;
use serde::{Serialize, Deserialize};
use serde_json::json;

use crate::server;

/// How often heartbeat pings are sent
const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);

/// How long before lack of client response causes a timeout
const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

//session description
#[derive(Debug, Deserialize)]
struct RTCSessionDescriptionInit {
    #[serde(rename = "type")]
    type_: String,
    sdp: String,
}

//functions
async fn handle_peer_offer(msg: actix_web_actors::ws::Message) -> Result<actix_web_actors::ws::Message, actix_web::Error> {
    if let actix_web_actors::ws::Message::Text(text) = msg {
        // Parse the JSON payload as an RTCSessionDescriptionInit object
        let sdp: RTCSessionDescriptionInit = serde_json::from_str(&text)?;
        log::info!("{:?}", sdp);
        // Do something with the parsed RTCSessionDescriptionInit object
        
        // Return a response message to the WebSocket client
        let response = json!({
            "status": "success",
            "message": "RTCSessionDescriptionInit received"
        });
        let response_text = response.to_string();
        return Ok(actix_web_actors::ws::Message::Text(response_text.into()));
    }
    
    // Return an error message if the WebSocket message is not a text message
    Err(actix_web::error::ErrorBadRequest("Expected a text message"))
}

#[derive(Debug)]
pub struct WsRoomSession {
    /// unique session id
    pub id: usize,

    /// Client must send ping at least once per 10 seconds (CLIENT_TIMEOUT),
    /// otherwise we drop connection.
    pub hb: Instant,

    /// joined room
    pub room: String,

    /// peer name
    pub name: Option<String>,

    /// Room server
    pub addr: Addr<server::RoomServer>,
}

impl WsRoomSession {
    /// helper method that sends ping to client every 5 seconds (HEARTBEAT_INTERVAL).
    ///
    /// also this method checks heartbeats from client
    fn hb(&self, ctx: &mut ws::WebsocketContext<Self>) {
        ctx.run_interval(HEARTBEAT_INTERVAL, |act, ctx| {
            // check client heartbeats
            if Instant::now().duration_since(act.hb) > CLIENT_TIMEOUT {
                // heartbeat timed out
                println!("Websocket Client heartbeat failed, disconnecting!");

                // notify Room server
                act.addr.do_send(server::Disconnect { id: act.id });

                // stop actor
                ctx.stop();

                // don't try to send a ping
                return;
            }

            ctx.ping(b"");
        });
    }
}

///Actor is a rust library providing a framework for developing concurrent applications
///Actor runs within specific execution context 'Context<A>'
///Actor communicate by exchanging messags
/// To handle a specific message, an actor has to provide 'Handler<M>'
impl Actor for WsRoomSession {
    type Context = ws::WebsocketContext<Self>; //use websocket context

    /// Method is called on actor start.
    /// We register ws session with RoomServer
    fn started(&mut self, ctx: &mut Self::Context) {
        // we'll start heartbeat process on session start.
        self.hb(ctx);

        // register self in Room server. `AsyncContext::wait` register
        // future within context, but context waits until this future resolves
        // before processing any other events.
        // HttpContext::state() is instance of WsRoomSessionState, state is shared
        // across all routes within application
        let addr = ctx.address();
        self.addr
            .send(server::Connect {
                addr: addr.recipient(),
            })
            .into_actor(self)
            .then(|res, act, ctx| {
                match res {
                    Ok(res) => act.id = res, // Res comes from 'impl Handler<Connect> for RoomServer' block
                    // something is wrong with Room server
                    _ => ctx.stop(),
                }
                fut::ready(())
            })
            .wait(ctx);
    }

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        // notify Room server
        self.addr.do_send(server::Disconnect { id: self.id });
        Running::Stop
    }
}

/// Handle messages from Room server, we simply send it to peer websocket
/// Server
impl Handler<server::Message> for WsRoomSession {
    type Result = ();

    fn handle(&mut self, msg: server::Message, ctx: &mut Self::Context) {
        ctx.text(msg.0);
    }
}

/// WebSocket message handler
impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for WsRoomSession {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        let msg = match msg {
            Err(_) => {
                ctx.stop();
                return;
            }
            Ok(msg) => msg,
        };

        log::debug!("WEBSOCKET MESSAGE: {msg:?}");
        match msg {
            ws::Message::Ping(msg) => {
                self.hb = Instant::now();
                ctx.pong(&msg);
            }
            ws::Message::Pong(_) => {
                self.hb = Instant::now();
            }
            ws::Message::Text(text) => {
                log::info!("{}",text);
                


                let m = text.trim();
                // we check for /sss type of messages
                if m.starts_with('/') {
                    let v: Vec<&str> = m.splitn(2, ' ').collect();
                    match v[0] {
                        "/list" => {
                            self.addr 
                                .send(server::ListRooms)
                                .into_actor(self)
                                .then(|res, _ , ctx| {
                                    match res {
                                        Ok(rooms) => {
                                            for room in rooms {
                                                ctx.text(room);
                                            }
                                        }
                                        _ => println!("something wrong")
                                    }
                                    fut::ready(())
                                })
                                .wait(ctx)
                        }
                        "/join" => {
                            if v.len() == 2 {
                                self.room = v[1].to_owned();
                                self.addr.do_send(server::Join {
                                    id: self.id,
                                    name: self.room.clone(),
                                });

                                ctx.text("joined");
                            } else {
                                ctx.text("!!! room doesn't exist");
                            }
                        }
                        "/name" => {
                            if v.len() == 2 {
                                self.name = Some(v[1].to_owned());
                            } else {
                                ctx.text("!!! name is required");
                            }
                        }
                        "/status" => {
                            ctx.text(format!("You are currently in room: {}", self.room));
                        },
                        "/offer" => {
                            //need to implement peer offer.
                            if v.len() == 2 {
                                self.addr.do_send(server::PeerOffer {
                                    id: self.id,
                                    name: self.room.clone(),
                                    offer: v[1].to_owned(),
                                })
                            }
                        }
                        _ => ctx.text(format!("!!! unknown command: {m:?}")),
                    }
                } else {
                    //general message inside current room
                    let msg = if let Some(ref name) = self.name {
                        format!("{name}: {m}")
                    } else {
                        m.to_owned()
                    };
                    // send message to Room server
                    self.addr.do_send(server::ClientMessage {
                        id: self.id,
                        msg,
                        room: self.room.clone(),
                    })
                }
            }
            ws::Message::Binary(_) => println!("Unexpected binary"),
            ws::Message::Close(reason) => {
                ctx.close(reason);
                ctx.stop();
            }
            ws::Message::Continuation(_) => {
                ctx.stop();
            }
            ws::Message::Nop => (),
        }
    }
}
