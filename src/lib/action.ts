import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../firebase-client";
import { registerSchema, loginSchema, resetEmailSchema, resetPasswordSchema, setupProfileSchema } from "./schema";

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
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ idToken, email }),
      });

    if (!response.ok) {
      throw new Error('Issue connecting with API');
    }

    const data = await response.json();
    console.log('User registered and data sent to API', data);

    try {
      emailVerification(userCredential);
    } catch (error) {
      throw new Error('Failed to send verifcation email. Please try logging in.');
    }

    return { success: true, data };

  } catch (error) {
    // Extract error code 
    const errorCode = error['code'];
    // Get user-friendly error message 
    const errorMessage = errorMessages[errorCode as keyof typeof errorMessages] || 'An unknown error occurred. Please try again.';
    // Display the error message 
    console.error("Issue sigining in with Email", error);

    console.error('Error registering user: ', error);
    return { success: false, message: errorMessage };
  }
};

// used in /LoginPage/LoginPage.jsx
export const loginUser = async (email: string, password: string) => {
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
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ idToken }),
      });

    if (!response.ok) {
      console.log(response);
      throw new Error('Issue connecting with API');
    }

    const data = await response.json();
    console.log('User log ined and data sent to API', data);

    return { success: true, message: data.message, idToken};

  } catch (error) {
    // Extract error code 
    const errorCode = error['code'];
    // Get user-friendly error message 
    const errorMessage = errorMessages[errorCode as keyof typeof errorMessages] || 'An unknown error occurred. Please try again.';
    // Display the error message 
    console.error("Issue logging with Email", error);

    console.error('Error logging in user: ', error);
    return { success: false, message: errorMessage };
  }
};

export const emailVerification = async (userCredential) => {
  try {
    let user = userCredential.user;
    const idToken = await user.getIdToken();
    const email = await user.email;

    const response = await fetch('http://localhost:3000/api/auth/verify/confirmation',
      {
        method: 'POST',
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

export const userSignOut = async () => {
  try {
    await signOut(auth); 
  } catch (error) {
    console.error('Error signing out:', error);
  };
}

export const sendResetPasswordEmail = async (email: string) => {
  const validatedFields = resetEmailSchema.safeParse({
    email
  })

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    const response = await fetch('http://localhost:3000/api/auth/reset/send-reset-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const result = await response.json();
    if (response.ok) {
      return { success: true, message: result.message };
    } else {
      return { success: false, message: result.error };
    }
  } catch (error) {
    return { success: false, message: 'An error occurred while sending the email' };
  }
};

export const userResetPassword = async (resetCode: string, password: string, confirmPassword: string) => {
  const validatedFields = resetPasswordSchema.safeParse({
    password,
    confirmPassword,
  })

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const newPassword = password;

  try {
    const response = await fetch('http://localhost:3000/api/auth/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ resetCode, newPassword })
    });

    const result = await response.json();
    if (response.ok) {
      return { success: true, message: result.message };
    } else {
      return { success: false, message: result.error };
    }
  } catch (error) {
    return { success: false, message: 'An error occurred while resetting your password' };
  }
};

export const checkUserStatus = async (idToken: string) => {
  try {
    const response = await fetch('http://localhost:3000/api/profile/user-status', {
      method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
    });
    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      throw new Error(result.error || 'Failed to check user status');
    }
  } catch (error) {
    return { success: false, message: 'An error occurred while checking user status', error }; 
  }
}

export const setupProfile = async (userCredential, fname: string, lname: string, areaCode: string, phoneNo: string) => {
  const validatedFields = setupProfileSchema.safeParse({
    fname,
    lname,
    areaCode,
    phoneNo,
  })

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  if (!userCredential || !userCredential.user) {
    return {
      success: false,
      errors: { auth: ['User not authenticated'] }
    }
  }

  try {
    const user = userCredential.user;
    const idToken = await user.getIdToken();

    const response = await fetch('http://localhost:3000/api/profile/set-up', {
      method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken, lname, fname, areaCode, phoneNo })
    });

    const result = await response.json();

    if (response.ok) {
      return { success: true, message: result.message };
    } else {
      throw new Error(result.error || 'Failed to check user status');
    }
  } catch (error) {
    return { success: false, message: 'An error occurred while checking user status', error }; 
  }
}

export const getProfileInfo = async (idToken: string) => {
  try {
    const response = await fetch('http://localhost:3000/api/profile/info', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
    });
    const result = await response.json();

    if (response.ok) {
      return { success: true, profile: result.profile };
    } else {
      return { success: false, message: result.error };
    }
  } catch (error) {
    return { success: false, message: 'An error occurred while fetching profile info' };
  }
};
