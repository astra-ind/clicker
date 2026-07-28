/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useAppStore } from './store';
import { client, STATUS_TOPIC, TRIGGER_TOPIC } from './mqtt';
import { Controller } from './components/Controller';
import { Receiver } from './components/Receiver';
import { RadioReceiver, Settings2, Smartphone } from 'lucide-react';

export default function App() {
  const { role, setRole, setIsConnected, setReceiversOnline } = useAppStore();

  useEffect(() => {
    if (!role) return;

    client.connect();

    const handleConnect = () => {
      setIsConnected(true);
      
      // Both subscribe to status to know if receiver is online
      client.subscribe(STATUS_TOPIC);
      
      if (role === 'receiver') {
        // Receiver subscribes to triggers and broadcasts its status
        client.subscribe(TRIGGER_TOPIC);
        client.publish(STATUS_TOPIC, 'online', { retain: true });
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleMessage = (topic: string, message: Buffer) => {
      if (topic === STATUS_TOPIC) {
        setReceiversOnline(message.toString() === 'online');
      }
    };

    client.on('connect', handleConnect);
    client.on('disconnect', handleDisconnect);
    client.on('offline', handleDisconnect);
    client.on('message', handleMessage);

    if (client.connected) {
      handleConnect();
    }

    return () => {
      if (role === 'receiver' && client.connected) {
        client.publish(STATUS_TOPIC, 'offline', { retain: true });
      }
      client.off('connect', handleConnect);
      client.off('disconnect', handleDisconnect);
      client.off('offline', handleDisconnect);
      client.off('message', handleMessage);
      client.end(true);
    };
  }, [role, setIsConnected, setReceiversOnline]);

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-500 mb-6">
              <RadioReceiver className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-3">Pet Clicker MVP</h1>
            <p className="text-zinc-400">Select how you want to use this device.</p>
          </div>

          <div className="grid gap-4 mt-8">
            <button
              onClick={() => setRole('controller')}
              className="flex items-center p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 mr-4 shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-1">Controller</h2>
                <p className="text-sm text-zinc-400">Use this device as the remote control.</p>
              </div>
            </button>

            <button
              onClick={() => setRole('receiver')}
              className="flex items-center p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mr-4 shrink-0">
                <Settings2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-1">Receiver</h2>
                <p className="text-sm text-zinc-400">Leave this device with your pet to play the clicks.</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {role === 'controller' ? <Controller /> : <Receiver />}
      
      {/* Hidden button to reset role for testing */}
      <button 
        onClick={() => setRole(null)} 
        className="fixed bottom-4 right-4 text-xs text-zinc-700 hover:text-zinc-400 p-2"
      >
        Change Role
      </button>
    </>
  );
}
