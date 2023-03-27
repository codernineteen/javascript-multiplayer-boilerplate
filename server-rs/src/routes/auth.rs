// Import necessary dependencies
use actix_web::{web, HttpResponse, Responder};

// Define the index route handler
pub async fn auth() -> impl Responder {
    HttpResponse::Ok().body("Authentication")
}

// Define the index sub-module routes
pub fn route(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::resource("/").route(web::get().to(auth)),
    );
}