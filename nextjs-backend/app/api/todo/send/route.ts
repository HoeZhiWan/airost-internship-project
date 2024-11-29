import { adminAuth, adminFirestore } from "@/firebase-server";
import { NextRequest, NextResponse } from "next/server";

const db = adminFirestore;

export async function POST(req: NextRequest) {
    try {
        const { text, groupId } = await req.json();
        const authHeader = req.headers.get('authorization');
        
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);

        const todo = {
            text,
            groupId,
            userId: decodedToken.uid,
            status: "pending",
            timestamp: new Date().toISOString()
        };

        await db.collection('todos').add(todo);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error sending todo:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
