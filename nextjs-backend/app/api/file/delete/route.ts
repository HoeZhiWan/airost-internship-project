
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from "@/firebase-server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function DELETE(request: NextRequest) {
    try {
        // Verify authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);

        // Get file ID and key from request body
        const { fileId, key } = await request.json();

        // Get file document
        const fileDoc = await adminFirestore.collection('files').doc(fileId).get();
        
        if (!fileDoc.exists) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Verify ownership
        const fileData = fileDoc.data();
        if (fileData?.uploadedBy !== decodedToken.uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Delete from UploadThing
        await utapi.deleteFiles(key);

        // Delete from Firestore
        await adminFirestore.collection('files').doc(fileId).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { error: "Delete failed" },
            { status: 500 }
        );
    }
}