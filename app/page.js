"use client";
import { useEffect, useState } from 'react';

const TAVLA_BAKGRUND = '#1a1a1a';
const TEXT_FÄRG = '#f0f0f0';
const TID_FÄRG = '#FF9F00';
const RAM_FÄRG = '#333';

// Tajtare ram och mindre marginaler i toppen/botten
const mainStyle = {
  maxWidth: '450px',
  margin: '0.5rem auto', // Trimmad från 2rem
  fontFamily: '"VT323", monospace',
  padding: '0.5rem 1rem', // Trimmad padding
  color: TEXT_FÄRG,
  border: `6px solid ${RAM_FÄRG}`, // Lite tunnare ram
  borderRadius: '4px',
  boxShadow: '0 0 15px rgba(255,160,0, 0.1)',
  backgroundColor: TAVLA_BAKGRUND,
};

// Mindre rubriker (hållplatsnamn)
const stopNameStyle = {
  fontSize: '1.2rem', // Krympt från 1.6rem
  textTransform: 'uppercase',
  color: '#aaa',
  marginBottom: '0.2rem', // Trimmad från 0.8rem
  letterSpacing: '1px',
  borderBottom: `1px solid ${RAM_FÄRG}`,
  paddingBottom: '0.2rem', // Trimmad från 0.5rem
};

// Tätare rader för bussarna/tågen
const departureRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.3rem 0', // Trimmad från 0.8rem
  borderBottom: `1px solid ${RAM_FÄRG}`,
};

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
    const timer = setInterval(fetchDepartures, 30000); 
    return () => clearInterval(timer);
  }, []);

  if (loading) return (
    <div style={{ ...mainStyle, textAlign: 'center', color: TID_FÄRG, padding: '2rem' }}>
      HÄMTAR AVGÅNGAR... ⏳
    </div>
  );

  return (
    <main style={mainStyle}>
      <h1 style={{ 
        fontSize: '1.5rem', // Krympt från 2rem
        fontWeight: 'bold', 
        marginBottom: '0.8rem', // Trimmad från 2rem
        marginTop: '0.5rem',
        color: TID_FÄRG, 
        textAlign: 'center', 
        textTransform: 'uppercase' 
      }}>
        NÄSTA AVGÅNG
      </h1>

      {data.map((stop, idx) => (
        // Krympt avstånd mellan varje hållplats-sektion
        <section key={idx} style={{ marginBottom: '1rem' }}> 
          <h2 style={stopNameStyle}>
            {stop.stop}
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {stop.departures.length > 0 ? (
              stop.departures.map((d, i) => (
                <div key={i} style={departureRowStyle}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ 
                      backgroundColor: d.type === 'TRAIN' ? '#0070f3' : '#e00000', 
                      color: 'white', 
                      padding: '0.1rem 0.4rem', 
                      borderRadius: '3px', 
                      fontFamily: '"VT323", monospace',
                      fontSize: '1rem', // Krympt från 1.1rem
                    }}>
                      {d.line}
                    </span>
                    <span style={{ fontSize: '1.1rem' }}>{d.destination}</span>
                  </div>
                  
                  <span style={{ 
                    fontSize: '1.6rem', // Krympt från 2.2rem
                    color: TID_FÄRG, 
                    letterSpacing: '-1px' 
                  }}>
                    {d.time}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ color: '#555', fontStyle: 'italic', fontSize: '0.9rem', textAlign: 'center', padding: '0.5rem 0' }}>
                INGA AVGÅNGAR
              </div>
            )}
          </div>
        </section>
      ))}
    </main>
  );
}
