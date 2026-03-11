import { NextResponse } from 'next/server';

export async function GET() {
  // .trim() tar bort eventuella dolda mellanslag från Vercel-inställningarna
  const API_KEY = process.env.TRAFIKLAB_KEY?.trim();

  // Kontrollera att nyckeln finns
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'API-nyckel (TRAFIKLAB_KEY) saknas i Vercels inställningar.' },
      { status: 500 }
    );
  }

  // Hållplats-ID:n (SiteId)
  const STOPS = [
    { id: '3503', name: 'Solhagavägen' },
    { id: '9524', name: 'Spånga station' }
  ];

  try {
    const results = await Promise.all(
      STOPS.map(async (stop) => {
        // Vi använder SL Realtid v4 som är den mest stabila för dessa ID-nummer
        const url = `https://api.sl.se/api2/realtidstidsinfov4.json?key=${API_KEY}&siteid=${stop.id}&timewindow=60`;
        
        const res = await fetch(url, { next: { revalidate: 0 } }); // Tvinga färsk data
        
        if (!res.ok) {
          throw new Error(`SL svarade med felkod: ${res.status}`);
        }

        const data = await res.json();

        // Om SL skickar ett tekniskt fel (t.ex. ogiltig nyckel)
        if (data.StatusCode !== 0) {
          throw new Error(data.Message || 'Fel hos SL:s API');
        }

        // Hämta alla fordonstyper och lägg i en lista
        const buses = data.ResponseData?.Buses || [];
        const trains = data.ResponseData?.Trains || [];
        
        // Här "tvättar" vi datan så att den är enkel för page.js att läsa
        const departures = [...buses, ...trains].map((item) => ({
          line: item.LineNumber,
          destination: item.Destination,
          time: item.DisplayTime,
          direction: item.JourneyDirection, // 1 brukar vara söderut/mot city
          type: item.TransportMode // BUS eller TRAIN
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
