import { NextRequest, NextResponse } from 'next/server';

const SHOWMYTRADES_BASE = 'https://showmytrades.com/api/statistics';

/**
 * Proxy to ShowMyTrades API to avoid CORS when the dashboard calls from the browser.
 * GET /api/showmytrades?slug=mt5-11526060
 */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug || !/^mt[45]-.+$/.test(slug)) {
    return NextResponse.json({ error: 'Missing or invalid slug (e.g. mt5-11526060)' }, { status: 400 });
  }
  try {
    const res = await fetch(`${SHOWMYTRADES_BASE}/${slug}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data || { error: `ShowMyTrades ${res.status}` }, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error('ShowMyTrades proxy error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Proxy request failed' },
      { status: 502 }
    );
  }
}
