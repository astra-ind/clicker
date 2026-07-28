import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ClickSoundType } from './audio';

export type OutputMode = 'click' | 'vibration' | 'both';

interface AppState {
  role: 'controller' | 'receiver' | null;
  setRole: (role: 'controller' | 'receiver' | null) => void;
  
  // Receiver settings
  outputMode: OutputMode;
  setOutputMode: (mode: OutputMode) => void;
  soundType: ClickSoundType;
  setSoundType: (type: ClickSoundType) => void;
  volume: number; // 0 to 1
  setVolume: (vol: number) => void;
  keepAwake: boolean;
  setKeepAwake: (awake: boolean) => void;
  
  // Ephemeral state
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  receiversOnline: boolean;
  setReceiversOnline: (online: boolean) => void;
  lastClickTime: number | null;
  setLastClickTime: (time: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      role: null,
      setRole: (role) => set({ role }),
      
      outputMode: 'both',
      setOutputMode: (outputMode) => set({ outputMode }),
      
      soundType: 'mechanical',
      setSoundType: (soundType) => set({ soundType }),
      
      volume: 1,
      setVolume: (volume) => set({ volume }),
      
      keepAwake: false,
      setKeepAwake: (keepAwake) => set({ keepAwake }),
      
      isConnected: false,
      setIsConnected: (isConnected) => set({ isConnected }),
      
      receiversOnline: false,
      setReceiversOnline: (receiversOnline) => set({ receiversOnline }),
      
      lastClickTime: null,
      setLastClickTime: (lastClickTime) => set({ lastClickTime }),
    }),
    {
      name: 'pet-clicker-storage',
      partialize: (state) => ({
        role: state.role,
        outputMode: state.outputMode,
        soundType: state.soundType,
        volume: state.volume,
        keepAwake: state.keepAwake,
      }),
    }
  )
);
