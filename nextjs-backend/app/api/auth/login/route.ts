import { adminAuth, adminFirestore } from "@/firebase-server";
import { NextRequest, NextResponse } from "next/server";

const db = adminFirestore;

export async function POST(req: NextRequest, res:NextResponse) {
    const { idToken } = await req.json();

    try {
      // Verify the ID token
      const decodedToken = await adminAuth.verifyIdToken(idToken);

      // Get user document from Firestore
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      const userData = userDoc.data();

      // Update last login
      await db.collection('users').doc(decodedToken.uid).update({
        lastLogin: new Date(),
      });

      const response = JSON.stringify({ message: 'User data updated successfully'});

      return new NextResponse(response, {status:200});
    } catch (error) {
      console.error('Error verifying ID token or adding user: ', error);

      const reserror = JSON.stringify({ error: 'Internal Server Error' })
      return NextResponse.json(reserror, {status:500});
    }
}

