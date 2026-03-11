import { NextResponse } from 'next/server';

const API_KEY = process.env.TRAFIKLAB_KEY; // Din nyckel från "Trafiklab Realtime APIs"
const BASE_URL = 'https://realtime-api.trafiklab.se/v1';

const STOPS = [
  { id: '740000011', name: 'Spånga station' }, // Pendeltåg
  { id: '740043328', name: 'Solhagavägen' }    // Buss 117
];

export async function GET() {
  try {
    const results = await Promise.all(STOPS.map(async (stop) => {
      const res = await fetch(`${BASE_URL}/departures/${stop.id}?key=${API_KEY}`);
      const data = await res.json();
      return { stopName: stop.name, stopId: stop.id, departures: data.departures || [] };
    }));

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Kunde inte hämta data' }, { status: 500 });
  }
}
