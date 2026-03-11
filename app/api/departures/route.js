import { NextResponse } from 'next/server';

export async function GET() {
  const STOPS = [
    { name: 'Solhagavägen', url: 'https://transport.integration.sl.se/v1/sites/3503/departures' },
    { name: 'Spånga station', url: 'https://transport.integration.sl.se/v1/sites/9524/departures' }
  ];

  try {
    const results = await Promise.all(
      STOPS.map(async (stop) => {
        try {
          const res = await fetch(stop.url, { cache: 'no-store' }); 
          if (!res.ok) throw new Error(`Status ${res.status}`);

          const data = await res.json();
          
          let departures = (data.departures || []).map((item) => ({
            line: item.line?.designation || "??",
            destination: item.destination || "Okänd",
            time: item.display || "Nu",
            // Aha! transport_mode och direction_code ligger här:
            type: item.line?.transport_mode || "BUS",
            direction: item.direction_code
          }));

          // HÄR ÄR ÄNDRINGEN: Jag har raderat ALLA filter! 
          // Vi skickar tillbaka exakt allt SL ger oss.
          
          return { stop: stop.name, departures };
          
        } catch (innerError) {
          return { 
            stop: stop.name, 
            departures: [{ destination: `Kunde inte hämta: ${innerError.message}`, time: '!', line: '!', type: 'BUS' }] 
          };
        }
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: "Backend krasch" }, { status: 500 });
  }
}
