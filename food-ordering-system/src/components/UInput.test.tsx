import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UInput, { MailIcon, LockIcon } from "../components/UInput";

describe("UInput Component", () => {
  it("renders with label and placeholder", () => {
    render(
      <UInput
        label="Email"
        placeholder="Enter email"
        value=""
        onChange={() => {}}
      />
    );

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
  });

  it("renders with icon", () => {
    render(
      <UInput
        label="Email"
        placeholder="Enter email"
        value=""
        onChange={() => {}}
        Icon={MailIcon}
      />
    );

    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
  });

  it("handles input change", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <UInput
        label="Email"
        placeholder="Enter email"
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByPlaceholderText("Enter email");
    await user.type(input, "test@example.com");

    expect(handleChange).toHaveBeenCalled();
  });

  it("supports different input types", () => {
    const { rerender } = render(
      <UInput
        label="Password"
        type="password"
        placeholder="Enter password"
        value=""
        onChange={() => {}}
      />
    );

    let input = screen.getByPlaceholderText("Enter password") as HTMLInputElement;
    expect(input.type).toBe("password");

    rerender(
      <UInput
        label="Email"
        type="email"
        placeholder="Enter email"
        value=""
        onChange={() => {}}
      />
    );

    input = screen.getByPlaceholderText("Enter email") as HTMLInputElement;
    expect(input.type).toBe("email");
  });

  it("maintains controlled value", async () => {
    const user = userEvent.setup();
    let value = "";
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      value = e.target.value;
    };

    const { rerender } = render(
      <UInput
        label="Email"
        placeholder="Enter email"
        value={value}
        onChange={handleChange}
      />
    );

    const input = screen.getByPlaceholderText("Enter email") as HTMLInputElement;
    await user.type(input, "test");

    rerender(
      <UInput
        label="Email"
        placeholder="Enter email"
        value={value}
        onChange={handleChange}
      />
    );

    expect(input.value).toBe("test");
  });
});
