"use client";
import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartures = async () => {
    try {
      const res = await fetch('/api/departures');
      const json = await res.json();
      setData(json);
      setLoading(false);
    } catch (e) { console.error("Error fetching", e); }
  };

  useEffect(() => {
    fetchDepartures();
    const timer = setInterval(fetchDepartures, 30000); // Uppdatera var 30:e sek
    return () => clearInterval(timer);
  }, []);

  if (loading) return <div className="p-10">Laddar avgångar...</div>;

  return (
    <main className="max-w-md mx-auto p-6 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 text-blue-900">Nästa Resa</h1>

      {data.map((stop) => (
        <section key={stop.stopId} className="mb-10 bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">
            {stop.stopName}
          </h2>
          
          <div className="space-y-4">
            {stop.departures
              .filter(d => {
                // Solhagavägen: Buss 117 mot Brommaplan
                if (stop.stopName === 'Solhagavägen') {
                  return d.line.designation === '117' && d.destination.includes('Brommaplan');
                }
                // Spånga: Pendeltåg söderut (Destination t.ex. Västerhaninge, Nynäshamn, Tumba)
                if (stop.stopName === 'Spånga station') {
                   return d.transport_mode === 'TRAIN' && d.direction_code === 1; 
                }
                return false;
              })
              .slice(0, 3) // Ta de 3 närmaste
              .map((d, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-white font-bold text-sm ${d.transport_mode === 'BUS' ? 'bg-red-500' : 'bg-blue-600'}`}>
                      {d.line.designation}
                    </span>
                    <span className="font-medium text-gray-700">{d.destination}</span>
                  </div>
                  <span className="text-xl font-mono font-black text-blue-700">
                    {d.display} {/* Visar t.ex. "5 min" eller "14:45" */}
                  </span>
                </div>
              ))}
          </div>
        </section>
      ))}
    </main>
  );
}
