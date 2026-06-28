import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.tsx";

describe("App", () => {
  it("renders the 'Create party' heading", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Create party" }),
    ).toBeInTheDocument();
  });

  it("shows Natural Person fields by default and hides Legal Entity fields", () => {
    render(<App />);

    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByLabelText("Date of birth")).toBeInTheDocument();
    expect(screen.queryByLabelText("Registered name")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Company registration number")).not.toBeInTheDocument();
  });

  it("shows Legal Entity fields and hides Natural Person fields when Legal Entity is selected", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("radio", { name: "Legal Entity" }));

    expect(screen.getByLabelText("Registered name")).toBeInTheDocument();
    expect(screen.getByLabelText("Company registration number")).toBeInTheDocument();
    expect(screen.queryByLabelText("Full name")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Date of birth")).not.toBeInTheDocument();
  });
});
