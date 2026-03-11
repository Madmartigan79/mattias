"use client";
import { useEffect, useState } from 'react';

export default function DepartureBoard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartures = async () => {
    try {
      const res = await fetch('/api/departures');
      const json = await res.json();
      if (!json.error) setData(json);
    } catch (e) {
      console.error("Kunde inte hämta data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartures();
    const timer = setInterval(fetchDepartures, 30000); // 30 sek uppdatering
    return () => clearInterval(timer);
  }, []);

  if (loading) return <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>Laddar avgångar... ⏳</div>;

  return (
    <main style={{ maxWidth: '400px', margin: '2rem auto', fontFamily: 'sans-serif', padding: '0 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#333' }}>
        Nästa avgång 🚌🚆
      </h1>

      {data.map((stop, idx) => {
        // Vi väljer att bara visa de 3 första på skärmen
        const nextThree = stop.departures.slice(0, 3);

        return (
          <section key={idx} style={{ marginBottom: '2rem', background: '#f9f9f9', padding: '1rem', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '1.1rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#555' }}>
              {stop.stop}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {nextThree.length > 0 ? (
                nextThree.map((d, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ 
                        backgroundColor: d.type === 'TRAIN' ? '#0070f3' : '#e00000', 
                        color: 'white', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px', 
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}>
                        {d.line}
                      </span>
                      <span style={{ fontSize: '0.95rem', color: '#333' }}>{d.destination}</span>
                    </div>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#000' }}>
                      {d.time}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ color: '#888', fontStyle: 'italic', fontSize: '0.9rem' }}>
                  Inga avgångar hittades just nu.
                </div>
              )}
            </div>
          </section>
        );
      })}
    </main>
  );
}
