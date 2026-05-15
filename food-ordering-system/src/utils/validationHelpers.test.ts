import { describe, expect, it } from "vitest";
import {
  validateEmail,
  validateUsername,
  validateLoginId,
  validatePassword,
  validatePasswordMatch,
  validateName,
  validatePhoneNumber,
  validateRegisterForm,
  validateLoginForm,
} from "../utils/validationHelpers";

describe("Validation Helpers", () => {
  describe("validateEmail", () => {
    it("validates correct email format", () => {
      const result = validateEmail("user@example.com");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("rejects empty email", () => {
      const result = validateEmail("");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("required");
    });

    it("rejects invalid email format", () => {
      const result = validateEmail("notanemail");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("valid email");
    });

    it("rejects email with spaces", () => {
      const result = validateEmail("user @example.com");
      expect(result.valid).toBe(false);
    });

    it("handles email with leading/trailing spaces", () => {
      const result = validateEmail("  user@example.com  ");
      expect(result.valid).toBe(true);
    });

    it("rejects email exceeding max length", () => {
      const longEmail = "a".repeat(91) + "@example.com";
      const result = validateEmail(longEmail);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("100");
    });
  });

  describe("validateUsername", () => {
    it("validates correct username", () => {
      const result = validateUsername("user_123");
      expect(result.valid).toBe(true);
    });

    it("allows hyphens and underscores", () => {
      const result = validateUsername("user-name_123");
      expect(result.valid).toBe(true);
    });

    it("rejects username with special characters", () => {
      const result = validateUsername("user@name");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("letters, numbers");
    });

    it("rejects username shorter than 3 chars", () => {
      const result = validateUsername("ab");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("3");
    });

    it("rejects username longer than 20 chars", () => {
      const result = validateUsername("a".repeat(21));
      expect(result.valid).toBe(false);
      expect(result.error).toContain("20");
    });
  });

  describe("validateLoginId", () => {
    it("validates email as login ID", () => {
      const result = validateLoginId("user@example.com");
      expect(result.valid).toBe(true);
    });

    it("validates username as login ID", () => {
      const result = validateLoginId("user_123");
      expect(result.valid).toBe(true);
    });

    it("rejects invalid email or username", () => {
      const result = validateLoginId("ab");
      expect(result.valid).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("validates strong password", () => {
      const result = validatePassword("Password123");
      expect(result.valid).toBe(true);
    });

    it("rejects password without letter", () => {
      const result = validatePassword("12345678");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("letter");
    });

    it("rejects password without number", () => {
      const result = validatePassword("PasswordNoNumber");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("number");
    });

    it("rejects password shorter than 8 chars", () => {
      const result = validatePassword("Pass1");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("8");
    });

    it("rejects password longer than 100 chars", () => {
      const result = validatePassword("Pass1" + "a".repeat(96));
      expect(result.valid).toBe(false);
      expect(result.error).toContain("100");
    });
  });

  describe("validatePasswordMatch", () => {
    it("accepts matching passwords", () => {
      const result = validatePasswordMatch("Password123", "Password123");
      expect(result.valid).toBe(true);
    });

    it("rejects non-matching passwords", () => {
      const result = validatePasswordMatch("Password123", "Password456");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("do not match");
    });
  });

  describe("validateName", () => {
    it("validates correct full name", () => {
      const result = validateName("Juan Dela Cruz");
      expect(result.valid).toBe(true);
    });

    it("validates name with apostrophe", () => {
      const result = validateName("O'Brien");
      expect(result.valid).toBe(true);
    });

    it("validates name with hyphen", () => {
      const result = validateName("Mary-Jane");
      expect(result.valid).toBe(true);
    });

    it("rejects name with numbers", () => {
      const result = validateName("Juan123");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("letters");
    });

    it("rejects name shorter than 2 chars", () => {
      const result = validateName("J");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("2");
    });

    it("rejects name longer than 50 chars", () => {
      const result = validateName("a".repeat(51));
      expect(result.valid).toBe(false);
      expect(result.error).toContain("50");
    });

    it("uses custom field name in error", () => {
      const result = validateName("", "Nickname");
      expect(result.error).toContain("Nickname");
    });
  });

  describe("validatePhoneNumber", () => {
    it("validates correct phone number", () => {
      const result = validatePhoneNumber("09171234567");
      expect(result.valid).toBe(true);
    });

    it("accepts phone with formatting", () => {
      const result = validatePhoneNumber("+63 917-123-4567");
      expect(result.valid).toBe(true);
    });

    it("rejects phone with fewer than 10 digits", () => {
      const result = validatePhoneNumber("0917123456");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("10");
    });

    it("rejects phone with more than 11 digits", () => {
      const result = validatePhoneNumber("091712345678");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("11");
    });

    it("rejects empty phone", () => {
      const result = validatePhoneNumber("");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("required");
    });
  });

  describe("validateRegisterForm", () => {
    const validForm = {
      firstName: "Juan",
      lastName: "Dela Cruz",
      email: "juan@example.com",
      phone: "09171234567",
      password: "Password123",
      confirmPassword: "Password123",
      agree: true,
    };

    it("validates correct register form", () => {
      const result = validateRegisterForm(validForm);
      expect(result.valid).toBe(true);
    });

    it("rejects form when agree is false", () => {
      const result = validateRegisterForm({ ...validForm, agree: false });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("agree");
    });

    it("rejects form with invalid first name", () => {
      const result = validateRegisterForm({ ...validForm, firstName: "J" });
      expect(result.valid).toBe(false);
    });

    it("rejects form with invalid email", () => {
      const result = validateRegisterForm({ ...validForm, email: "invalid" });
      expect(result.valid).toBe(false);
    });

    it("rejects form with mismatched passwords", () => {
      const result = validateRegisterForm({
        ...validForm,
        confirmPassword: "Different123",
      });
      expect(result.valid).toBe(false);
    });

    it("validates with phone formatting", () => {
      const result = validateRegisterForm({
        ...validForm,
        phone: "+63 917-123-4567",
      });
      expect(result.valid).toBe(true);
    });
  });

  describe("validateLoginForm", () => {
    it("validates correct login form with email", () => {
      const result = validateLoginForm({
        loginId: "user@example.com",
        password: "Password123",
      });
      expect(result.valid).toBe(true);
    });

    it("validates correct login form with username", () => {
      const result = validateLoginForm({
        loginId: "user_123",
        password: "Password123",
      });
      expect(result.valid).toBe(true);
    });

    it("rejects login with weak password", () => {
      const result = validateLoginForm({
        loginId: "user@example.com",
        password: "weak",
      });
      expect(result.valid).toBe(false);
    });

    it("rejects login with invalid email", () => {
      const result = validateLoginForm({
        loginId: "notanemail",
        password: "Password123",
      });
      expect(result.valid).toBe(false);
    });
  });
});
