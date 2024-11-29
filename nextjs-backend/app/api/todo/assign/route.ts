
import { adminAuth, adminFirestore } from "@/firebase-server";
import { NextRequest, NextResponse } from "next/server";

const db = adminFirestore;

export async function POST(req: NextRequest) {
    try {
        const { todoId, assignedTo } = await req.json();
        const authHeader = req.headers.get('authorization');
        
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        await adminAuth.verifyIdToken(token);

        await db.collection('todos').doc(todoId).update({
            assignedTo: assignedTo
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error assigning todo:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}