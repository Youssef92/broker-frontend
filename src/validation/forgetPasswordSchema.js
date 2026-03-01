import { z } from "zod";

export const forgetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .regex(
      /^[A-Za-z][A-Za-z0-9._%+-]*@gmail\.com$/,
      "Email must be a valid Gmail address",
    ),
});
