import { adminAuth, adminFirestore } from "@/firebase-server";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

const db = adminFirestore;

export async function POST(req: NextRequest, res:NextResponse) {
    const { resetCode, newPassword } = await req.json();

    if (!resetCode || !newPassword) {
      return new NextResponse(JSON.stringify({error: "Missing resetCode/Password"}), {status:400});
    }

    try {
      const doc = await db.collection('emailPasswordReset').doc(resetCode).get();
      if (!doc.exists) {
          return new NextResponse(JSON.stringify({error: "Invalid/Expired Code"}), {status:400});
      } 

      const data = doc.data();
      if (!data) {
        return new NextResponse(JSON.stringify({error: "Invalid/Expired Code"}), {status:400});
      }
      const { email, createdAt, expiryDuration } = data;

      const user = await adminAuth.getUserByEmail(email); 
      if (!user) { 
        return new NextResponse(JSON.stringify({error: "User Not Found"}), {status:404});
      };
      
      const currentTime = Timestamp.now().toMillis();
      const expiryTime = createdAt.toMillis() + expiryDuration;
      
      if (currentTime > expiryTime) {
        await db.collection('emailPasswordReset').doc(resetCode).delete();
        return new NextResponse(JSON.stringify({error: "Code has expired"}), {status:400});
      }

      await adminAuth.updateUser(user.uid, { password: newPassword });
      console.log("Updated user password of", user.uid);
      await db.collection('emailPasswordReset').doc(resetCode).delete(); 

      return new NextResponse(JSON.stringify({message: `Email ${email}'s password successfully reset`}), {status:200});
    } catch (error) {
      console.error('Error resetting email password: ', error);
      return new NextResponse(JSON.stringify({error: "Error resetting email's password"}), {status:500});
    }
}
      
  
