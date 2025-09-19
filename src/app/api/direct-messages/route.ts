import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward request to backend
    const response = await fetch('http://localhost:8080/api/direct-messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward any authorization headers from the original request
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Backend API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Direct messages API error:', error);
    return NextResponse.json(
      { error: 'Failed to send direct message' },
      { status: 500 }
    );
  }
}