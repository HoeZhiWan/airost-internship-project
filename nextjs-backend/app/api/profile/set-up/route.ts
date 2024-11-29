import { adminAuth, adminFirestore } from "@/firebase-server";
import { NextRequest, NextResponse } from "next/server";

const db = adminFirestore;

export async function POST(req: NextRequest, res:NextResponse) {
    const { idToken, fname, lname, areaCode, phoneNo} = await req.json();

    try {
      // Verify the ID token 
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      const uid = decodedToken.uid;

      // Create a batch write
      const batch = db.batch();

      // Update the user document
      const userRef = db.collection('users').doc(uid);
      batch.update(userRef, {
        profileSetup: true
      });

      // Create profile subcollection document
      const profileRef = db.collection('users').doc(uid).collection('profile').doc('info');
      batch.set(profileRef, {
        firstName: fname,
        lastName: lname,
        phoneNumber: phoneNo,
        areaCode: areaCode,
        profilePictureUrl: null,
        createdAt: new Date()
      });

      // Commit the batch
      await batch.commit();

      return new NextResponse(
        JSON.stringify({ message: 'Profile created successfully' }), 
        {status: 200}
      );

    } catch (error) {
      console.error('Error creating profile: ', error);
      return new NextResponse(
        JSON.stringify({ error: 'Internal Server Error' }),
        {status: 500}
      );
    }
}

