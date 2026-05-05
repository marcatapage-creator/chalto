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

// ─── Situations de travaux ────────────────────────────────────────────────────

// POST /api/situations — soumission par le prestataire (via token)
export const createSituationSchema = z.object({
  contributorToken: token,
  projectId: uuid,
  lotLabel: z.string().min(1, "Le lot est obligatoire").max(100),
  percentage: z.number().int().min(0).max(100),
  amountHt: z.number().positive().optional(),
  comment: z.string().max(1000).optional(),
  parentSituationId: uuid.optional(),
})

// PATCH /api/situations/[id]/review — validation ou refus par l'architecte
export const reviewSituationSchema = z
  .object({
    action: z.enum(["validate", "refuse"]),
    reviewerComment: z.string().max(1000).optional(),
    refusalReason: z.string().min(1, "Le motif de refus est obligatoire").max(500).optional(),
  })
  .refine((data) => data.action !== "refuse" || !!data.refusalReason, {
    message: "Le motif est obligatoire en cas de refus",
    path: ["refusalReason"],
  })

// POST /api/contributors/[id]/renew — renouvellement du token par l'architecte
export const renewContributorSchema = z.object({
  contributorId: uuid,
  projectId: uuid,
})
