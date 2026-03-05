import { z } from "zod";

export const paymentSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .regex(/^[A-Za-z]+$/, "First name must contain letters only"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .regex(/^[A-Za-z]+$/, "Last name must contain letters only"),
  email: z
    .string()
    .trim()
    .regex(
      /^[A-Za-z][A-Za-z0-9._%+-]*@gmail\.com$/,
      "Email must be a valid Gmail address"
    ),
  phoneNumber: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9]+$/, "Phone number must contain numbers only"),
  country: z
    .string()
    .trim()
    .min(2, "Country must be at least 2 characters")
    .regex(/^[A-Za-z]+$/, "Country must contain letters only"),
  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters")
    .regex(/^[A-Za-z]+$/, "City must contain letters only"),
  street: z.string().trim().min(1, "Street is required"),
  zipCode: z
    .string()
    .trim()
    .regex(/^[0-9]{7}$/, "Zip code must be exactly 7 digits"),
});