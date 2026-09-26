import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "ایمیل الزامی است").email("ایمیل معتبر نیست"),
  password: z.string().min(1, "رمز عبور الزامی است"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "نام حداقل ۲ حرف باشد").max(100),
  email: z.string().min(1, "ایمیل الزامی است").email("ایمیل معتبر نیست"),
  password: z.string().min(8, "رمز عبور حداقل ۸ کاراکتر باشد").max(100),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
