import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from "@/firebase-server";
import { uploadFile } from '@/lib/uploadUtils';

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const groupId = formData.get('groupId') as string;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        const fileMetadata = await uploadFile(file, decodedToken.uid, groupId);

        return NextResponse.json({
            success: true,
            metadata: fileMetadata
        });
    } catch (error) {
        console.error('Upload error:', error);
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
