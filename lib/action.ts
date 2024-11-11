import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./../firebase-client";
import { z } from "zod";

const formSchema = z.object({
    name: z.string().min(1, {
        message: 'Name is required.',
    }),
    email: z.string()
    .min(1, {
        message:'Email address is required.'
    }),
    password: z.string().min(6, {
        message: 'Password must be a min length of 6.'
    }
    ),
    confirmation: z.string().min(1, {
        message: 'Please re-enter password.'
    })
}).refine((data) => data.password === data.confirmation, {
    message: "Passwords don't match. Please try again.",
    path: ["confirmation"], // path of error
}).refine((data) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email), {
    message: "Invalid email address",
    path: ["email"], // path of error
});


const errorMessages = { 
    'auth/invalid-credential': 'Invalid credential provided. Please try again.', 
    'auth/user-not-found': 'No user found with this email. Please check your email or sign up.', 
    'auth/wrong-password': 'Incorrect password. Please try again.', 
    'auth/email-already-in-use': 'Email already exists, please log in or verify.'
};

export type State = {
    errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        confirmation?: string[];
    };
    message?: string | null;
    values?: {
        name? : string;
        email?: string;
    }
}

// used in /RegisterPage/RegisterPage.jsx
export const registerUser = async (event) => {
    event.preventDefault()

    const formData = new FormData(event.target);

    const validatedFields = formSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
        name: formData.get("name"),
        confirmation: formData.get("confirm-password")
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to sign up.",
            values: {
                name: formData.get("name")?.toString(),
                email: formData.get("email")?.toString()
            }
        }
    }

    const { name, email, password} = validatedFields.data;

    try { 
      const userCredential = await createUserWithEmailAndPassword(auth, email, password); 
      console.log('User has been signed up')
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
        
      } catch (error) { 
        console.error('Error registering user: ', error);
      }
};

// used in /LoginPage/LoginPage.jsx
const loginUser = async (event) => {
    event.preventDefault()
  
    const formData = new FormData(event.target);
    const email = formData.get('email'); 
    const password = formData.get('password')
  
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
          throw new Error('Issue connecting with API'); 
        }
  
        const data = await response.json();
        console.log('User log ined and data sent to API', data);
        
      } catch (error) { 
        console.error('Error logging in user: ', error);
      }
};