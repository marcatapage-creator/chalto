import { z } from "zod"

const uuid = z.uuid()
const token = z.string().min(1)
const nonEmpty = z.string().min(1)

// Routes authentifiées (pro)
export const sendValidationSchema = z.object({
  documentId: uuid,
  message: z.string().optional(),
  requestType: z.enum(["validation", "transmission"]).optional(),
})

export const sendInviteSchema = z.object({
  contactId: uuid,
  projectId: uuid,
})

export const notifyTaskSchema = z.object({
  taskId: uuid,
})

export const sendDocumentContributorSchema = z.object({
  contributorIds: z.array(uuid).min(1),
  documentName: nonEmpty,
  projectId: uuid,
  message: z.string().optional(),
  requestType: z.enum(["transmission", "validation"]).optional(),
})

export const sendWelcomeSchema = z.object({
  fullName: z.string().optional(),
})

// Routes publiques (client / prestataire via token)
export const validateSchema = z.object({
  token,
  status: z.enum(["approved", "rejected", "commented"]),
  comment: z.string().nullish(),
})

export const validateContributorSchema = z.object({
  documentId: uuid,
  status: z.enum(["approved", "rejected", "commented"]),
  comment: z.string().nullish(),
  contributorName: nonEmpty,
  contributorId: uuid.optional(),
  requestType: z.enum(["transmission", "validation"]).optional(),
})

export const taskStatusSchema = z.object({
  taskId: uuid,
  status: z.enum(["todo", "in_progress", "done"]),
  contributorToken: token,
})

export const taskCommentSchema = z.object({
  taskId: uuid,
  authorName: nonEmpty,
  content: nonEmpty,
  contributorToken: token,
})

export const taskSuggestSchema = z.object({
  projectId: uuid,
  title: nonEmpty,
  description: z.string().nullish(),
  contributorToken: token,
  contributorName: nonEmpty,
})

export const projectMessageSchema = z.object({
  projectId: uuid,
  authorName: nonEmpty,
  content: nonEmpty,
  contributorToken: token,
})

export const waitlistSchema = z.object({
  email: z.email(),
  name: z.string().optional(),
  profession: z.string().optional(),
})
