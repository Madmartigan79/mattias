export const dynamic = 'force-dynamic';

const TAVLA_BAKGRUND = '#1a1a1a';
const TEXT_FÄRG = '#f0f0f0';
const TID_FÄRG = '#FF9F00';
const RAM_FÄRG = '#333';

const mainStyle = {
  maxWidth: '850px', 
  width: '95%',
  // Minskad marginal i toppen och botten för att spara höjd
  margin: '1rem auto', 
  fontFamily: '"VT323", monospace',
  // Mindre padding på höjden, bibehållen på bredden
  padding: '1rem 2rem', 
  color: TEXT_FÄRG, 
  border: `12px solid ${RAM_FÄRG}`, 
  borderRadius: '8px', 
  boxShadow: '0 0 30px rgba(255,160,0, 0.15)', 
  backgroundColor: TAVLA_BAKGRUND,
};

const stopNameStyle = {
  fontSize: '2rem', 
  textTransform: 'uppercase', 
  color: '#aaa', 
  // Krympt marginaler för att spara plats på höjden
  marginBottom: '0.4rem', 
  letterSpacing: '2px', 
  borderBottom: `3px solid ${RAM_FÄRG}`, 
  paddingBottom: '0.3rem', 
};

const departureRowStyle = {
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center',
  // Krympt padding för att packa raderna lite tätare
  padding: '0.5rem 0', 
  borderBottom: `2px solid ${RAM_FÄRG}`,
};

export default async function DepartureBoard() {
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

  return (
    <main style={mainStyle}>
      <script dangerouslySetInnerHTML={{ __html: "setTimeout(function(){ window.location.reload(true); }, 30000);" }} />

      <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: 'bold', 
        // Krympt marginal för att spara höjd
        marginBottom: '1rem', 
        marginTop: '0',
        color: TID_FÄRG, 
        textAlign: 'center', 
        textTransform: 'uppercase' 
      }}>
        NÄSTA AVGÅNG
      </h1>

      {data.map((stop, idx) => (
        // Krympt avstånd mellan hållplatserna
        <section key={idx} style={{ marginBottom: '1.2rem' }}> 
          <h2 style={stopNameStyle}>{stop.stop}</h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {stop.departures.length > 0 ? (
              stop.departures.map((d, i) => (
                <div key={i} style={departureRowStyle}>
                  {/* Här är ändringen för avståndet: gap är rejält ökat till 3.5rem */}
                  <div style={{ display: 'flex', gap: '3.5rem', alignItems: 'center' }}>
                    <span style={{ 
                      backgroundColor: d.type === 'TRAIN' ? '#0070f3' : '#e00000', 
                      color: 'white', 
                      padding: '0.2rem 0', // Ändrad padding
                      minWidth: '70px', // Fast bredd så alla destinationer hamnar i en rak kolumn
                      textAlign: 'center', // Centrerar texten i rutan
                      borderRadius: '6px', 
                      fontFamily: '"VT323", monospace', 
                      fontSize: '1.6rem' 
                    }}>
                      {d.line}
                    </span>
                    <span style={{ fontSize: '1.8rem' }}>{d.destination}</span>
                  </div>
                  <span style={{ 
                    fontSize: '3rem', 
                    color: TID_FÄRG, 
                    letterSpacing: '-2px' 
                  }}>
                    {d.time}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ color: '#555', fontStyle: 'italic', fontSize: '1.4rem', textAlign: 'center', padding: '0.5rem 0' }}>INGA AVGÅNGAR</div>
            )}
          </div>
        </section>
      ))}
    </main>
  );
}
