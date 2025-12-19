use coreaudio_sys::*;
use std::mem;
use std::ptr;

// 定义一个空结构体作为命名空间
pub struct SystemAudio;

impl SystemAudio {
    /// 获取当前系统是否有音频正在播放
    /// 这是一个 Safe 函数，外部调用不需要 unsafe
    pub fn is_playing() -> Result<bool, String> {
        Self::check_audio_status_unsafe()
    }

    // 内部私有函数，处理所有的 unsafe 逻辑
    fn check_audio_status_unsafe() -> Result<bool, String> {
        // --- 1. 获取默认输出设备 ID ---
        let mut address = AudioObjectPropertyAddress {
            mSelector: kAudioHardwarePropertyDefaultOutputDevice,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMaster,
        };

        let mut device_id: AudioDeviceID = 0;
        let mut data_size = mem::size_of::<AudioDeviceID>() as u32;

        let status = unsafe {
            AudioObjectGetPropertyData(
                kAudioObjectSystemObject,
                &address,
                0,
                ptr::null(),
                &mut data_size, // 注意：这里必须是 &mut
                &mut device_id as *mut _ as *mut _,
            )
        };

        if status != 0 {
            return Err(format!("无法获取默认音频设备 (OSStatus: {})", status));
        }

        // --- 2. 检查设备运行状态 ---
        // DeviceIsRunningSomewhere 比 DeviceIsRunning 更准确，因为它包含子设备
        address.mSelector = kAudioDevicePropertyDeviceIsRunningSomewhere;
        
        let mut is_running: u32 = 0;
        data_size = mem::size_of::<u32>() as u32;

        let status = unsafe {
            AudioObjectGetPropertyData(
                device_id,
                &address,
                0,
                ptr::null(),
                &mut data_size, // 注意：这里必须是 &mut
                &mut is_running as *mut _ as *mut _,
            )
        };

        if status != 0 {
            return Err(format!("无法查询设备状态 (OSStatus: {})", status));
        }

        Ok(is_running > 0)
    }
}