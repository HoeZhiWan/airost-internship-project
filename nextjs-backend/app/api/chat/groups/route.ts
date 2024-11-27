import { adminAuth, adminFirestore } from "@/firebase-server";
import { NextRequest, NextResponse } from "next/server";

const db = adminFirestore;

// Get groups for a user
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);

        // Get all groups where user is a member
        const groupsSnapshot = await db.collection('groups')
            .where('members', 'array-contains', decodedToken.uid)
            .get();

        const groups = groupsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ 
            success: true, 
            groups 
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching groups:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Create a new group
export async function POST(req: NextRequest) {
    try {
        const { name } = await req.json();
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);

        // Create new group
        const groupRef = await db.collection('groups').add({
            name,
            createdBy: decodedToken.uid,
            createdAt: new Date(),
            members: [decodedToken.uid],
            admins: [decodedToken.uid]
        });

        return NextResponse.json({ 
            success: true,
            groupId: groupRef.id,
            message: 'Group created successfully'
        }, { status: 200 });
    } catch (error) {
        console.error('Error creating group:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
