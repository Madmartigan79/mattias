import { NextResponse } from 'next/server';

export async function GET() {
  const STOPS = [
    { 
      name: 'Solhagavägen', 
      // Vi tar bort de hårda URL-filtren för bussen för att få in all data först
      url: 'https://transport.integration.sl.se/v1/sites/3503/departures?forecast=60'
    },
    { 
      name: 'Spånga station', 
      // Pendeltåget fungerar perfekt, så det låter vi vara kvar!
      url: 'https://transport.integration.sl.se/v1/sites/9524/departures?transport=TRAIN&direction=1&forecast=60'
    }
  ];

  try {
    const results = await Promise.all(
      STOPS.map(async (stop) => {
        const res = await fetch(stop.url, { cache: 'no-store' }); 
        if (!res.ok) throw new Error(`Felkod från SL: ${res.status}`);

        const data = await res.json();

        let departures = (data.departures || []).map((item) => ({
          line: item.line?.designation || item.line?.id || "???",
          destination: item.destination,
          time: item.display,
          type: stop.name === 'Spånga station' ? 'TRAIN' : 'BUS'
        }));

        // Filtrering för Solhagavägen i koden istället
        if (stop.name === 'Solhagavägen') {
          // Vi plockar in ALLA bussar som heter 117. 
          // (Vissa kommer gå åt andra hållet, men nu ser vi vad destinationen faktiskt heter!)
          departures = departures.filter(d => d.line === '117');
        }

        return { stop: stop.name, departures: departures };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: "Kunde inte hämta data" }, { status: 500 });
  }
}
