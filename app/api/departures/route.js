import { NextResponse } from 'next/server';

export async function GET() {
  const STOPS = [
    { 
      name: 'Solhagavägen', 
      url: 'https://transport.integration.sl.se/v1/sites/3717/departures?transport=BUS&line=117&forecast=60' 
    },
    { 
      name: 'Spånga station', 
      url: 'https://transport.integration.sl.se/v1/sites/9704/departures?transport=TRAIN&direction=1&forecast=60' 
    },
    { 
      name: 'Svandammen', 
      // Rätt ID (3722) och vi ber direkt om buss 179
      url: 'https://transport.integration.sl.se/v1/sites/3722/departures?transport=BUS&line=179&forecast=60' 
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

        // Filtrering för rätt riktning
        if (stop.name === 'Solhagavägen') {
          departures = departures.filter(d => d.destination.toLowerCase().includes('brommaplan'));
        }
        if (stop.name === 'Svandammen') {
          // Filtrerar fram bussar där destinationen innehåller "vällingby"
          departures = departures.filter(d => d.destination.toLowerCase().includes('vällingby'));
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
