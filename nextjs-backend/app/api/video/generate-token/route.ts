import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/firebase-server";
import { StreamChat } from 'stream-chat';

const apiKey = process.env.STREAMIO_API_KEY!;
const apiSecret = process.env.STREAMIO_SECRET!;

if (!apiKey || !apiSecret) {
    throw new Error('Stream API key and secret must be defined');
}

const serverClient = StreamChat.getInstance(apiKey, apiSecret);

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        // Generate Stream token - only pass userId
        const streamToken = serverClient.createToken(userId);
        
        return NextResponse.json({ 
            token: streamToken,
            userId: userId 
        }, { status: 200 });
    } catch (error) {
        console.error('Error generating token:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}