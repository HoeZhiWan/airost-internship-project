import { adminAuth, adminFirestore } from "@/firebase-server";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const db = adminFirestore;
const utapi = new UTApi();

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);

        let messageData: any;
        let fileMetadata: any;
        
        if (req.headers.get('content-type')?.includes('multipart/form-data')) {
            const formData = await req.formData();
            const file = formData.get('file') as File;
            const groupId = formData.get('groupId') as string;

            const uploadResponse = await utapi.uploadFiles(file);
            const fileData = Array.isArray(uploadResponse) ? uploadResponse[0] : uploadResponse;

            // Create file metadata
            fileMetadata = {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                uploadedBy: decodedToken.uid,
                uploadedAt: Timestamp.now(),
                fileUrl: fileData.data.url,
                key: fileData.data.key,
                groupId
            };

            // Store in files collection
            const fileDoc = await db.collection('files').add(fileMetadata);

            messageData = {
                userId: decodedToken.uid,
                groupId,
                fileId: fileDoc.id,  // Reference to the file document
                ...fileMetadata,  // Include file info in message for easy access
                timestamp: Timestamp.now()
            };
        } else {
            const { text, groupId } = await req.json();
            messageData = {
                text,
                userId: decodedToken.uid,
                groupId,
                timestamp: Timestamp.now()
            };
        }

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
        const groupDoc = await db.collection('groups').doc(messageData.groupId).get();
        if (!groupDoc.exists || !groupDoc.data()?.members?.includes(decodedToken.uid)) {
            return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
        }

        // Message validation
        if (!messageData.text?.trim() && !messageData.fileUrl) {
            return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
        }

        // Store message in Firestore
        const messageRef = await db.collection('messages').add({
            ...messageData,
            userName // Add the userName to the message data
        });
        
        return NextResponse.json({ 
            success: true,
            message: 'Message sent successfully',
            messageId: messageRef.id,
            fileId: fileMetadata?.fileId
        });
    } catch (error) {
        console.error('Error processing message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
