
import { adminAuth, adminFirestore } from "@/firebase-server";
import { NextRequest, NextResponse } from "next/server";

const db = adminFirestore;

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
    try {
        const {userId} = await params;
        const authHeader = req.headers.get('authorization');
        
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        await adminAuth.verifyIdToken(token);

        const userDoc = await db.collection('users').doc(userId).collection('profile').doc('info').get();
        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const profile = userDoc.data();
        return NextResponse.json({ success: true, profile }, { status: 200 });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}