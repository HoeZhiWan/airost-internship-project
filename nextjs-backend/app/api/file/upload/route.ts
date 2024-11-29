import { NextRequest, NextResponse } from 'next/server';
import { UTApi } from "uploadthing/server";
import { adminAuth, adminFirestore } from "@/firebase-server";

const utapi = new UTApi();
const db = adminFirestore;

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

        // Check file size (5MB limit)
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File size must be less than 5MB" },
                { status: 400 }
            );
        }

        console.log(file);

        // Upload to UploadThing
        const uploadResponse = await utapi.uploadFiles(file);

        console.log(file);
        
        // UploadThing returns an array, we take the first result
        const fileData = Array.isArray(uploadResponse) ? uploadResponse[0] : uploadResponse;

        // Store metadata in Firestore
        const fileMetadata = {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            uploadedBy: decodedToken.uid,
            groupId: groupId || null,
            uploadedAt: new Date().toISOString(),
            fileUrl: fileData.data.url,
            key: fileData.data.key
        };

        const fileDoc = await db.collection('files').add(fileMetadata);

        return NextResponse.json({
            success: true,
            file: uploadResponse,
            metadata: {
                id: fileDoc.id,
                ...fileMetadata
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: "Upload failed" },
            { status: 500 }
        );
    }
}
