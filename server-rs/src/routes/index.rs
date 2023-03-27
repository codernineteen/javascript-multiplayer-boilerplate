// Import necessary dependencies
use actix_web::{web, HttpResponse, Responder};

// Define the index route handler
pub async fn index() -> impl Responder {
    HttpResponse::Ok().body("index")
}

// Define the index sub-module routes
pub fn route(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::resource("/index").route(web::get().to(index)),
    );
}