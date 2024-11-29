import { UTApi } from "uploadthing/server";
import { adminFirestore } from "@/firebase-server";
import { Timestamp } from 'firebase-admin/firestore';

const utapi = new UTApi();
const db = adminFirestore;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface FileUploadResult {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedBy: string;
    groupId: string | null;
    uploadedAt: Timestamp;
    fileUrl: string;
    key: string;
}

export async function uploadFile(file: File, userId: string, groupId?: string): Promise<FileUploadResult> {
    if (!file) {
        throw new Error("No file provided");
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size must be less than 5MB");
    }

    const uploadResponse = await utapi.uploadFiles(file);
    const fileData = Array.isArray(uploadResponse) ? uploadResponse[0] : uploadResponse;

    const fileMetadata = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedBy: userId,
        groupId: groupId || null,
        uploadedAt: Timestamp.now(),
        fileUrl: fileData.data.url,
        key: fileData.data.key
    };

    const fileDoc = await db.collection('files').add(fileMetadata);

    return {
        id: fileDoc.id,
        ...fileMetadata
    };
}

export async function uploadProfilePicture(file: File, userId: string): Promise<string> {
    if (!file) {
        throw new Error("No file provided");
    }

    if (!file.type.startsWith('image/')) {
        throw new Error("File must be an image");
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size must be less than 5MB");
    }

    const profileRef = db.collection('users')
        .doc(userId)
        .collection('profile')
        .doc('info');

    // Get the old profile picture URL
    const profile = await profileRef.get();
    const oldPictureUrl = profile.data()?.profilePictureUrl;

    // Delete old picture if it exists
    if (oldPictureUrl) {
        try {
            const fileKey = oldPictureUrl.split('/').pop()?.split('_')[0];
            if (fileKey) {
                await utapi.deleteFiles(fileKey);
            }
        } catch (error) {
            console.error('Error deleting old profile picture:', error);
        }
    }

    // Create new file with renamed filename
    const fileExtension = file.name.split('.').pop();
    const newFileName = `pfp_${userId}.${fileExtension}`;
    const renamedFile = new File([file], newFileName, { type: file.type });

    const uploadResponse = await utapi.uploadFiles(renamedFile);
    const fileData = Array.isArray(uploadResponse) ? uploadResponse[0] : uploadResponse;

    await profileRef.update({
        profilePictureUrl: fileData.data.url
    });

    return fileData.data.url;
}