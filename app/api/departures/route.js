import { NextResponse } from 'next/server';

export async function GET() {
  const API_KEY = process.env.TRAFIKLAB_KEY;
  
  // Vi använder de klassiska Site-ID:n som fungerar bäst med SL:s standard-API
  const STOPS = [
    { id: '9524', name: 'Spånga station' },
    { id: '3503', name: 'Solhagavägen' }
  ];

  try {
    const results = await Promise.all(STOPS.map(async (stop) => {
      // Vi lägger till forecast=60 för att se en timme framåt
      const url = `https://api.sl.se/api2/realtidstidsinfov4.json?key=${API_KEY}&siteid=${stop.id}&timewindow=60`;
      
      const res = await fetch(url);
      const data = await res.json();

      // Här mappar vi om datan så att den passar din frontend
      // Vi kombinerar bussar och tåg i en och samma lista
      const allDepartures = [
        ...(data.ResponseData.Buses || []),
        ...(data.ResponseData.Trains || [])
      ].map(d => ({
        line: { designation: d.LineNumber },
        destination: d.Destination,
        display: d.DisplayTime,
        transport_mode: d.TransportMode,
        direction: d.JourneyDirection
      }));

      return { 
        stopName: stop.name, 
        stopId: stop.id, 
        departures: allDepartures 
      };
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Kunde inte hämta data från SL' }, { status: 500 });
  }
}
