import { adminAuth, adminFirestore } from "@/firebase-server";
import { NextRequest, NextResponse } from "next/server";

const db = adminFirestore;

export async function GET(req: NextRequest) {
    const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];

    if (!idToken) {
        return new NextResponse(
            JSON.stringify({ error: 'No token provided' }),
            { status: 401 }
        );
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const profileRef = db.collection('users').doc(uid).collection('profile').doc('info');
        const profileDoc = await profileRef.get();

        if (!profileDoc.exists) {
            return new NextResponse(
                JSON.stringify({ error: 'Profile not found' }),
                { status: 404 }
            );
        }

        return new NextResponse(
            JSON.stringify({ profile: profileDoc.data() }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching profile: ', error);
        return new NextResponse(
            JSON.stringify({ error: 'Internal Server Error' }),
            { status: 500 }
        );
    }
}
