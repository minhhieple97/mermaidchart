/**
 * Centralized validation schemas
 * Single source of truth for all form validations
 */

import { z } from 'zod';

// ============================================================================
// Constants
// ============================================================================

export const VALIDATION_LIMITS = {
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  NAME_MIN: 1,
  NAME_MAX: 255,
  CODE_MAX: 100000,
  ERROR_MESSAGE_MAX: 1000,
} as const;

// ============================================================================
// Common Schemas
// ============================================================================

/** UUID validation */
export const uuidSchema = z.string().uuid('Invalid ID format');

/** Email validation with normalization */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email is too long')
  .transform((email) => email.toLowerCase().trim());

/** Strong password validation */
export const passwordSchema = z
  .string()
  .min(
    VALIDATION_LIMITS.PASSWORD_MIN,
    `Password must be at least ${VALIDATION_LIMITS.PASSWORD_MIN} characters`,
  )
  .max(
    VALIDATION_LIMITS.PASSWORD_MAX,
    `Password must be less than ${VALIDATION_LIMITS.PASSWORD_MAX} characters`,
  )
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/** Simple password for login (less strict) */
export const loginPasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .max(VALIDATION_LIMITS.PASSWORD_MAX, 'Password is too long');

/** Name validation (projects, diagrams) */
export const nameSchema = z
  .string()
  .min(VALIDATION_LIMITS.NAME_MIN, 'Name is required')
  .max(
    VALIDATION_LIMITS.NAME_MAX,
    `Name must be less than ${VALIDATION_LIMITS.NAME_MAX} characters`,
  )
  .transform((name) => name.trim())
  .refine((name) => name.length > 0, 'Name cannot be empty after trimming');

// ============================================================================
// Auth Schemas
// ============================================================================

/** Login form schema */
export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

/** Signup form schema with strong password */
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/** Auth schema for server actions (accepts both login/signup) */
export const authSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Password is required')
    .max(VALIDATION_LIMITS.PASSWORD_MAX, 'Password is too long'),
});

// ============================================================================
// Project Schemas
// ============================================================================

/** Create project schema */
export const createProjectSchema = z.object({
  name: nameSchema,
});

/** Update project schema */
export const updateProjectSchema = z.object({
  id: uuidSchema,
  name: nameSchema,
});

/** Delete project schema */
export const deleteProjectSchema = z.object({
  id: uuidSchema,
});

// ============================================================================
// Diagram Schemas
// ============================================================================

/** Create diagram schema */
export const createDiagramSchema = z.object({
  projectId: uuidSchema,
  name: nameSchema,
});

/** Update diagram schema */
export const updateDiagramSchema = z.object({
  id: uuidSchema,
  name: nameSchema.optional(),
  code: z
    .string()
    .max(
      VALIDATION_LIMITS.CODE_MAX,
      `Code must be less than ${VALIDATION_LIMITS.CODE_MAX} characters`,
    )
    .optional(),
});

/** Delete diagram schema */
export const deleteDiagramSchema = z.object({
  id: uuidSchema,
});

/** Toggle visibility schema */
export const toggleVisibilitySchema = z.object({
  diagramId: uuidSchema,
  isPublic: z.boolean(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;
export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;
export type CreateDiagramFormValues = z.infer<typeof createDiagramSchema>;
export type UpdateDiagramFormValues = z.infer<typeof updateDiagramSchema>;
