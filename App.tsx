import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Power, 
  Monitor, 
  Volume1,
  Volume2,
  VolumeX,
  Music 
} from 'lucide-react';
import { mediaService } from './services/mediaService';
import { CommandType, PlayerState } from './types';
import { ControlBtn } from './components/ControlBtn';
import { DEFAULT_ALBUM_ART, IS_DEMO_MODE } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    volume: 50,
    trackName: 'Waiting for Status...',
    artistName: 'Mac Media Controller',
    albumArt: DEFAULT_ALBUM_ART,
    isMuted: false,
    isConnected: false,
  });

  const [lastActive, setLastActive] = useState<number>(Date.now());

  const handleCommand = async (cmd: CommandType) => {
    // Optimistic UI updates
    if (cmd === CommandType.PLAY || cmd === CommandType.PAUSE) {
      setState(prev => ({ ...prev, isPlaying: cmd === CommandType.PLAY }));
    }
    
    // Animate press
    setLastActive(Date.now());

    await mediaService.sendCommand(cmd);
    
    // Refresh status after command to get updated volume/mute
    setTimeout(async () => {
        const res = await mediaService.getStatus();
        if (res.success && res.state) {
             setState(prev => ({ ...prev, ...res.state }));
        }
    }, 500);
  };

  // Initial check (mocked or real)
  useEffect(() => {
    const checkConnection = async () => {
      if (IS_DEMO_MODE) {
        setState(prev => ({
          ...prev,
          isConnected: true,
          trackName: "Unknown Track",
          artistName: "System Audio"
        }));
        return;
      }

      const res = await mediaService.getStatus();
      if (res.success) {
        setState(prev => ({ ...prev, isConnected: true, ...res.state }));
      } else {
        setState(prev => ({ ...prev, isConnected: false }));
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-6 overflow-hidden relative">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Card */}
      <div className="relative w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 shadow-2xl flex flex-col gap-8">
        
        {/* Header / Status */}
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${state.isConnected ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
            <span className="text-xs font-medium text-white/50 tracking-wider uppercase">
              {state.isConnected ? (IS_DEMO_MODE ? 'Demo Mode' : 'Connected') : 'Offline'}
            </span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => handleCommand(CommandType.SYSTEM_DISPLAY_SLEEP)}
              className="text-white/40 hover:text-white transition-colors"
              title="Sleep Display"
            >
              <Monitor size={20} />
            </button>
            <button 
              onClick={() => handleCommand(CommandType.SYSTEM_SLEEP)}
              className="text-white/40 hover:text-red-400 transition-colors"
              title="Sleep System"
            >
              <Power size={20} />
            </button>
          </div>
        </div>

        {/* Album Art / Visualizer */}
        <div className="aspect-square w-full bg-black/20 rounded-[2rem] overflow-hidden relative shadow-inner border border-white/5 group">
          <img 
            src={state.albumArt} 
            alt="Album Art" 
            className={`w-full h-full object-cover transition-transform duration-700 ${state.isPlaying ? 'scale-105' : 'scale-100 grayscale-[50%]'}`}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Track Info */}
          <div className="absolute bottom-0 left-0 w-full p-6 text-center transform transition-transform duration-500">
             <h2 className="text-2xl font-bold text-white mb-1 truncate drop-shadow-md">{state.trackName}</h2>
             <p className="text-white/60 text-lg truncate font-medium">{state.artistName}</p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex flex-col gap-8">
          {/* Main Buttons */}
          <div className="flex items-center justify-between px-4">
            <ControlBtn 
              icon={<SkipBack fill="currentColor" size={24} />} 
              onClick={() => handleCommand(CommandType.PREV)}
              size="lg"
            />
            
            <ControlBtn 
              icon={state.isPlaying ? <Pause fill="currentColor" size={32} /> : <Play fill="currentColor" size={32} className="ml-1" />} 
              onClick={() => handleCommand(state.isPlaying ? CommandType.PAUSE : CommandType.PLAY)}
              size="xl"
              active={state.isPlaying}
              className="scale-110"
            />
            
            <ControlBtn 
              icon={<SkipForward fill="currentColor" size={24} />} 
              onClick={() => handleCommand(CommandType.NEXT)}
              size="lg"
            />
          </div>

          {/* Volume Control (Button Style) */}
          <div className="w-full bg-white/10 backdrop-blur-xl rounded-3xl p-4 flex items-center justify-between border border-white/5 shadow-xl">
            <ControlBtn 
               icon={<Volume1 size={24} />}
               onClick={() => handleCommand(CommandType.VOL_DOWN)}
               size="md"
               className="bg-white/5 hover:bg-white/20"
            />
            
            <div className="flex flex-col items-center gap-1">
                <ControlBtn 
                   icon={state.isMuted ? <VolumeX size={24} className="text-red-400" /> : <Volume2 size={24} />}
                   onClick={() => handleCommand(CommandType.MUTE)}
                   size="md"
                   className="bg-transparent hover:bg-white/10 shadow-none"
                />
                <span className="text-xs font-medium text-white/40">{state.volume}%</span>
            </div>

             <ControlBtn 
               icon={<Volume2 size={24} />}
               onClick={() => handleCommand(CommandType.VOL_UP)}
               size="md"
               className="bg-white/5 hover:bg-white/20"
            />
          </div>
        </div>
      </div>

      {/* Demo Mode Badge */}
      {IS_DEMO_MODE && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/20 text-xs">
          Frontend Demo Mode • No Backend Required
        </div>
      )}
    </div>
  );
};

export default App;