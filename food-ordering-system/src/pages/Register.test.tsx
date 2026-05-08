import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Register from "./Register";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    register: vi.fn().mockResolvedValue(true),
    loading: false,
    error: "",
  }),
}));

describe("Register", () => {
  it("shows an error when passwords do not match", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText(/First name/i), "Juan");
    await user.type(screen.getByPlaceholderText(/Last name/i), "Dela Cruz");
    await user.type(
      screen.getByPlaceholderText(/Enter your email address/i),
      "juan@example.com",
    );
    await user.type(
      screen.getByPlaceholderText(/Enter your phone number/i),
      "09171234567",
    );
    await user.type(screen.getByPlaceholderText(/Create a password/i), "Passw0rd1");
    await user.type(
      screen.getByPlaceholderText(/Re-enter your password/i),
      "Passw0rd2",
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /Create Account/i }));

    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
  });
});

