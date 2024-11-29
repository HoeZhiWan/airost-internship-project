import { adminAuth, adminFirestore } from "@/firebase-server";
import { NextRequest, NextResponse } from "next/server";

const db = adminFirestore;

// Get members of a group
export async function GET(req: NextRequest) {
    try {
        const groupId = req.nextUrl.searchParams.get('groupId');
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        await adminAuth.verifyIdToken(token);

        if (!groupId) {
            return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
        }
        const groupDoc = await db.collection('groups').doc(groupId).get();
        if (!groupDoc.exists) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        const memberIds = groupDoc.data()?.members || [];
        const memberPromises = memberIds.map(async (uid: string) => {
            const userRecord = await adminAuth.getUser(uid);
            return {
                uid: userRecord.uid,
                email: userRecord.email,
                isAdmin: groupDoc.data()?.admins?.includes(uid) || false
            };
        });

        const members = await Promise.all(memberPromises);
        return NextResponse.json({ success: true, members }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Add member to group
export async function POST(req: NextRequest) {
    try {
        const { groupId, email } = await req.json();
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        await adminAuth.verifyIdToken(token);

        const userRecord = await adminAuth.getUserByEmail(email);
        const groupRef = db.collection('groups').doc(groupId);
        const groupDoc = await groupRef.get();

        if (!groupDoc.exists) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        if (groupDoc.data()?.members?.includes(userRecord.uid)) {
            return NextResponse.json({ error: 'User already in group' }, { status: 400 });
        }

        await groupRef.update({
            members: [...(groupDoc.data()?.members || []), userRecord.uid]
        });

        return NextResponse.json({ 
            success: true, 
            message: 'Member added successfully' 
        }, { status: 200 });
    } catch (error) {
        if ((error as any).code === 'auth/user-not-found') {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}