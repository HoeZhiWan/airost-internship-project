import { adminAuth, adminFirestore } from "@/firebase-server";
import { Timestamp } from "firebase-admin/firestore";
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

        // Get user info
        const userDoc = await db.collection('users')
            .doc(decodedToken.uid)
            .collection('profile')
            .doc('info')
            .get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        const userData = userDoc.data();
        const userName = userData?.firstName && userData?.lastName 
            ? `${userData.firstName} ${userData.lastName}`
            : 'Anonymous';

        // Verify user is member of group
        const groupDoc = await db.collection('groups').doc(groupId).get();
        if (!groupDoc.exists || !groupDoc.data()?.members?.includes(decodedToken.uid)) {
            return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
        }

        // Message validation
        if (!text?.trim()) {
            return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
        }

        // Store message in Firestore
        const messageData = {
            text,
            userId: decodedToken.uid,
            userName,
            groupId,
            timestamp: Timestamp.now()
        };

        const messageRef = await db.collection('messages').add(messageData);
        
        return NextResponse.json({ 
            success: true,
            message: 'Message sent successfully',
            timestamp: Timestamp.now(),
            messageId: messageRef.id
        }, { status: 200 });
    } catch (error) {
        console.error('Error processing message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
