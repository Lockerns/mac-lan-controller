use actix_web::{get, web, App, HttpServer, HttpResponse, Responder};
use actix_files::Files;
use std::process::Command;

// 1. 播放/暂停 (调用 Swift 工具)
#[get("/api/toggle")]
async fn toggle() -> impl Responder {
    // 假设编译好的 swift 工具名叫 media，放在项目根目录
    let _ = web::block(|| {
        Command::new("./media").arg("toggle").output()
    }).await;
    HttpResponse::Ok().body("Toggled")
}

// 2. 下一曲 (调用 Swift 工具)
#[get("/api/next")]
async fn next() -> impl Responder {
    let _ = web::block(|| {
        Command::new("./media").arg("next").output()
    }).await;
    HttpResponse::Ok().body("Next Track")
}

// 3. 上一曲 (调用 Swift 工具)
#[get("/api/prev")]
async fn prev() -> impl Responder {
    let _ = web::block(|| {
        Command::new("./media").arg("prev").output()
    }).await;
    HttpResponse::Ok().body("Previous Track")
}

// 4. 设置音量 (调用 AppleScript，比较稳)
#[get("/api/volume/{level}")]
async fn set_volume(path: web::Path<u8>) -> impl Responder {
    let level = path.into_inner();
    let script = format!("set volume output volume {}", level);
    
    // 执行 osascript
    let _ = web::block(move || {
        Command::new("osascript")
            .arg("-e")
            .arg(&script)
            .output()
    }).await;
        
    HttpResponse::Ok().body(format!("Volume set to {}", level))
}

// 4.1 音量增加 (调用 AppleScript)
#[get("/api/volume/up")]
async fn volume_up() -> impl Responder {
    // 增加10%音量
    let script = "set volume output volume ((output volume of (get volume settings)) + 10)";
    let _ = web::block(move || {
        Command::new("osascript")
            .arg("-e")
            .arg(script)
            .output()
    }).await;
    HttpResponse::Ok().body("Volume Up")
}

// 4.2 音量减少 (调用 AppleScript)
#[get("/api/volume/down")]
async fn volume_down() -> impl Responder {
    // 减少10%音量
    let script = "set volume output volume ((output volume of (get volume settings)) - 10)";
    let _ = web::block(move || {
        Command::new("osascript")
            .arg("-e")
            .arg(script)
            .output()
    }).await;
    HttpResponse::Ok().body("Volume Down")
}

// 5. 设置静音 (调用 AppleScript)
#[get("/api/mute/{state}")]
async fn set_mute(path: web::Path<String>) -> impl Responder {
    let state_str = path.into_inner();
    
    let script = if state_str == "toggle" {
        "set volume output muted not (output muted of (get volume settings))".to_string()
    } else {
        format!("set volume output muted {}", state_str)
    };
    
    let _ = web::block(move || {
        Command::new("osascript")
            .arg("-e")
            .arg(&script)
            .output()
    }).await;
    
    HttpResponse::Ok().body(format!("Mute action: {}", state_str))
}

// 6. 获取状态 (音量 & 静音)
#[get("/api/status")]
async fn get_status() -> impl Responder {
    web::block(move || {
        let vol_output = Command::new("osascript")
            .arg("-e")
            .arg("output volume of (get volume settings)")
            .output();
            
        let mute_output = Command::new("osascript")
            .arg("-e")
            .arg("output muted of (get volume settings)")
            .output();

        let volume = match vol_output {
            Ok(o) => String::from_utf8_lossy(&o.stdout).trim().parse::<u8>().unwrap_or(0),
            Err(_) => 0,
        };

        let is_muted = match mute_output {
            Ok(o) => String::from_utf8_lossy(&o.stdout).trim() == "true",
            Err(_) => false,
        };
        
        // 手动构建 JSON，避免引入 serde 依赖
        format!("{{\"volume\": {}, \"isMuted\": {}}}", volume, is_muted)
    })
    .await
    .map(|res| {
        HttpResponse::Ok()
            .content_type("application/json")
            .body(res)
    })
    .unwrap_or_else(|_| {
        HttpResponse::InternalServerError().finish()
    })
}

// 7. 提供前端页面 (可选)
// 如果你想直接访问 http://localhost:8080 就看到控制按钮，
// 可以把之前的 HTML 代码保存为 index.html 放在 static 目录下，这里做静态文件服务。
// 现在已集成前端构建产物 (../dist)

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("🚀 服务器启动中: http://localhost:8080");
    
    HttpServer::new(|| {
        App::new()
            .service(toggle)
            .service(next)
            .service(prev)
            .service(set_volume)
            .service(volume_up)
            .service(volume_down)
            .service(set_mute)
            .service(get_status)
            .service(Files::new("/", "../dist").index_file("index.html"))
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
