import { adminAuth, adminFirestore } from '@/firebase-server';
import { NextRequest, NextResponse } from 'next/server';
import { generateOOBCode, sendVerificationEmail } from '@/lib/actions';

const db = adminFirestore;

export async function POST(req: NextRequest, res:NextResponse) {
    const { idToken, email } = await req.json();

    if (!email || !idToken ) {
      return new NextResponse(JSON.stringify({error: "Missing email/idToken"}), {status:400});
    }

    try {
      const query = await db.collection('emailVerification').where('email', '==', email).get();

      const decodedToken = await adminAuth.verifyIdToken(idToken);
      
      if (!query.empty) { 
        query.forEach(async (document) => { 
          await db.collection('emailVerification').doc(document.id).delete(); 
        });
      };
      
      const oobCode = await generateOOBCode(email, decodedToken.uid);
      console.log(oobCode);
      await sendVerificationEmail(email, oobCode);
      
      return new NextResponse(JSON.stringify({message: `Verification email sent to ${email} successfully`}), {status:200});
    } catch (error) {
      console.error('Error sending verification email: ', error);
      return new NextResponse(JSON.stringify({error: "Error sending verification email"}), {status:500});
    }
}