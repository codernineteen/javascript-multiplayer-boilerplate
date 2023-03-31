//! `RoomServer` is an actor. It maintains list of connection client session.
//! And manages available rooms. Peers send messages to other peers in same
//! room through `RoomServer`.

use std::{
    collections::{HashMap, HashSet},
    sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    },
};

use actix::prelude::*;
use rand::{self, rngs::ThreadRng, Rng};


/// How to define message that actor needs to accept
/// derive(Message) macro
/// message can be any type if it implements Message trait(it includes type Result: 'static)
/// 
/// Room server sends this messages to session
#[derive(Message)]
#[rtype(result = "()")]
pub struct Message(pub String);

/// Message for room server communications

/// New room session is created
#[derive(Message)]
#[rtype(usize)]
pub struct Connect {
    pub addr: Recipient<Message>,
}

/// Session is disconnected
#[derive(Message)]
#[rtype(result = "()")]
pub struct Disconnect {
    pub id: usize,
}

/// Send message to specific room
#[derive(Message)]
#[rtype(result = "()")]
pub struct ClientMessage {
    /// Id of the client session
    pub id: usize,
    /// Peer message
    pub msg: String,
    /// Room name
    pub room: String,
}

/// List of available rooms
pub struct ListRooms; // Listroom message

impl actix::Message for ListRooms { // implement Message trait about ListRooms message 
    type Result = Vec<String>; // all actors who got this message should return Vec<String>
}
/// Join room, if room does not exists create new one.
#[derive(Message)]
#[rtype(result = "()")]
pub struct Join {
    /// Client ID
    pub id: usize,

    /// Room name
    pub name: String,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct PeerOffer {
    // Client id
    pub id: usize,

    // Room name 
    pub name: String,

    // SDP
    pub offer: String,
}

/// `RoomServer` manages chat rooms and responsible for coordinating chat session.
///
/// Implementation is very naïve.
/// Define Actor
#[derive(Debug)]
pub struct RoomServer {
    sessions: HashMap<usize, Recipient<Message>>,
    rooms: HashMap<String, HashSet<usize>>,
    rng: ThreadRng,
    visitor_count: Arc<AtomicUsize>,
}

impl RoomServer {
    pub fn new(visitor_count: Arc<AtomicUsize>) -> RoomServer {
        // default room
        let mut rooms = HashMap::new();
        // !! Because i don't create a room by user input, should create rooms first when RoomSever instance initialized
        rooms.insert("main".to_owned(), HashSet::new());
        rooms.insert("726".to_owned(), HashSet::new());
        rooms.insert("727".to_owned(), HashSet::new());

        RoomServer {
            sessions: HashMap::new(),
            rooms,
            rng: rand::thread_rng(),
            visitor_count, //when a new user comes in a room, visitor_count is incremented.
        }
    }
}

impl RoomServer {
    /// Send message to all users in the room
    fn send_message(&self, room: &str, message: &str, skip_id: usize) {
        if let Some(sessions) = self.rooms.get(room) {
            for id in sessions {
                if *id != skip_id {
                    if let Some(addr) = self.sessions.get(id) {
                        addr.do_send(Message(message.to_owned()));
                    }
                } 

            }
        }
    }
}

/// Make actor from `ChatServer`
impl Actor for RoomServer {
    /// We are going to use simple Context, we just need ability to communicate
    /// with other actors.
    type Context = Context<Self>;
}

/// Handler for Connect message.
///
/// Register new session and assign unique id to this session
impl Handler<Connect> for RoomServer {
    type Result = usize;

    fn handle(&mut self, msg: Connect, _: &mut Context<Self>) -> Self::Result {
        println!("a new user joined");

        // notify all users in same room
        self.send_message("main", "a new user joined", 0);

        // register session with random id
        let id = self.rng.gen::<usize>();
        self.sessions.insert(id, msg.addr);

        // auto join session to main room
        self.rooms
            .entry("main".to_owned())
            .or_insert_with(HashSet::new)
            .insert(id);

        let count = self.visitor_count.fetch_add(1, Ordering::SeqCst);
        self.send_message("main", &format!("Total visitors {count}"), 0);

        // send id back
        id
    }
}

/// Handler for Disconnect message.
impl Handler<Disconnect> for RoomServer {
    type Result = ();

    fn handle(&mut self, msg: Disconnect, _: &mut Context<Self>) {
        println!("Someone disconnected");

        let mut rooms: Vec<String> = Vec::new();

        // remove address
        if self.sessions.remove(&msg.id).is_some() {
            // remove session from all rooms
            for (name, sessions) in &mut self.rooms {
                if sessions.remove(&msg.id) {
                    rooms.push(name.to_owned());
                }
            }
        }
        // send message to other users
        for room in rooms {
            self.send_message(&room, "Someone disconnected", 0);
        }
    }
}

/// Handler for Message message.
impl Handler<ClientMessage> for RoomServer {
    type Result = ();

    fn handle(&mut self, msg: ClientMessage, _: &mut Context<Self>) {
        self.send_message(&msg.room, msg.msg.as_str(), msg.id);
    }
}

/// Handler for `ListRooms` message.
impl Handler<ListRooms> for RoomServer {
    type Result = MessageResult<ListRooms>;

    fn handle(&mut self, _: ListRooms, _: &mut Context<Self>) -> Self::Result {
        let mut rooms = Vec::new();

        for key in self.rooms.keys() {
            rooms.push(key.to_owned())
        }

        MessageResult(rooms)
    }
}

/// Join room, send disconnect message to old room
/// send join message to new room
impl Handler<Join> for RoomServer {
    type Result = ();

    fn handle(&mut self, msg: Join, _: &mut Context<Self>) {
        let Join { id, name } = msg;
        let mut rooms = Vec::new();

        // remove session from all rooms
        // case1 : a new user
        // case2 : a user already joined another room
        // For handling both cases, we need to remove the session of current user from other room
        for (n, sessions) in &mut self.rooms {
            if sessions.remove(&id) {
                rooms.push(n.to_owned());
            }
        }
        // send message to other users
        for room in rooms {
            self.send_message(&room, "Someone disconnected", 0);
        }

        self.rooms
            .entry(name.clone())
            .or_insert_with(HashSet::new)
            .insert(id);

        self.send_message(&name, "Someone connected", id);
    }
}

impl Handler<PeerOffer> for RoomServer {
    type Result = ();

    fn handle(&mut self, msg: PeerOffer, _: &mut Self::Context) -> Self::Result {
        self.send_message(&msg.name, &msg.offer, 0);
    }
}