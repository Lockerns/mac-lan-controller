export enum CommandType {
  PLAY = 'play',
  PAUSE = 'pause',
  NEXT = 'next',
  PREV = 'previous',
  VOL_UP = 'vol_up',
  VOL_DOWN = 'vol_down',
  SET_VOL = 'set_volume',
  MUTE = 'mute',
  SYSTEM_SLEEP = 'sleep',
  SYSTEM_DISPLAY_SLEEP = 'display_sleep'
}

export interface PlayerState {
  isPlaying: boolean;
  volume: number;
  trackName: string;
  artistName: string;
  albumArt: string;
  isMuted: boolean;
  isConnected: boolean;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  state?: Partial<PlayerState>;
}