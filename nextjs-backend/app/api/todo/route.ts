import { adminAuth, adminFirestore } from "@/firebase-server";
import { NextRequest, NextResponse } from "next/server";

const db = adminFirestore;

export async function GET(req: NextRequest) {
    try {
        const groupId = req.nextUrl.searchParams.get('groupId');
        const authHeader = req.headers.get('authorization');
        
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        await adminAuth.verifyIdToken(token);

        const todosSnapshot = await db.collection('todos')
            .where('groupId', '==', groupId)
            .orderBy('timestamp', 'desc')
            .get();

        const todos = todosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ success: true, todos }, { status: 200 });
    } catch (error) {
        console.error('Error fetching todos:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { todoId, newStatus } = await req.json();
        const authHeader = req.headers.get('authorization');
        
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        await adminAuth.verifyIdToken(token);

        await db.collection('todos').doc(todoId).update({
            status: newStatus
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error updating todo:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}