"use client";
import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDepartures = async () => {
    try {
      const res = await fetch('/api/departures');
      const json = await res.json();
      
      // Om API:et skickade ett felmeddelande istället för en lista
      if (json.error || !Array.isArray(json)) {
        setError(json.error || "Kunde inte ladda data");
      } else {
        setData(json);
        setError(null);
      }
    } catch (e) {
      setError("Kunde inte kontakta servern");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartures();
    const timer = setInterval(fetchDepartures, 30000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <div style={{padding: '20px', fontFamily: 'sans-serif'}}>Hämtar tider...</div>;
  if (error) return <div style={{padding: '20px', color: 'red', fontFamily: 'sans-serif'}}>Fel: {error}</div>;

  return (
    <main style={{maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif', padding: '20px'}}>
      <h1 style={{color: '#003399'}}>Mina Avgångar</h1>

      {data.map((stop, idx) => (
        <section key={idx} style={{marginBottom: '30px', background: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
          <h2 style={{fontSize: '1.2rem', borderBottom: '2px solid #eee', pb: '5px'}}>{stop.stop}</h2>
          
          <div style={{marginTop: '10px'}}>
            {stop.departures && stop.departures.length > 0 ? (
              stop.departures.map((d, i) => (
                <div key={i} style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f9f9f9'}}>
                  <span>
                    <strong style={{background: '#eee', padding: '2px 5px', borderRadius: '3px', marginRight: '10px'}}>
                      {d.line}
                    </strong> 
                    {d.destination}
                  </span>
                  <span style={{fontWeight: 'bold', color: '#ff4500'}}>{d.time}</span>
                </div>
              ))
            ) : (
              <p style={{color: '#999', fontSize: '0.9rem'}}>Inga avgångar just nu.</p>
            )}
          </div>
        </section>
      ))}
    </main>
  );
}
