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
  it("renders register form", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: /Create Account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/First name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Last name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your phone number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Create a password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Re-enter your password/i)).toBeInTheDocument();
  });

  it("validates terms must be agreed", async () => {
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
      "Passw0rd1",
    );
    // Don't check the agree checkbox
    await user.click(screen.getByRole("button", { name: /Create Account/i }));

    expect(screen.getByText(/agree to the Terms/i)).toBeInTheDocument();
  });

  it("validates first name is required and minimum length", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText(/First name/i), "J");
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
      "Passw0rd1",
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /Create Account/i }));

    expect(screen.getByText(/First name must be between 2 and 50 characters/i)).toBeInTheDocument();
  });

  it("validates email format", async () => {
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
      "notanemail",
    );
    await user.type(
      screen.getByPlaceholderText(/Enter your phone number/i),
      "09171234567",
    );
    await user.type(screen.getByPlaceholderText(/Create a password/i), "Passw0rd1");
    await user.type(
      screen.getByPlaceholderText(/Re-enter your password/i),
      "Passw0rd1",
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /Create Account/i }));

    expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
  });

  it("validates phone number length", async () => {
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
      "0917123",
    );
    await user.type(screen.getByPlaceholderText(/Create a password/i), "Passw0rd1");
    await user.type(
      screen.getByPlaceholderText(/Re-enter your password/i),
      "Passw0rd1",
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /Create Account/i }));

    expect(screen.getByText(/phone number must be between 10 and 11 digits/i)).toBeInTheDocument();
  });

  it("validates password strength (requires letter and number)", async () => {
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
    await user.type(screen.getByPlaceholderText(/Create a password/i), "password");
    await user.type(
      screen.getByPlaceholderText(/Re-enter your password/i),
      "password",
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /Create Account/i }));

    expect(screen.getByText(/Password must contain at least one number/i)).toBeInTheDocument();
  });

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

  it("accepts valid registration form", async () => {
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
      "Passw0rd1",
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /Create Account/i }));

    // Should not show error
    expect(screen.queryByText(/required|invalid|must be|do not match/i)).not.toBeInTheDocument();
  });

  it("has link to login page", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    const loginLink = screen.getByRole("button", { name: /Sign in here/i });
    expect(loginLink).toBeInTheDocument();
  });
});

