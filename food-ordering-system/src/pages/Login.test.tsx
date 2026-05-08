import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Login from "./Login";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue(false),
    loading: false,
    error: "",
  }),
}));

vi.mock("../context/AdminContext", () => ({
  useAdmin: () => ({
    login: vi.fn().mockResolvedValue(false),
  }),
}));

describe("Login", () => {
  it("validates password length before submitting", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    await user.type(
      screen.getByPlaceholderText(/Enter your email or username/i),
      "juan@example.com",
    );
    await user.type(screen.getByPlaceholderText(/Enter your Password/i), "short");
    await user.click(screen.getByRole("button", { name: /Login/i }));

    expect(
      screen.getByText(/Password must be at least 8 characters/i),
    ).toBeInTheDocument();
  });
});

