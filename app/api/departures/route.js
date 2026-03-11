import { NextResponse } from 'next/server';

export async function GET() {
  // Vi lägger in kraven direkt i länkarna till SL!
  const STOPS = [
    { 
      name: 'Solhagavägen', 
      url: 'https://transport.integration.sl.se/v1/sites/3503/departures?transport=BUS&line=117&forecast=60'
    },
    { 
      name: 'Spånga station', 
      url: 'https://transport.integration.sl.se/v1/sites/9524/departures?transport=TRAIN&direction=1&forecast=60'
    }
  ];

  try {
    const results = await Promise.all(
      STOPS.map(async (stop) => {
        const res = await fetch(stop.url, { cache: 'no-store' }); 
        if (!res.ok) throw new Error(`Felkod från SL: ${res.status}`);

        const data = await res.json();

        // 1. Plocka ut och formatera de viktiga fälten
        let departures = (data.departures || []).map((item) => ({
          line: item.line?.designation || item.line?.id || "???",
          destination: item.destination,
          time: item.display,
          // Tvingar fram rätt färgkodning för frontend
          type: stop.name === 'Spånga station' ? 'TRAIN' : 'BUS' 
        }));

        // 2. Extra filtrering för att bara visa 117 mot just Brommaplan
        if (stop.name === 'Solhagavägen') {
          departures = departures.filter(d => d.destination.includes('Brommaplan'));
        }

        return { stop: stop.name, departures: departures };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: "Kunde inte hämta data" }, { status: 500 });
  }
}
