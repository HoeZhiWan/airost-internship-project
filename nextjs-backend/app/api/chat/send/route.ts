import { adminAuth, adminFirestore } from "@/firebase-server";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from '@/lib/uploadUtils';

const db = adminFirestore;

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
        
        const contentType = req.headers.get('content-type') || '';
        
        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const file = formData.get('file') as File;
            const groupId = formData.get('groupId') as string;

            fileMetadata = await uploadFile(file, decodedToken.uid, groupId);

            messageData = {
                userId: decodedToken.uid,
                groupId,
                fileId: fileMetadata.id,
                fileName: fileMetadata.fileName,
                fileUrl: fileMetadata.fileUrl,
                fileType: fileMetadata.fileType,
                timestamp: Timestamp.now()
            };
        } else if (contentType.includes('application/json')) {
            const { text, groupId, fileMetadata: existingFileMetadata } = await req.json();
            
            if (existingFileMetadata) {
                messageData = {
                    userId: decodedToken.uid,
                    groupId,
                    fileId: existingFileMetadata.id,
                    fileName: existingFileMetadata.fileName,
                    fileUrl: existingFileMetadata.fileUrl,
                    fileType: existingFileMetadata.fileType,
                    timestamp: Timestamp.now()
                };
                fileMetadata = existingFileMetadata;
            } else {
                messageData = {
                    text,
                    userId: decodedToken.uid,
                    groupId,
                    timestamp: Timestamp.now()
                };
            }
        } else {
            return NextResponse.json(
                { error: 'Invalid content type' }, 
                { status: 400 }
            );
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
            userName 
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
