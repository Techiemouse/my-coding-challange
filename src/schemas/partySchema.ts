import { z } from 'zod';

const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
const COMPANY_REG_RE = /^[A-Za-z0-9]{8}$/;

export const partySchema = z.object({
  type: z.enum(['Natural Person', 'Legal Entity']),
  email: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email must be at most 254 characters')
    .email('Must be a valid email address'),
  postcode: z
    .string()
    .min(1, 'Postcode is required')
    .max(8, 'Postcode must be at most 8 characters')
    .regex(UK_POSTCODE_RE, 'Must be a valid UK postcode'),
  fullName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  registeredName: z.string().optional(),
  companyRegistrationNumber: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'Natural Person') {
    if (!data.fullName) {
      ctx.addIssue({ code: 'custom', path: ['fullName'], message: 'Full name is required' });
    } else if (data.fullName.length > 140) {
      ctx.addIssue({ code: 'custom', path: ['fullName'], message: 'Full name must be at most 140 characters' });
    }
    if (!data.dateOfBirth) {
      ctx.addIssue({ code: 'custom', path: ['dateOfBirth'], message: 'Date of birth is required' });
    } else if (Date.parse(data.dateOfBirth) >= Date.now()) {
      ctx.addIssue({ code: 'custom', path: ['dateOfBirth'], message: 'Must be in the past' });
    }
  }

  if (data.type === 'Legal Entity') {
    if (!data.registeredName) {
      ctx.addIssue({ code: 'custom', path: ['registeredName'], message: 'Registered name is required' });
    } else if (data.registeredName.length > 160) {
      ctx.addIssue({ code: 'custom', path: ['registeredName'], message: 'Registered name must be at most 160 characters' });
    }
    if (!data.companyRegistrationNumber) {
      ctx.addIssue({ code: 'custom', path: ['companyRegistrationNumber'], message: 'Company registration number is required' });
    } else if (!COMPANY_REG_RE.test(data.companyRegistrationNumber)) {
      ctx.addIssue({ code: 'custom', path: ['companyRegistrationNumber'], message: 'Must be 8 alphanumeric characters' });
    }
  }
});

export type PartyFormValues = z.infer<typeof partySchema>;
