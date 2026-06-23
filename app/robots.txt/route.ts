import { NextResponse } from 'next/server';

export function GET() {
  return new NextResponse('User-agent: *\nDisallow: /\n', {
    headers: { 'Content-Type': 'text/plain' },
  });
}
