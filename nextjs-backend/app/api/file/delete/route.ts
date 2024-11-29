import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from "@/firebase-server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();
const db = adminFirestore;

export async function DELETE(request: NextRequest) {
    try {
        // Verify authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        await adminAuth.verifyIdToken(token);

        const { fileId, key } = await request.json();

        if (!fileId || !key) {
            return NextResponse.json(
                { error: "File ID and key are required" },
                { status: 400 }
            );
        }

        // Delete from UploadThing
        await utapi.deleteFiles(key);

        // Delete associated messages
        const messagesSnapshot = await db.collection('messages')
            .where('fileId', '==', fileId)
            .get();

        const messageDeletions = messagesSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(messageDeletions);

        // Delete file metadata from Firestore
        await db.collection('files').doc(fileId).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { error: "Delete failed" },
            { status: 500 }
        );
    }
}