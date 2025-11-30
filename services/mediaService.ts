import { API_BASE_URL, IS_DEMO_MODE } from '../constants';
import { CommandType, ApiResponse } from '../types';

class MediaService {
  private async request(endpoint: string, method: 'GET' | 'POST', body?: any): Promise<ApiResponse> {
    if (IS_DEMO_MODE) {
      console.log(`[DEMO] ${method} ${endpoint}`, body);
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 150));
      return { success: true };
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      // Backend returns text, not JSON, for current endpoints
      const text = await response.text();
      return { success: true, message: text };
    } catch (error) {
      console.error("API Request Failed:", error);
      return { success: false, message: String(error) };
    }
  }

  async sendCommand(command: CommandType, value?: number): Promise<ApiResponse> {
    switch (command) {
      case CommandType.PLAY:
      case CommandType.PAUSE:
        return this.request('/api/toggle', 'GET');
      case CommandType.NEXT:
        return this.request('/api/next', 'GET');
      case CommandType.PREV:
        return this.request('/api/prev', 'GET');
      case CommandType.SET_VOL:
        if (value === undefined) return { success: false, message: "Volume value missing" };
        return this.request(`/api/volume/${Math.round(value)}`, 'GET');
      case CommandType.MUTE:
        return this.request('/api/mute/toggle', 'GET');
      case CommandType.VOL_UP:
        return this.request('/api/volume/up', 'GET');
      case CommandType.VOL_DOWN:
        return this.request('/api/volume/down', 'GET');
      case CommandType.SYSTEM_SLEEP:
         console.warn(`Command ${command} not supported by current backend version.`);
         return { success: false, message: "Not implemented in backend" };
      case CommandType.SYSTEM_DISPLAY_SLEEP:
         console.warn(`Command ${command} not supported by current backend version.`);
         return { success: false, message: "Not implemented in backend" };
      default:
        return { success: false, message: "Unknown command" };
    }
  }

  async getStatus(): Promise<ApiResponse> {
    if (IS_DEMO_MODE) {
      return { success: true, state: { isConnected: true } as any };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/status`);
      if (!response.ok) {
        // If status endpoint fails, we might be offline or backend is old
        return { success: false, state: { isConnected: false } as any };
      }
      
      const data = await response.json();
      return { 
        success: true, 
        state: { 
          isConnected: true,
          volume: data.volume,
          isMuted: data.isMuted
        } 
      };
    } catch (error) {
      console.error("Status Check Failed:", error);
      return { success: false, state: { isConnected: false } as any };
    }
  }
}

export const mediaService = new MediaService();