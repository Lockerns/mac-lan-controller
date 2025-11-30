import Foundation

// 1. 定义函数签名
typealias MRSendCommandFunction = @convention(c) (Int32, AnyObject?) -> Bool

// 2. 修正后的枚举：删除了冲突的音量项
// 我们只保留播放控制，音量交给 AppleScript
enum MRCommand: Int32 {
    case play = 0
    case pause = 1
    case togglePlayPause = 2
    case nextTrack = 4
    case previousTrack = 5
}

// 3. 动态加载并发送命令
func sendCommand(_ cmd: MRCommand) {
    let frameworkPath = "/System/Library/PrivateFrameworks/MediaRemote.framework/MediaRemote"
    
    // 打开动态库
    guard let handle = dlopen(frameworkPath, RTLD_NOW) else {
        print("Error: 无法加载 MediaRemote 框架")
        return
    }
    
    // 查找符号
    guard let sym = dlsym(handle, "MRMediaRemoteSendCommand") else {
        print("Error: 找不到 MRMediaRemoteSendCommand 函数")
        return
    }
    
    // 转换并调用
    let sendMediaRemoteCommand = unsafeBitCast(sym, to: MRSendCommandFunction.self)
    _ = sendMediaRemoteCommand(cmd.rawValue, nil)
    
    // 清理
    dlclose(handle)
}

// --- 主逻辑 ---

let args = CommandLine.arguments
if args.count < 2 {
    print("Usage: ./media [toggle|next|prev]")
    exit(1)
}

let action = args[1].lowercased()

switch action {
case "toggle", "play", "pause":
    sendCommand(.togglePlayPause)
    print("已发送: 播放/暂停")
case "next":
    sendCommand(.nextTrack)
    print("已发送: 下一曲")
case "prev":
    sendCommand(.previousTrack)
    print("已发送: 上一曲")
default:
    // 对于音量或其他未知命令，不做处理（由 Rust 调用 AppleScript 处理）
    print("Swift工具仅处理播放控制。音量请使用 AppleScript。")
}

// 防止过快退出
Thread.sleep(forTimeInterval: 0.1)
