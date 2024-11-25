import { z } from "zod";
import { parsePhoneNumberWithError } from 'libphonenumber-js';

export const registerSchema = z.object({
  email: z.string()
    .min(1, {
      message: 'Email address is required.'
    }),
  password: z.string().min(8, {
    message: 'Password must be a min length of 8.'
  }),
  confirmPassword: z.string().min(1, {
    message: 'Please re-enter password.'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match. Please try again.",
  path: ["confirmPassword"],
}).refine((data) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email), {
  message: "Invalid email address",
  path: ["email"],
});

export const loginSchema = z.object({
  email: z.string()
    .min(1, {
      message: 'Email address is required.'
    }),
  password: z.string().min(1, {
    message: 'Password is required.'
  })
}).refine((data) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email), {
  message: "Invalid email address",
  path: ["email"],
});

export const resetEmailSchema = z.object({
  email: z.string()
    .min(1, {
      message: 'Email address is required.'
    })
}).refine((data) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email), {
  message: "Invalid email address",
  path: ["email"],
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, {
    message: 'Password must be a min length of 8.'
  }),
  confirmPassword: z.string().min(1, {
    message: 'Please re-enter password.'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match. Please try again.",
  path: ["confirmPassword"],
});

export const setupProfileSchema = z.object({
    fname: z.string().min(1, {
        message: 'First name is required.'
    }),
    lname: z.string().min(1, {
        message: 'Last name is required.'
    }),
    phoneNo: z.string()
        .min(1, { message: 'Phone number is required.' }),
    areaCode: z.string()
        .min(1, { message: 'Area code is required.' })
}).refine((data) => {
    try {
        // Combine area code and phone number for validation
        const fullNumber = `${data.areaCode}${data.phoneNo}`;
        const phoneNumber = parsePhoneNumberWithError(fullNumber);
        return phoneNumber.isValid();
    } catch {
        return false;
    }
}, {
    message: "Invalid phone number for this country code",
    path: ["phoneNo"]
});