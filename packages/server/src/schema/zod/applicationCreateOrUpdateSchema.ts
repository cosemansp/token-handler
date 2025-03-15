/**
 * Generated by @kubb/plugin-zod - Do not edit by hand
 * @see https://github.com/kubb-labs/kubb/tree/main/packages/plugin-zod
 */

import { applicationConfigSchema } from './applicationConfigSchema.ts'
import { z } from 'zod'

export const applicationCreateOrUpdateSchema = z.object({
  displayName: z.string().describe('Name of the application to display in the UI'),
  roles: z.array(z.string()).describe('The roles that are available for this application'),
  description: z.string().describe('Description of the application').optional(),
  slug: z.string().describe('Shortcut to be used in role assignment `tsz:admin`'),
  config: z.array(z.lazy(() => applicationConfigSchema)).describe('The configuration of the application, used by the TokenHandler'),
})

export type ApplicationCreateOrUpdateSchema = z.infer<typeof applicationCreateOrUpdateSchema>