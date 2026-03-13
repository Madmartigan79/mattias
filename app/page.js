"use client";
import { useEffect, useState } from 'react';

const TAVLA_BAKGRUND = '#1a1a1a';
const TEXT_FÄRG = '#f0f0f0';
const TID_FÄRG = '#FF9F00';
const RAM_FÄRG = '#333';

// Mellanläge för tavlans ram och yttre marginaler
const mainStyle = {
  maxWidth: '450px',
  margin: '1rem auto', 
  fontFamily: '"VT323", monospace',
  padding: '0.8rem 1rem', 
  color: TEXT_FÄRG,
  border: `8px solid ${RAM_FÄRG}`, 
  borderRadius: '4px',
  boxShadow: '0 0 20px rgba(255,160,0, 0.12)',
  backgroundColor: TAVLA_BAKGRUND,
};

// Mellanläge för rubrikerna (hållplatserna)
const stopNameStyle = {
  fontSize: '1.4rem', 
  textTransform: 'uppercase',
  color: '#aaa',
  marginBottom: '0.4rem', 
  letterSpacing: '1px',
  borderBottom: `2px solid ${RAM_FÄRG}`,
  paddingBottom: '0.3rem', 
};

// Mellanläge för radavstånd
const departureRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.5rem 0', 
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
        fontSize: '1.8rem', 
        fontWeight: 'bold', 
        marginBottom: '1.2rem', 
        marginTop: '0.5rem',
        color: TID_FÄRG, 
        textAlign: 'center', 
        textTransform: 'uppercase' 
      }}>
        NÄSTA AVGÅNG
      </h1>

      {data.map((stop, idx) => (
        // Mellanläge för utrymmet mellan hållplatserna
        <section key={idx} style={{ marginBottom: '1.5rem' }}> 
          <h2 style={stopNameStyle}>
            {stop.stop}
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {stop.departures.length > 0 ? (
              stop.departures.map((d, i) => (
                <div key={i} style={departureRowStyle}>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={{ 
                      backgroundColor: d.type === 'TRAIN' ? '#0070f3' : '#e00000', 
                      color: 'white', 
                      padding: '0.15rem 0.4rem', 
                      borderRadius: '3px', 
                      fontFamily: '"VT323", monospace',
                      fontSize: '1.1rem', 
                    }}>
                      {d.line}
                    </span>
                    <span style={{ fontSize: '1.25rem' }}>{d.destination}</span>
                  </div>
                  
                  <span style={{ 
                    fontSize: '1.9rem', 
                    color: TID_FÄRG, 
                    letterSpacing: '-1px' 
                  }}>
                    {d.time}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ color: '#555', fontStyle: 'italic', fontSize: '1rem', textAlign: 'center', padding: '0.8rem 0' }}>
                INGA AVGÅNGAR
              </div>
            )}
          </div>
        </section>
      ))}
    </main>
  );
}
