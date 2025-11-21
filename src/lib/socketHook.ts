import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

export function socketHook() {
  const [state, setState] = useState(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3000');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('connected to ws', socket.id);
    });

    socket.on('queue:all', (payload) => setState(payload));
    socket.on('queue:update', (payload) => {
      // merge update — for simplicity: replace whole state
      setState(payload);
    });

    socket.on('queue:call', (payload) => {
      // trigger visual effect, maybe toast/sound
      // we can keep lastCall in state
      setState((s) => ({ ...s, lastCall: payload }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { state, socket: socketRef.current };
}
