import { adminAuth, adminFirestore } from "@/firebase-server";
import { NextRequest, NextResponse } from "next/server";

const db = adminFirestore;

export async function GET(req: NextRequest) {
    const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    
    if (!idToken) {
        return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    try {
        // Verify the ID token
        const decodedToken = await adminAuth.verifyIdToken(idToken);

        // Get user document from Firestore
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.data();

        const response = JSON.stringify({
            emailVerified: userData?.emailVerified || false,
            hasProfile: userData?.profileSetup || false,
            uid: decodedToken.uid
        });

        return new NextResponse(response, { status: 200 });

    } catch (error) {
        console.error('Error checking user status:', error);
        return NextResponse.json(
            { error: 'Failed to verify user status' }, 
            { status: 500 }
        );
    }
}