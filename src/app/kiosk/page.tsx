"use client";
import { useState, useEffect } from "react";
const showCustomAlert = (message) => {
    alert(message);
};

export default function KioskPage() {
    const [kiosk, setKiosk] = useState("--"); 
    const [lastGenerated, setLastGenerated] = useState(null); 
    const updateCurrentToken = (data) => {
        if (data.kiosk?.no_antrian) {
            setKiosk(data.kiosk.no_antrian);
        } else if (data.waiting?.length > 0) {
            setKiosk(data.waiting[0].no_antrian); 
        } else {
            setKiosk("--");
        }
    };

    useEffect(() => {
        const wsUrl = "ws://localhost:3010";
        const socket = new WebSocket(wsUrl); 

        socket.onopen = () => {
            console.log('WebSocket Connected to:', wsUrl);
        };
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.event === "tokenUpdate") {
                console.log("Real-time Update:", data.data);
                updateCurrentToken(data.data);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };
        
        async function fetchCurrent() {
            try {
                const res = await fetch("/api", {
                    method: "POST",
                    body: JSON.stringify({ action: "current" }),
                    headers: { "Content-Type": "application/json" },
                }).then((res) => res.json());
                  updateCurrentToken(res);

            } catch (err) {
                console.error("Gagal fetch current token:", err);
            }
        }

        fetchCurrent();

        return () => socket.close();
    }, []);

    async function ambilNomor() {
        try {
            const res = await fetch("/api", {
                method: "POST",
                body: JSON.stringify({ action: "new" }),
                headers: { "Content-Type": "application/json" },
            }).then((res) => res.json());

            if (res?.no_antrian) {
                const newToken = res.no_antrian;
                setLastGenerated(newToken);

                setTimeout(() => {
                    setLastGenerated(null);
                }, 6000);

                showCustomAlert("Nomor Antrian Anda: " + newToken);
            }
        } catch (err) {
            console.error(err);
            showCustomAlert("Gagal mengambil nomor antrian");
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center font-sans">
            <header className="w-full bg-[#0092B8] py-6 text-center text-4xl text-white font-bold shadow-lg">
                PENDAFTARAN PASIEN BARU
            </header>
            
            <main className="flex flex-col items-center flex-grow w-full max-w-4xl p-4">
                <div className="mt-20 bg-white p-10 rounded-3xl shadow-2xl text-center border-4 border-cyan-500 transform transition duration-500 hover:scale-[1.02]">
                    <div className="text-3xl text-gray-600">Antrian Terakhir</div>
                    <div className="text-8xl text-[#0092B8] font-extrabold mt-2 tracking-wider">{kiosk}</div>
                </div>

                <button
                    onClick={ambilNomor}
                    className="mt-16 bg-cyan-600 hover:bg-cyan-700 text-white py-6 px-20 text-4xl rounded-xl border-none transition duration-200 ease-in-out shadow-2xl transform hover:shadow-cyan-400 hover:scale-105 active:scale-95 font-semibold"
                >
                    Ambil Nomor Antrian
                </button>
                
                {lastGenerated && (
                    <div className="mt-8 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg shadow-md text-xl">
                        Nomor Anda: <span className="font-bold text-2xl">{lastGenerated}</span>. Silakan tunggu.
                    </div>
                )}
            </main>

            <footer className="flex mt-auto w-full py-4 bg-[#0092B8] items-center text-white justify-center text-xl font-semibold shadow-inner">
                <img src="/ic_logo.png" alt="logo" className="w-auto h-15 mr-3" />
                Selamat Datang di Klinik Pasti Sembuh
            </footer>
        </div>
    );
}