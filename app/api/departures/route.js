import { NextResponse } from 'next/server';

export async function GET() {
  const STOPS = [
    { 
      name: 'Solhagavägen', 
      // Rätt ID (3717) och vi ber direkt om buss 117
      url: 'https://transport.integration.sl.se/v1/sites/3717/departures?transport=BUS&line=117&forecast=60' 
    },
    { 
      name: 'Spånga station', 
      // Rätt ID (9704) och vi ber direkt om Tåg (TRAIN) söderut (direction=1)
      url: 'https://transport.integration.sl.se/v1/sites/9704/departures?transport=TRAIN&direction=1&forecast=60' 
    }
  ];

  try {
    const results = await Promise.all(
      STOPS.map(async (stop) => {
        const res = await fetch(stop.url, { cache: 'no-store' }); 
        if (!res.ok) throw new Error(`Status ${res.status}`);

        const data = await res.json();
        
        let departures = (data.departures || []).map((item) => ({
          line: String(item.line?.designation || item.line?.id || "???"),
          destination: item.destination || "Okänd",
          time: item.display || "Nu",
          type: item.line?.transport_mode || (stop.name === 'Spånga station' ? 'TRAIN' : 'BUS')
        }));

        // För Solhagavägen: Säkerställ att bussen faktiskt går mot Brommaplan
        if (stop.name === 'Solhagavägen') {
          departures = departures.filter(d => d.destination.toLowerCase().includes('brommaplan'));
        }

        // Returnera hållplatsen och endast de 3 första avgångarna
        return { stop: stop.name, departures: departures.slice(0, 3) };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: "Kunde inte hämta data från SL" }, { status: 500 });
  }
}
