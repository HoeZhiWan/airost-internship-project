import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from "@/firebase-server";
import { uploadProfilePicture } from '@/lib/uploadUtils';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);

        const formData = await request.formData();
        const file = formData.get('file') as File;

        const profilePictureUrl = await uploadProfilePicture(file, decodedToken.uid);

        return NextResponse.json({
            success: true,
            profilePictureUrl
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