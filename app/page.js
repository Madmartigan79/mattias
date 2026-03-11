"use client";
import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartures = async () => {
    try {
      const res = await fetch('/api/departures');
      const json = await res.json();
      console.log("Data från API:", json); // Kolla i webbläsarens konsol!
      setData(json);
      setLoading(false);
    } catch (e) { 
      console.error("Fetch error:", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartures();
    const timer = setInterval(fetchDepartures, 30000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <div className="p-10 font-sans">Hämtar tider från SL...</div>;

  return (
    <main className="max-w-md mx-auto p-6 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-black mb-8 text-blue-900 italic">SL REALTID</h1>

      {data.map((stop) => {
        // Filtrera fram tågen/bussarna här
        const filtered = stop.departures.filter(d => {
          if (stop.stopName === 'Solhagavägen') {
            return d.line?.designation === '117';
          }
          if (stop.stopName === 'Spånga station') {
            return d.transport_mode === 'TRAIN'; 
          }
          return true;
        }).slice(0, 3);

        return (
          <section key={stop.stopId} className="mb-10 bg-white rounded-2xl shadow-lg p-5 border-l-8 border-blue-600">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
              {stop.stopName}
            </h2>
            
            <div className="space-y-4">
              {filtered.length > 0 ? filtered.map((d, i) => (
                <div key={i} className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">
                      {d.line?.designation || '???'}
                    </span>
                    <span className="font-semibold text-gray-700">{d.destination}</span>
                  </div>
                  <span className="text-xl font-mono font-bold text-orange-600">
                    {d.display || 'Nu'}
                  </span>
                </div>
              )) : (
                <p className="text-gray-400 italic text-sm">Inga kommande avgångar hittades just nu...</p>
              )}
            </div>
          </section>
        );
      })}
    </main>
  );
}
