import { adminFirestore } from '@/firebase-server';
import { NextRequest, NextResponse } from 'next/server';
import { generateResetCode, sendVerificationEmail } from '@/lib/actions';
import { sendPasswordResetEmail } from '@/lib/actions';

const db = adminFirestore;

export async function POST(req: NextRequest, res:NextResponse) {
    const { email } = await req.json();

    if (!email ) {
      return new NextResponse(JSON.stringify({error: "Missing email"}), {status:400});
    }

    try {
      const query = await db.collection('resetEmail').where('email', '==', email).get();
      
      if (!query.empty) { 
        query.forEach(async (document) => { 
          await db.collection('emailPasswordReset').doc(document.id).delete(); 
        });
      };
      
      const resetCode = await generateResetCode(email);
      console.log(resetCode);
      await sendPasswordResetEmail(email, resetCode);
      
      return new NextResponse(JSON.stringify({message: `Password reset email sent to ${email} successfully`}), {status:200});
    } catch (error) {
      console.error('Error sending password reset email: ', error);
      return new NextResponse(JSON.stringify({error: "Error sending password reset email"}), {status:500});
    }
}