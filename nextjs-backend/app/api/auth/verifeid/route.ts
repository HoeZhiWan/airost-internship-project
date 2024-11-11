import { adminAuth, adminFirestore } from "@/firebase-server";
import { NextRequest, NextResponse } from "next/server";

const db = adminFirestore;

export async function POST(req: NextRequest, res:NextResponse) {
    const { idToken, email } = await req.json();

    try {
      // Verify the ID token
      const decodedToken = await adminAuth.verifyIdToken(idToken);

      let user = await adminAuth.getUser(decodedToken.id);
      
      if (user.emailVerified) {
        // Add user to Firestore
        await db.collection('users').doc(decodedToken.uid).set({
            verifiedAt: new Date(),
        });
    
        const response = JSON.stringify({ message: 'User added successfully' })
    
        return new NextResponse(response, {status:200});
      } else {
        const response = JSON.stringify({ message: 'User email has not been verified.' });

        return new NextResponse(response, {status:409});
      }
      
      
    } catch (error) {
      console.error('Error verifying ID token or adding user: ', error);

      const reserror = JSON.stringify({ error: 'Internal Server Error' })
      return NextResponse.json(reserror, {status:500});
    }
}

