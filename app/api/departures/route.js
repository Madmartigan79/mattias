import { NextResponse } from 'next/server';

export async function GET() {
  const STOPS = [
    { name: 'Solhagavägen', url: 'https://transport.integration.sl.se/v1/sites/3503/departures?forecast=60' },
    { name: 'Spånga station', url: 'https://transport.integration.sl.se/v1/sites/9524/departures?forecast=60' }
  ];

  try {
    const results = await Promise.all(
      STOPS.map(async (stop) => {
        try {
          const res = await fetch(stop.url, { cache: 'no-store' }); 
          
          // Om SL ger oss ett fel (t.ex. 429 för "Too Many Requests")
          // gör vi om felet till en låtsas-avgång så vi ser det på skärmen!
          if (!res.ok) {
            return { 
              stop: stop.name, 
              departures: [{ destination: `Tekniskt fel från SL: Status ${res.status}`, time: 'FEL', line: '!', type: 'BUS' }] 
            };
          }

          const data = await res.json();
          
          let departures = (data.departures || []).map((item) => ({
            // Vi tvingar linjenumret att bli en textsträng så vi aldrig missar "117"
            line: String(item.line?.designation || item.line?.id || "???"),
            destination: item.destination || "Okänd",
            time: item.display || "",
            direction: item.direction_code,
            type: item.transport_mode 
          }));

          // Mjuka filter som inte är lika aggressiva:
          if (stop.name === 'Solhagavägen') {
            // Om 117 finns någonstans i linjenamnet, behåll den.
            departures = departures.filter(d => d.line.includes('117'));
          } else if (stop.name === 'Spånga station') {
            // Vi plockar in pendeltåg åt BÅDA hållen just nu för att garantera data.
            departures = departures.filter(d => d.type === 'TRAIN');
          }

          return { stop: stop.name, departures };
          
        } catch (innerError) {
          // Om hela nätverksanropet kraschar
          return { 
            stop: stop.name, 
            departures: [{ destination: `Krasch: ${innerError.message}`, time: 'FEL', line: '!', type: 'BUS' }] 
          };
        }
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: "Totalkrasch i backend" }, { status: 500 });
  }
}
