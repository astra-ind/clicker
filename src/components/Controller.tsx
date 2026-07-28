import React from 'react';
import { useAppStore } from '../store';
import { client, TRIGGER_TOPIC } from '../mqtt';
import { Wifi, WifiOff, Send } from 'lucide-react';
import { motion } from 'motion/react';

export function Controller() {
  const { isConnected, receiversOnline } = useAppStore();

  const handleTrigger = () => {
    client.publish(TRIGGER_TOPIC, 'trigger');
    // Optional: local vibration feedback on the controller
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-6">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Remote Controller</h1>
        
        <div className="flex items-center justify-center gap-2 text-sm">
          {!isConnected ? (
            <span className="flex items-center gap-1 text-red-500">
              <WifiOff className="w-4 h-4" /> Disconnected
            </span>
          ) : receiversOnline ? (
            <span className="flex items-center gap-1 text-emerald-500">
              <Wifi className="w-4 h-4" /> Receiver Online
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-500">
              <Wifi className="w-4 h-4" /> Receiver Offline
            </span>
          )}
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleTrigger}
        disabled={!isConnected}
        className="relative flex items-center justify-center w-64 h-64 rounded-full bg-blue-600 hover:bg-blue-500 shadow-[0_0_40px_rgba(37,99,235,0.4)] disabled:bg-zinc-800 disabled:shadow-none transition-colors select-none"
      >
        <span className="text-4xl font-black tracking-widest text-white">CLICK</span>
      </motion.button>
      
      <p className="mt-12 text-zinc-500 text-sm max-w-xs text-center">
        Tap the button to instantly trigger the receiver device.
      </p>
    </div>
  );
}
