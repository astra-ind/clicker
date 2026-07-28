import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store';
import { client, TRIGGER_TOPIC } from '../mqtt';
import { playClick, getAudioContext } from '../audio';
import { Settings, Volume2, Bell, Vibrate, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';

export function Receiver() {
  const {
    outputMode,
    setOutputMode,
    soundType,
    setSoundType,
    volume,
    setVolume,
    keepAwake,
    setKeepAwake,
    isConnected,
    lastClickTime,
    setLastClickTime
  } = useAppStore();

  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  // Wake lock management
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && keepAwake) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          setWakeLockActive(true);
          wakeLockRef.current.addEventListener('release', () => {
            setWakeLockActive(false);
          });
        }
      } catch (err: any) {
        console.error('Wake Lock error:', err);
      }
    };

    if (keepAwake) {
      requestWakeLock();
    } else if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }

    const handleVisibilityChange = () => {
      if (keepAwake && document.visibilityState === 'visible' && !wakeLockRef.current) {
        requestWakeLock();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
    };
  }, [keepAwake]);

  // Audio Context initialization on first interaction
  const initAudio = () => {
    getAudioContext();
  };

  const handleTest = () => {
    initAudio();
    triggerAction();
  };

  const triggerAction = () => {
    setLastClickTime(Date.now());
    
    if (outputMode === 'click' || outputMode === 'both') {
      playClick(soundType, volume);
    }
    
    if ((outputMode === 'vibration' || outputMode === 'both') && navigator.vibrate) {
      navigator.vibrate(200); // 200ms vibration
    }
  };

  useEffect(() => {
    const handleMessage = (topic: string) => {
      if (topic === TRIGGER_TOPIC) {
        triggerAction();
      }
    };
    
    client.on('message', handleMessage);
    return () => {
      client.off('message', handleMessage);
    };
  }, [outputMode, soundType, volume]);

  const timeString = lastClickTime ? new Date(lastClickTime).toLocaleTimeString() : 'Never';

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white p-6 pb-20 max-w-md mx-auto" onClick={initAudio}>
      <header className="flex justify-between items-center mb-8 pt-4">
        <h1 className="text-2xl font-bold tracking-tight">Receiver</h1>
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span className="text-zinc-400">{isConnected ? 'Online' : 'Offline'}</span>
        </div>
      </header>

      <div className="bg-zinc-900 rounded-2xl p-6 mb-6 shadow-sm border border-zinc-800">
        <h2 className="text-sm uppercase tracking-wider text-zinc-500 mb-1">Last Trigger</h2>
        <div className="text-3xl font-light tabular-nums">{timeString}</div>
      </div>

      <div className="space-y-6">
        <section className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-6">
          
          {/* Output Mode */}
          <div>
            <label className="text-sm font-medium text-zinc-400 block mb-3">Output Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {(['click', 'vibration', 'both'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setOutputMode(mode)}
                  className={`py-3 px-2 rounded-xl text-sm font-medium capitalize transition-colors ${outputMode === mode ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Type */}
          <div className={(outputMode === 'vibration') ? 'opacity-50 pointer-events-none' : ''}>
            <label className="text-sm font-medium text-zinc-400 block mb-3">Sound Profile</label>
            <div className="grid grid-cols-3 gap-2">
              {(['mechanical', 'soft', 'loud'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setSoundType(type)}
                  className={`py-2 px-2 rounded-xl text-sm capitalize transition-colors ${soundType === type ? 'bg-zinc-700 text-white' : 'bg-zinc-950 text-zinc-500 hover:bg-zinc-800 border border-zinc-800'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Volume */}
          <div className={(outputMode === 'vibration') ? 'opacity-50 pointer-events-none' : ''}>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-zinc-400">Volume</label>
              <span className="text-xs text-zinc-500">{Math.round(volume * 100)}%</span>
            </div>
            <div className="flex items-center gap-4">
              <VolumeX className="w-4 h-4 text-zinc-500" />
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 accent-blue-600 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
              <Volume2 className="w-4 h-4 text-zinc-500" />
            </div>
          </div>
        </section>

        <section className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Keep Screen Awake</div>
              <div className="text-sm text-zinc-500">Prevents device from sleeping</div>
            </div>
            <button 
              onClick={() => setKeepAwake(!keepAwake)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${keepAwake ? 'bg-blue-600' : 'bg-zinc-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${keepAwake ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {keepAwake && !wakeLockActive && (
            <div className="text-xs text-amber-500">
              Wake lock is pending. Tap anywhere on screen to activate.
            </div>
          )}
        </section>

        <button 
          onClick={handleTest}
          className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-xl font-medium transition-colors border border-zinc-700"
        >
          Test Output
        </button>
      </div>
    </div>
  );
}
