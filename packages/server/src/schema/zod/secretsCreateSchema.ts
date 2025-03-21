/**
 * Generated by @kubb/plugin-zod - Do not edit by hand
 * @see https://github.com/kubb-labs/kubb/tree/main/packages/plugin-zod
 */

import { badRequestErrorSchema } from './badRequestErrorSchema.ts'
import { clientSecretCreateSchema } from './clientSecretCreateSchema.ts'
import { clientSecretSchema } from './clientSecretSchema.ts'
import { errorSchema } from './errorSchema.ts'
import { notAuthorizedErrorSchema } from './notAuthorizedErrorSchema.ts'
import { z } from 'zod'

export const secretsCreatePathParamsSchema = z.object({
  id: z.string(),
})

export type SecretsCreatePathParamsSchema = z.infer<typeof secretsCreatePathParamsSchema>

/**
 * @description The request has succeeded.
 */
export const secretsCreate200Schema = z.lazy(() => clientSecretSchema)

export type SecretsCreate200Schema = z.infer<typeof secretsCreate200Schema>

/**
 * @description The server could not understand the request due to invalid syntax.
 */
export const secretsCreate400Schema = z.lazy(() => badRequestErrorSchema)

export type SecretsCreate400Schema = z.infer<typeof secretsCreate400Schema>

/**
 * @description Access is unauthorized.
 */
export const secretsCreate401Schema = z.lazy(() => notAuthorizedErrorSchema)

export type SecretsCreate401Schema = z.infer<typeof secretsCreate401Schema>

/**
 * @description Server error
 */
export const secretsCreate500Schema = z.lazy(() => errorSchema)

export type SecretsCreate500Schema = z.infer<typeof secretsCreate500Schema>

export const secretsCreateMutationRequestSchema = z.lazy(() => clientSecretCreateSchema)

export type SecretsCreateMutationRequestSchema = z.infer<typeof secretsCreateMutationRequestSchema>

export const secretsCreateMutationResponseSchema = z.lazy(() => secretsCreate200Schema)

export type SecretsCreateMutationResponseSchema = z.infer<typeof secretsCreateMutationResponseSchema>