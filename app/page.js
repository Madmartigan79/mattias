// app/page.js
"use client";
import { useEffect, useState } from 'react';

// === STYLING-KONSTANTER ===
const TAVLA_BAKGRUND = '#1a1a1a'; // Mörkgrå färg för "tavlan"
const SKYLTPANEL_BAKGRUND = '#1a1a1a'; // Samma som tavlan för sömlös känsla
const TEXT_FÄRG = '#f0f0f0'; // Vit/gul färg för destination och linje
const TID_FÄRG = '#FF9F00'; // Klassisk SL-orange för minuterna
const RAM_FÄRG = '#333'; // Mörkgrå ram runt tavlan

// Skapar ramen runt hela tavlan
const mainStyle = {
  maxWidth: '450px',
  margin: '2rem auto',
  fontFamily: '"VT323", monospace', // Vårt nya pixel-typsnitt
  padding: '1rem',
  color: TEXT_FÄRG,
  border: `10px solid ${RAM_FÄRG}`, // Tjock ram
  borderRadius: '4px',
  boxShadow: '0 0 30px rgba(255,160,0, 0.15)', // En svag, varm glöd
  backgroundColor: TAVLA_BAKGRUND,
};

// Stilen för rubriken (t.ex. Solhagavägen)
const stopNameStyle = {
  fontSize: '1.6rem',
  textTransform: 'uppercase', // Alltid stora bokstäver
  color: '#aaa', // Lite svagare vit färg
  marginBottom: '0.8rem',
  letterSpacing: '2px', // Lite mer luft mellan bokstäverna
  borderBottom: `2px solid ${RAM_FÄRG}`,
  paddingBottom: '0.5rem',
};

// Varje rad i avgångstabellen
const departureRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.8rem 0',
  borderBottom: `1px solid ${RAM_FÄRG}`,
};

const DepartureBoard = () => {
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
    <div style={{ ...mainStyle, textAlign: 'center', color: TID_FÄRG }}>
      HÄMTAR AVGÅNGAR... ⏳
    </div>
  );

  return (
    <main style={mainStyle}>
      {/* Rubriken längst upp på själva tavlan */}
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        marginBottom: '2rem', 
        color: TID_FÄRG, 
        textAlign: 'center', 
        textTransform: 'uppercase' 
      }}>
        MOT SKOLA OCH JOBB
      </h1>

      {data.map((stop, idx) => (
        <section key={idx} style={{ marginBottom: '2.5rem' }}>
          <h2 style={stopNameStyle}>
            {stop.stop}
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {stop.departures.length > 0 ? (
              stop.departures.map((d, i) => (
                <div key={i} style={departureRowStyle}>
                  {/* Linje och Destination */}
                  <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    {/* Linje-bricka */}
                    <span style={{ 
                      backgroundColor: d.type === 'TRAIN' ? '#0070f3' : '#e00000', 
                      color: 'white', 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '4px', 
                      fontFamily: '"VT323", monospace', // Samma typsnitt här
                      fontSize: '1.1rem',
                      fontWeight: 'bold'
                    }}>
                      {d.line}
                    </span>
                    {/* Destination */}
                    <span style={{ fontSize: '1.4rem' }}>{d.destination}</span>
                  </div>
                  
                  {/* Tid */}
                  <span style={{ 
                    fontSize: '2.2rem', 
                    color: TID_FÄRG, 
                    fontWeight: 'normal', // Typsnittet VT323 är redan tjockt
                    letterSpacing: '-2px' // Lite tätare för siffrorna
                  }}>
                    {d.time}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ color: '#aaa', fontStyle: 'italic', fontSize: '1rem', textAlign: 'center', padding: '1rem 0' }}>
                INGA AVGÅNGAR FUNNA.
              </div>
            )}
          </div>
        </section>
      ))}
    </main>
  );
};

export default DepartureBoard;
