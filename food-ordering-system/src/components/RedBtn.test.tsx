import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RedBtn from "../components/RedBtn";

describe("RedBtn Component", () => {
  it("renders button with text", () => {
    render(<RedBtn>Click Me</RedBtn>);
    const button = screen.getByRole("button", { name: /Click Me/i });
    expect(button).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<RedBtn onClick={handleClick}>Click Me</RedBtn>);
    const button = screen.getByRole("button", { name: /Click Me/i });

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("supports disabled state", () => {
    render(<RedBtn disabled>Click Me</RedBtn>);
    const button = screen.getByRole("button", { name: /Click Me/i });

    expect(button).toBeDisabled();
  });

  it("does not trigger click when disabled", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <RedBtn onClick={handleClick} disabled>
        Click Me
      </RedBtn>
    );
    const button = screen.getByRole("button", { name: /Click Me/i });

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("supports type prop (submit, button, reset)", () => {
    const { rerender } = render(<RedBtn type="submit">Submit</RedBtn>);
    let button = screen.getByRole("button", { name: /Submit/i }) as HTMLButtonElement;
    expect(button.type).toBe("submit");

    rerender(<RedBtn type="reset">Reset</RedBtn>);
    button = screen.getByRole("button", { name: /Reset/i }) as HTMLButtonElement;
    expect(button.type).toBe("reset");
  });

  it("forwards className prop", () => {
    const { container } = render(<RedBtn className="custom-class">Click</RedBtn>);
    const button = container.querySelector("button");

    expect(button).toHaveClass("custom-class");
  });
});
