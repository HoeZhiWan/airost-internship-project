import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./../firebase-client";
import { z } from "zod";

const registerSchema = z.object({
    email: z.string()
    .min(1, {
        message:'Email address is required.'
    }),
    password: z.string().min(8, {
        message: 'Password must be a min length of 8.'
    }
    ),
    confirmPassword: z.string().min(1, {
        message: 'Please re-enter password.'
    })
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match. Please try again.",
    path: ["confirmPassword"], // path of error
}).refine((data) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email), {
    message: "Invalid email address",
    path: ["email"], // path of error
});

const loginSchema = z.object({
  email: z.string()
  .min(1, {
      message:'Email address is required.'
  }),
  password: z.string().min(1, {
      message: 'Password is required.'
  })
}).refine((data) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email), {
  message: "Invalid email address",
  path: ["email"], // path of error
});;

const errorMessages = { 
    'auth/invalid-credential': 'Invalid credential provided. Please try again.', 
    'auth/user-not-found': 'No user found with this email. Please check your email or sign up.', 
    'auth/wrong-password': 'Incorrect password. Please try again.', 
    'auth/email-already-in-use': 'Email already exists, please log in or verify.'
};

// used in /RegisterPage/RegisterPage.jsx
export const registerUser = async (email: string, password: string, confirmPassword: string) => {
    const validatedFields = registerSchema.safeParse({
        email,
        password,
        confirmPassword
    })

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing/Invalid Fields. Failed to sign up.",
        }
    }

    try { 
      const userCredential = await createUserWithEmailAndPassword(auth, email, password); 
      console.log('User has been signed up');

      const idToken = await userCredential.user.getIdToken(); 
      const response = await fetch('http://localhost:3000/api/auth/register', 
        { method: 'POST', 
          headers: { 'Content-Type': 'application/json', }, 
          body: JSON.stringify({ idToken, email }), 
        }); 
        
        if(!response.ok) {
          throw new Error('Issue connecting with API'); 
        }
  
        const data = await response.json();
        console.log('User registered and data sent to API', data);

        try {
          emailVerification(userCredential);
        } catch(error) {
          throw new Error('Failed to send verifcation email. Please try logging in.');
        }

        return {success: true, data};
        
      } catch (error) { 
        // Extract error code 
        const errorCode = error['code']; 
        // Get user-friendly error message 
        const errorMessage = errorMessages[errorCode as keyof typeof errorMessages] || 'An unknown error occurred. Please try again.'; 
        // Display the error message 
        console.error("Issue sigining in with Email", error);

        console.error('Error registering user: ', error);
        return {success: false, message: errorMessage};
      }
};

// used in /LoginPage/LoginPage.jsx
export const loginUser = async (email:string, password:string) => {
  const validatedFields = loginSchema.safeParse({
    email,
    password
  })

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing/Invalid Fields. Failed to sign up.",
    }
  }
  
  try { 
    const userCredential = await signInWithEmailAndPassword(auth, email, password); 
    console.log('User has been signed in')
    const idToken = await userCredential.user.getIdToken(); 
  
    const response = await fetch('http://localhost:3000/api/auth/login', 
      { method: 'POST', 
        headers: { 'Content-Type': 'application/json', }, 
        body: JSON.stringify({ idToken }), 
      }); 
        
    if(!response.ok) {
        console.log(response);
        throw new Error('Issue connecting with API'); 
    }
  
    const data = await response.json();
    console.log('User log ined and data sent to API', data);

    return {success: true, data};
        
    } catch (error) { 
      // Extract error code 
      const errorCode = error['code']; 
      // Get user-friendly error message 
      const errorMessage = errorMessages[errorCode as keyof typeof errorMessages] || 'An unknown error occurred. Please try again.'; 
      // Display the error message 
      console.error("Issue logging with Email", error);

      console.error('Error logging in user: ', error);
      return {success: false, message: errorMessage};
    }
};

export const emailVerification = async (userCredential) => {
  try {
    let user = userCredential.user;
    const idToken = await user.getIdToken(); 
    const email = await user.email;

    const response = await fetch('http://localhost:3000/api/auth/verify/confirmation', 
      { method: 'POST', 
          headers: { 'Content-Type': 'application/json', }, 
          body: JSON.stringify({ idToken, email }), 
      }); 

    if (!response.ok) {
      console.log(response);
      throw new Error('Issue connecting with API');
    }

    const data = await response.json();
    console.log("Succeeded in sending email verification", data);
  } catch (error) {
    console.error('Error sending verfication email', error);
  }
}

// test