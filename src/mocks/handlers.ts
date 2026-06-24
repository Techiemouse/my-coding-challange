// Mock backend, served by Mock Service Worker (see ../mocks/browser.ts).
//
// One endpoint:
//   POST /parties          — the documented create endpoint
//
// The per-type rules (which fields are required/forbidden for a "Natural Person"
// vs a "Legal Entity") are enforced here only, with zod — the OpenAPI spec and
// the generated PartyCreate type don't express them. Reading the 400 errors is
// how you discover them.

import { http, HttpResponse, delay } from "msw";
import { z } from "zod";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const COMPANY_REG_RE = /^[A-Za-z0-9]{8}$/;

function isPresent(value: unknown): boolean {
  return value !== undefined && value !== null && value !== "";
}

// Always-required fields are validated declaratively. The polymorphic, per-type
// rules live in the refinement so a field is only checked within its own type's
// branch (a forbidden-but-malformed field yields one error, not two).
const partySchema = z
  .object({
    type: z.enum(["Natural Person", "Legal Entity"], {
      error: 'type must be "Natural Person" or "Legal Entity".',
    }),
    email: z
      .string({ error: "email is required." })
      .max(254, { error: "email must be at most 254 characters." })
      .regex(EMAIL_RE, { error: "email must be a valid email address." }),
    postcode: z
      .string({ error: "postcode is required." })
      .max(8, { error: "postcode must be at most 8 characters." })
      .regex(UK_POSTCODE_RE, {
        error: "postcode must be a valid UK postcode.",
      }),
    fullName: z.string().optional(),
    dateOfBirth: z.string().optional(),
    registeredName: z.string().optional(),
    companyRegistrationNumber: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const add = (field: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [field], message });

    if (data.type === "Natural Person") {
      if (!isPresent(data.fullName)) {
        add("fullName", "fullName is required.");
      } else if (data.fullName!.length > 140) {
        add("fullName", "fullName must be at most 140 characters.");
      }

      if (!isPresent(data.dateOfBirth)) {
        add("dateOfBirth", "dateOfBirth is required.");
      } else {
        const dob = data.dateOfBirth!;
        if (!ISO_DATE_RE.test(dob)) {
          add("dateOfBirth", "dateOfBirth must be an ISO date (YYYY-MM-DD).");
        } else if (Number.isNaN(Date.parse(dob))) {
          add("dateOfBirth", "dateOfBirth must be a real date.");
        } else if (Date.parse(dob) >= Date.now()) {
          add("dateOfBirth", "dateOfBirth must be in the past.");
        }
      }

      if (isPresent(data.registeredName)) {
        add(
          "registeredName",
          "registeredName must not be set for a Natural Person.",
        );
      }
      if (isPresent(data.companyRegistrationNumber)) {
        add(
          "companyRegistrationNumber",
          "companyRegistrationNumber must not be set for a Natural Person.",
        );
      }
    } else if (data.type === "Legal Entity") {
      if (!isPresent(data.registeredName)) {
        add("registeredName", "registeredName is required.");
      } else if (data.registeredName!.length > 160) {
        add("registeredName", "registeredName must be at most 160 characters.");
      }

      if (!isPresent(data.companyRegistrationNumber)) {
        add(
          "companyRegistrationNumber",
          "companyRegistrationNumber is required.",
        );
      } else if (!COMPANY_REG_RE.test(data.companyRegistrationNumber!)) {
        add(
          "companyRegistrationNumber",
          "companyRegistrationNumber must be 8 alphanumeric characters.",
        );
      }

      if (isPresent(data.fullName)) {
        add("fullName", "fullName must not be set for a Legal Entity.");
      }
      if (isPresent(data.dateOfBirth)) {
        add("dateOfBirth", "dateOfBirth must not be set for a Legal Entity.");
      }
    }
  });

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// Emails already registered with the backend. Uniqueness is a server-only rule
// the client can't know up front, so a duplicate surfaces as a 409 on submit —
// the create cannot succeed however valid the form is. Submit a party with
// "taken@example.com" to exercise this path.
const TAKEN_EMAILS = new Set(["taken@example.com"]);

export function createHandlers(networkDelay = 0) {
  return [
    http.post("*/parties", async ({ request }) => {
      await delay(networkDelay);

      let body: unknown = {};
      try {
        body = await request.json();
      } catch {
        body = {};
      }

      const result = partySchema.safeParse(body);
      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: String(issue.path[0] ?? ""),
          message: issue.message,
        }));
        return HttpResponse.json({ errors }, { status: 400 });
      }

      if (TAKEN_EMAILS.has(result.data.email.toLowerCase())) {
        return HttpResponse.json(
          {
            errors: [
              {
                field: "email",
                message: "A party with this email already exists.",
              },
            ],
          },
          { status: 409 },
        );
      }

      return HttpResponse.json({ id: `party_${randomId()}` }, { status: 201 });
    }),
  ];
}
