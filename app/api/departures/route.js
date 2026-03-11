import { NextResponse } from 'next/server';

export async function GET() {
  const API_KEY = process.env.TRAFIKLAB_KEY;
  
  // Vi testar att hämta för båda typerna av ID samtidigt för säkerhets skull
  const STOPS = [
    { id: '9524', name: 'Spånga station' },
    { id: '3503', name: 'Solhagavägen' }
  ];

  try {
    const results = await Promise.all(STOPS.map(async (stop) => {
      // Vi provar den officiella v4-realtiden
      const res = await fetch(`https://api.sl.se/api2/realtidstidsinfov4.json?key=${API_KEY}&siteid=${stop.id}&timewindow=60`);
      const data = await res.json();
      
      let departures = [];
      
      if (data.ResponseData) {
        const buses = data.ResponseData.Buses || [];
        const trains = data.ResponseData.Trains || [];
        
        departures = [...buses, ...trains].map(d => ({
          line: d.LineNumber,
          destination: d.Destination,
          time: d.DisplayTime
        }));
      }

      return { stop: stop.name, departures };
    }));

    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
