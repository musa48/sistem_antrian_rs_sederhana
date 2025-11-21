"use client";
import { useEffect, useState} from "react";

export default function DisplayPage() {
  const [now, setNow] = useState<Date | null>(null);
  const [current, setCurrent] = useState("--");
  const [queueList, setQueueList] = useState<string[]>([]);

  useEffect(() => {
    loadDisplay();
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);

    const socket = new WebSocket("ws://localhost:3010");

    socket.onopen = () => {
      console.log("WS Connected");
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log("WS RECEIVED:", msg);
        // loadDisplay();

        if (msg.event === "tokenUpdate") {
          loadDisplay();
          // if (msg.data?.current?.no_antrian) {
          //   setCurrent(msg.data.current.no_antrian);
          // }

          // if (Array.isArray(msg.data?.waiting)) {
          //   const list = msg.data.waiting.map((item: any) => item.no_antrian);
          //   setQueueList(list);
          // }
        }
      } catch (err) {
        console.error("Invalid WS message:", err);
      }
    };

    socket.onerror = (err) => console.error("WS Error:", err);

    return () => {
      clearInterval(interval);
      socket.close();
    };
  }, []);

  async function loadDisplay() {
    try {
      const res = await fetch("http://localhost:3010/antrian/display")
        .then(r => r.json());

      if (res && Object.keys(res).length > 0) {
        if (res.current?.no_antrian) setCurrent(res.current.no_antrian);
        if (Array.isArray(res.waiting)) {
          setQueueList(res.waiting.map((item: any) => item.no_antrian));
        }
      } else {
        setCurrent("--");
        setQueueList([]);
      }

    } catch (err) {
      console.error("Gagal fetch nomor antrian:", err);
    }
  }

  const formatTanggal = now ? now.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "--";

  const formatJam = now ? now.toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit",  second: "2-digit", }) : "--";

  return (
    <div className="w-full h-screen bg-[#0092B8] p-6 flex flex-col">
      <div className="flex flex-1 mt-3">
        {/* LEFT PANEL */}
        <div className="w-[28%] rounded-xl flex flex-col mt-2">
          <div className="bg-white rounded-lg border-2 border-[#0092B8] text-center shadow">
            <div className="text-4xl font-semibold text-gray-700 mt-4">
              Nomor Antrian
            </div>
            <div className="text-[7rem] font-extrabold p-4 text-gray-900">
              {current}
            </div>
            <div className="bg-[#FFC107] text-white font-bold rounded-md py-4 text-5xl">
              LOKET 1
            </div>
          </div>

          <div className="bg-white rounded-lg border-2 border-gray-300 py-6 mt-5 shadow text-center">
            <div className="text-4xl font-semibold text-gray-700">
              Dalam Antrian
            </div>

            <div className="mt-3 text-5xl font-bold text-gray-900 h-fit space-y-3">
              {queueList.length > 0 ? (
                queueList.map((q, i) => <div key={i}>{q}</div>)
              ) : (
                <div>--</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-col w-full ml-8 rounded-xl overflow-hidden relative">
          <div className="flex items-center bg-[#0092B8] gap-2 text-white px-6 pb-4">
            <img src="/ic_logo.png" alt="logo" className="w-auto h-20 mr-3" />
            <h1 className="text-6xl font-extrabold tracking-wide text-shadow-2xs">
              KLINIK PASTI SEMBUH
            </h1>
          </div>

          <img src="/img_bg.png" className="w-full h-[68vh] object-cover" alt="IGD" />

          <div className="absolute bottom-0 w-full bg-[#FBC02D] text-black py-4 px-8 flex justify-between items-center text-xl font-bold">
            <span className="text-3xl font-bold text-white">{formatTanggal}</span>
            <span className="text-5xl font-extrabold text-white"> {formatJam.replace(/\./g, " : ")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
