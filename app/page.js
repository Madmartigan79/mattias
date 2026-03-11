"use client";
import { useEffect, useState } from 'react';

export default function DepartureBoard() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDepartures = async () => {
    try {
      const res = await fetch('/api/departures');
      const json = await res.json();
      
      if (json.error) {
        setError(json.error);
      } else {
        setData(json);
        setError(null);
      }
    } catch (e) {
      setError("Kunde inte hämta data från servern.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartures();
    // Uppdatera automatiskt var 30:e sekund
    const timer = setInterval(fetchDepartures, 30000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>Laddar avgångar... ⏳</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', color: 'red', fontFamily: 'sans-serif' }}>Fel: {error}</div>;
  }

  return (
    <main style={{ maxWidth: '400px', margin: '2rem auto', fontFamily: 'sans-serif', padding: '0 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#333' }}>
        Nästa avgång 🚌🚆
      </h1>

      {data.map((stop, idx) => {
        // --- HÄR SKER FILTRERINGEN ---
        const filteredDepartures = stop.departures.filter(d => {
          if (stop.stop === 'Solhagavägen') {
            // Filtrera: Bara buss 117 (vi antar att riktning 1 eller 2 är mot Brommaplan, 
            // men för säkerhets skull kollar vi bara linjenumret först. Du kan finjustera detta sen!)
            return d.line === '117';
          }
          if (stop.stop === 'Spånga station') {
            // Filtrera: Bara Tåg (TRAIN) och riktning 1 (Söderut mot stan)
            return d.type === 'TRAIN' && d.direction === 1;
          }
          return true;
        }).slice(0, 3); // Begränsa till de 3 nästa avgångarna

        return (
          <section key={idx} style={{ marginBottom: '2rem', background: '#f9f9f9', padding: '1rem', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '1.1rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#555' }}>
              {stop.stop}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {filteredDepartures.length > 0 ? (
                filteredDepartures.map((d, i) => (
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
