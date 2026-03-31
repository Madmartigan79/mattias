// INGEN "use client" här! Nu körs allt detta på Vercels server istället.
export const dynamic = 'force-dynamic'; // Tvingar Vercel att alltid hämta nya tider

const TAVLA_BAKGRUND = '#1a1a1a';
const TEXT_FÄRG = '#f0f0f0';
const TID_FÄRG = '#FF9F00';
const RAM_FÄRG = '#333';

const mainStyle = {
  maxWidth: '450px', margin: '1rem auto', fontFamily: '"VT323", monospace',
  padding: '0.8rem 1rem', color: TEXT_FÄRG, border: `8px solid ${RAM_FÄRG}`, 
  borderRadius: '4px', boxShadow: '0 0 20px rgba(255,160,0, 0.12)', backgroundColor: TAVLA_BAKGRUND,
};

const stopNameStyle = {
  fontSize: '1.4rem', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.4rem', 
  letterSpacing: '1px', borderBottom: `2px solid ${RAM_FÄRG}`, paddingBottom: '0.3rem', 
};

const departureRowStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '0.5rem 0', borderBottom: `1px solid ${RAM_FÄRG}`,
};

export default async function DepartureBoard() {
  // 1. Vi hämtar datan direkt här på servern innan sidan ens skickas till iPaden
  const STOPS = [
    { name: 'Solhagavägen', url: 'https://transport.integration.sl.se/v1/sites/3717/departures?transport=BUS&line=117&forecast=60' },
    { name: 'Spånga station', url: 'https://transport.integration.sl.se/v1/sites/9704/departures?transport=TRAIN&direction=1&forecast=60' },
    { name: 'Svandammen', url: 'https://transport.integration.sl.se/v1/sites/3722/departures?transport=BUS&line=179&forecast=60' }
  ];

  let data = [];
  try {
    data = await Promise.all(
      STOPS.map(async (stop) => {
        const res = await fetch(stop.url, { cache: 'no-store' }); 
        if (!res.ok) return { stop: stop.name, departures: [] };

        const json = await res.json();
        let departures = (json.departures || []).map((item) => ({
          line: String(item.line?.designation || item.line?.id || "???"),
          destination: item.destination || "Okänd",
          time: item.display || "Nu",
          type: item.line?.transport_mode || (stop.name === 'Spånga station' ? 'TRAIN' : 'BUS')
        }));

        if (stop.name === 'Solhagavägen') departures = departures.filter(d => d.destination.toLowerCase().includes('brommaplan'));
        if (stop.name === 'Svandammen') departures = departures.filter(d => d.destination.toLowerCase().includes('vällingby'));

        return { stop: stop.name, departures: departures.slice(0, 3) };
      })
    );
  } catch (error) {
    console.error("Server-fel vid hämtning från SL");
  }

  // 2. Skickar det färdiga resultatet (och ett om-laddnings-skript) till iPad
  return (
    <main style={mainStyle}>
      {/* Ett klassiskt, idiotsäkert skript från 1998 som laddar om sidan var 30:e sekund */}
      <script dangerouslySetInnerHTML={{ __html: "setTimeout(function(){ window.location.reload(true); }, 30000);" }} />

      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.2rem', marginTop: '0.5rem', color: TID_FÄRG, textAlign: 'center', textTransform: 'uppercase' }}>
        NÄSTA AVGÅNG
      </h1>

      {data.map((stop, idx) => (
        <section key={idx} style={{ marginBottom: '1.5rem' }}> 
          <h2 style={stopNameStyle}>{stop.stop}</h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {stop.departures.length > 0 ? (
              stop.departures.map((d, i) => (
                <div key={i} style={departureRowStyle}>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={{ backgroundColor: d.type === 'TRAIN' ? '#0070f3' : '#e00000', color: 'white', padding: '0.15rem 0.4rem', borderRadius: '3px', fontFamily: '"VT323", monospace', fontSize: '1.1rem' }}>
                      {d.line}
                    </span>
                    <span style={{ fontSize: '1.25rem' }}>{d.destination}</span>
                  </div>
                  <span style={{ fontSize: '1.9rem', color: TID_FÄRG, letterSpacing: '-1px' }}>
                    {d.time}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ color: '#555', fontStyle: 'italic', fontSize: '1rem', textAlign: 'center', padding: '0.8rem 0' }}>INGA AVGÅNGAR</div>
            )}
          </div>
        </section>
      ))}
    </main>
  );
}
