import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(80),
  role: z.enum(["super_admin", "college_admin", "faculty", "student", "startup"]).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(100)
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100)
});

export const profileSchema = z.object({
  headline: z.string().max(120).optional(),
  bio: z.string().max(1000).optional(),
  skills: z.array(z.string().min(1).max(50)).max(40).optional(),
  githubHandle: z.string().max(60).optional(),
  portfolioLinks: z.array(z.string().url()).max(10).optional(),
  availability: z.string().max(40).optional()
});

export const projectSchema = z.object({
  title: z.string().min(3).max(160),
  summary: z.string().min(10).max(2000),
  type: z.enum(["project", "startup", "research", "internship", "hackathon"]).optional(),
  stage: z.enum(["idea", "proposal", "team_forming", "sprint", "demo_day", "completed", "rated"]).optional(),
  requiredSkills: z.array(z.string().min(1).max(50)).max(30).optional(),
  budget: z.number().min(0).max(100000000).optional(),
  timeline: z.string().max(200).optional()
});

export const chatSchema = z.object({
  roomId: z.string().min(1),
  text: z.string().min(1).max(2000),
  attachments: z.array(z.string().url()).max(5).optional()
});

export const ratingSchema = z.object({
  subjectId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  category: z.string().min(2).max(40)
});

export const tenantUpdateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  logoUrl: z.string().url().optional(),
  brandColor: z.string().max(32).optional(),
  status: z.enum(["active", "paused", "trial", "suspended"]).optional(),
  subscriptionPlan: z.enum(["free", "pro", "enterprise"]).optional(),
  contactEmail: z.string().email().optional()
});
