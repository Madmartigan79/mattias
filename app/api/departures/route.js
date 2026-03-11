import { NextResponse } from 'next/server';

export async function GET() {
  // De korta ID-numren fungerar perfekt i det nya systemet
  const STOPS = [
    { id: '3503', name: 'Solhagavägen' },
    { id: '9524', name: 'Spånga station' }
  ];

  try {
    const results = await Promise.all(
      STOPS.map(async (stop) => {
        // HÄR ÄR MAGIN: Den nya öppna adressen som inte kräver någon API-nyckel!
        const url = `https://transport.integration.sl.se/v1/sites/${stop.id}/departures`;
        
        // cache: 'no-store' ser till att Vercel aldrig sparar gammal data
        const res = await fetch(url, { cache: 'no-store' }); 
        
        if (!res.ok) {
          throw new Error(`SL svarade med felkod: ${res.status}`);
        }

        const data = await res.json();

        // I det nya systemet ligger allt i en lista som heter "departures"
        const departures = (data.departures || []).map((item) => ({
          line: item.line?.designation || "???",
          destination: item.destination,
          time: item.display,
          direction: item.direction_code, 
          type: item.transport_mode 
        }));

        return {
          stop: stop.name,
          departures: departures
        };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Backend Error:', error.message);
    return NextResponse.json(
      { error: `Kunde inte hämta data: ${error.message}` },
      { status: 500 }
    );
  }
}
