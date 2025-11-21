"use client";
import { useState, useEffect, useRef } from "react";

interface Antrian {
  id_antrian: number;
  no_antrian: string;
  status: string;
}

export default function AdminPage() {
  const [currentToken, setCurrentToken] = useState<Antrian | null>(null);
  const [queueList, setQueueList] = useState<Antrian[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  async function loadQueue() {
    try {
      const res = await fetch("/api", {
        method: "POST",
        body: JSON.stringify({ action: "current" }),
        headers: { "Content-Type": "application/json" },
      }).then(r => r.json());

      if (res.current) setCurrentToken(res.current);
      else setCurrentToken(null);

    } catch (err) {
      console.error("Gagal fetch nomor antrian:", err);
      setCurrentToken(null);
    }
  }
   async function loadListQueue() {
    try {
      const res = await fetch("/api", {
        method: "POST",
        body: JSON.stringify({ action: "waiting" }),
        headers: { "Content-Type": "application/json" },
      }).then(r => r.json());

      if (Array.isArray(res)) setQueueList(res);
      else setQueueList([]);

    } catch (err) {
      console.error("Gagal fetch nomor antrian:", err);
      setQueueList([]);
    }
  }

  useEffect(() => {
    loadQueue();
    loadListQueue();
    const ws = new WebSocket("ws://localhost:3010");
    socketRef.current = ws;

    ws.onopen = () => console.log("WS Connected");
    ws.onmessage = () => {
      loadQueue();
      loadListQueue();
    };
    ws.onerror = (err) => console.error("WS Error:", err);
    ws.onclose = () => console.warn("WS Closed");

    return () => ws.close();
  }, []);

  async function panggil() {
    if (!currentToken) return;
    try {
      const res = await fetch("/api", {
        method: "POST",
        body: JSON.stringify({ action: "call", idAntri: currentToken.id_antrian }),
        headers: { "Content-Type": "application/json" },
      }).then(r => r.json());

      if (res) {
        alert(`Nomor antrian berhasil dipanggil: ${res.no_antrian}`);
        loadQueue();
      }
    } catch (err) { console.error(err); }
  }

  async function ulangiPanggilan() {
    if (!currentToken) return;
    try {
      const res = await fetch("/api", {
        method: "POST",
        body: JSON.stringify({ action: "repeat", idAntri: currentToken.id_antrian }),
        headers: { "Content-Type": "application/json" },
      }).then(r => r.json());

      if (res) {
        alert(`Nomor antrian berhasil diulangi: ${res.no_antrian}`);
        loadQueue();
      }
    } catch (err) { console.error(err); }
  }

  async function skip() {
    if (!currentToken) return;
    console.log("datas",currentToken.id_antrian);
    try {
      const res = await fetch("/api", {
        method: "POST",
        body: JSON.stringify({ action: "skip", idAntri: currentToken.id_antrian }),
        headers: { "Content-Type": "application/json" },
      }).then(r => r.json());

      if (res) {
        alert(`Nomor antrian berhasil di-skip: ${res.no_antrian}`);
        loadQueue();
      }
    } catch (err) { console.error(err); }
  }

  async function selesai() {
    if (!currentToken) return;
    try {
      const res = await fetch("/api", {
        method: "POST",
        body: JSON.stringify({ action: "finish", idAntri: currentToken.id_antrian }),
        headers: { "Content-Type": "application/json" },
      }).then(r => r.json());

      if (res) {
        alert(`Nomor antrian selesai: ${res.no_antrian}`);
        loadQueue();
      }
    } catch (err) { console.error(err); }
  }

  return (
    <div className="p-4 sm:p-8 md:p-10 min-h-screen bg-gray-50 font-sans">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">
        Panel Operator Antrian Loket
      </h1>

      <div className="mb-8 p-4 sm:p-6 bg-cyan-600/10 border border-cyan-500 rounded-xl shadow-lg">
        <div className="text-xl font-semibold text-cyan-700">
          Antrian Saat Ini di Loket:
        </div>
        <div className="text-5xl sm:text-6xl font-extrabold text-cyan-800 mt-1">
          {currentToken ? currentToken.no_antrian : "--"}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 sm:gap-6">
        <button
          onClick={panggil}
          className="flex-1 min-w-[150px] bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 px-6 text-lg sm:text-xl rounded-xl shadow-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Panggil
        </button>

        <button
          onClick={ulangiPanggilan}
          className="flex-1 min-w-[150px] bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 px-6 text-lg sm:text-xl rounded-xl shadow-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Ulangi
        </button>

        <button
          onClick={skip}
          className="flex-1 min-w-[150px] bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 text-lg sm:text-xl rounded-xl shadow-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Skip
        </button>

        <button
          onClick={selesai}
          className="flex-1 min-w-[150px] bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 text-lg sm:text-xl rounded-xl shadow-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Selesai
        </button>
      </div>

      {/* Waiting Queue */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Daftar Antrian Menunggu
        </h2>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden max-h-96 overflow-y-auto border border-gray-200">
          {queueList.length === 0 ? (
            <div className="p-6 text-xl text-gray-500 text-center">
              Tidak ada antrian menunggu saat ini.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {queueList.map((q, i) => (
                <li
                  key={q.id_antrian}
                  className="px-6 py-3 text-xl font-medium text-gray-800 hover:bg-gray-50 transition duration-100"
                >
                  {i + 1}. {q.no_antrian}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
