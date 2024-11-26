import { adminAuth, adminFirestore } from "@/firebase-server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
    try {
        // Get list of all users
        const listUsersResult = await adminAuth.listUsers();
        const users = listUsersResult.users;

        // Delete users in batches of 100
        const batchSize = 100;
        for (let i = 0; i < users.length; i += batchSize) {
            const batch = users.slice(i, i + batchSize);
            const uids = batch.map(user => user.uid);
            await adminAuth.deleteUsers(uids);
        }

        // Delete Firestore collections
        const collections = ['users', 'emailVerification', 'emailPasswordReset'];

        for (const collectionName of collections) {
            const snapshot = await adminFirestore.collection(collectionName).get();
            const batchDeletes = [];
            let batch = adminFirestore.batch();
            let operationCount = 0;

            // If this is the users collection, delete nested profile collections first
            if (collectionName === 'users') {
                for (const doc of snapshot.docs) {
                    const profileSnapshot = await adminFirestore
                        .collection('users')
                        .doc(doc.id)
                        .collection('profile')
                        .get();

                    profileSnapshot.docs.forEach((profileDoc) => {
                        batch.delete(profileDoc.ref);
                        operationCount++;

                        if (operationCount === 500) {
                            batchDeletes.push(batch.commit());
                            batch = adminFirestore.batch();
                            operationCount = 0;
                        }
                    });
                }
            }

            // Delete main collection documents
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
                operationCount++;

                if (operationCount === 500) {
                    batchDeletes.push(batch.commit());
                    batch = adminFirestore.batch();
                    operationCount = 0;
                }
            });

            if (operationCount > 0) {
                batchDeletes.push(batch.commit());
            }

            await Promise.all(batchDeletes);
        }

        return new NextResponse(
            JSON.stringify({
                message: `Successfully deleted ${users.length} users and related data`
            }),
            { status: 200 }
        );

    } catch (error) {
        console.error('Error deleting users and data:', error);
        return new NextResponse(
            JSON.stringify({
                error: 'Failed to delete users and data'
            }),
            { status: 500 }
        );
    }
}