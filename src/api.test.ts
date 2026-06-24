import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { createParty } from "./generated";
import { server } from "./mocks/server.ts";

const validLegalEntity = {
  type: "Legal Entity",
  email: "ada@example.com",
  postcode: "SW1A 1AA",
  registeredName: "Acme Ltd",
  companyRegistrationNumber: "AB123456",
} as const;

describe("createParty", () => {
  it("resolves the created id for a valid payload", async () => {
    const { data } = await createParty({ body: validLegalEntity });

    expect(data.id).toMatch(/^party_/);
  });

  it("rejects with the field errors for an invalid payload", async () => {
    await expect(
      createParty({ body: { ...validLegalEntity, email: "not-an-email" } }),
    ).rejects.toMatchObject({
      errors: expect.arrayContaining([
        { field: "email", message: "email must be a valid email address." },
      ]),
    });
  });

  it("rejects with a field error when the email is already taken", async () => {
    await expect(
      createParty({
        body: { ...validLegalEntity, email: "taken@example.com" },
      }),
    ).rejects.toMatchObject({
      errors: expect.arrayContaining([
        {
          field: "email",
          message: "A party with this email already exists.",
        },
      ]),
    });
  });

  it("rejects when the server fails", async () => {
    server.use(
      http.post("*/parties", () =>
        HttpResponse.json({ message: "Server error" }, { status: 500 }),
      ),
    );

    await expect(createParty({ body: validLegalEntity })).rejects.toMatchObject(
      {
        message: "Server error",
      },
    );
  });
});
