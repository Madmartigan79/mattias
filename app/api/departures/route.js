import { NextResponse } from 'next/server';

export async function GET() {
  // .trim() tar bort osynliga mellanslag/radbrytningar
  const API_KEY = process.env.TRAFIKLAB_KEY?.trim(); 

  if (!API_KEY) {
    return NextResponse.json({ error: 'API-nyckel saknas' }, { status: 500 });
  }

  export async function GET() {
  const API_KEY = process.env.TRAFIKLAB_KEY;

  // 1. Kolla om nyckeln ens finns
  if (!API_KEY) {
    return NextResponse.json({ error: 'API-nyckel (TRAFIKLAB_KEY) saknas i Vercel' }, { status: 500 });
  }

  const STOPS = [
    { id: '9524', name: 'Spånga station' },
    { id: '3503', name: 'Solhagavägen' }
  ];

  try {
    const results = await Promise.all(STOPS.map(async (stop) => {
      const url = `https://api.sl.se/api2/realtidstidsinfov4.json?key=${API_KEY}&siteid=${stop.id}&timewindow=60`;
      
      const res = await fetch(url);
      
      // 2. Kolla om SL svarar med fel (t.ex. 401 Unauthorized)
      if (!res.ok) {
        throw new Error(`SL svarade med status: ${res.status}`);
      }

      const data = await res.json();

      // 3. Kolla om SL skickade ett felmeddelande i själva JSON-datan
      if (data.StatusCode !== 0) {
        throw new Error(`SL API Error: ${data.Message || 'Okänt fel'}`);
      }

      const departures = [
        ...(data.ResponseData.Buses || []),
        ...(data.ResponseData.Trains || [])
      ].map(d => ({
        line: d.LineNumber,
        destination: d.Destination,
        time: d.DisplayTime
      }));

      return { stop: stop.name, departures };
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Backend error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
