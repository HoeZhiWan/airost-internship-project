import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const origin = request.headers.get('origin')

    const response = JSON.stringify({ message: 'Hello from Next.js!' });

    return new NextResponse(response, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": origin || "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
            "Access-Control-Max-Age": "86400",
        },
    })
  }