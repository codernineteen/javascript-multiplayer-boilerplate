use std::{
    sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    },
    time::Instant,
};

use actix::*;
use actix_web::{
    middleware::Logger,
    web, App, 
    HttpRequest, HttpResponse, Error,
    HttpServer, Responder,
};
use actix_cors::Cors;
use actix_web_actors::ws;

mod server;
mod session;
mod routes;


/// Entry point for our websocket route
async fn room_route(
    req: HttpRequest,
    stream: web::Payload,
    srv: web::Data<Addr<server::RoomServer>>,
) -> Result<HttpResponse, Error> {
    //Start websocket actor
    ws::start(
        session::WsRoomSession {
            id: 0,
            hb: Instant::now(),
            room: "main".to_owned(),
            name: None,
            addr: srv.get_ref().clone(),
        },
        &req,
        stream,
    )
}

/// Displays state
async fn get_count(count: web::Data<AtomicUsize>) -> impl Responder {
    let current_count = count.load(Ordering::SeqCst);
    format!("Visitors: {current_count}")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    //use logger for performative logging
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    // set up applications state
    // keep a count of the number of visitors
    let app_state = Arc::new(AtomicUsize::new(0));

    // start chat server actor
    let server = server::RoomServer::new(app_state.clone()).start(); //RoomServer actor starts -> thread 1

    log::info!("starting HTTP server at http://localhost:8080");

    HttpServer::new(move || {
        let cors = Cors::default().allowed_origin("http://localhost:5173");

        App::new()
            .wrap(Logger::default())
            .wrap(cors)
            .app_data(web::Data::from(app_state.clone()))
            .app_data(web::Data::new(server.clone()))
            .route("/count", web::get().to(get_count))
            .route("/ws", web::get().to(room_route))
            .route("/index", web::get().to(routes::index::index))
    })
    .workers(2) //workers is corresponed to number of cpu of current machine by default.
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}