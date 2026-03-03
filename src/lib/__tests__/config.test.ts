import { describe, it, expect } from "vitest";
import { config } from "../config";

describe("config", () => {
  it("has default values", () => {
    expect(config.name).toBeDefined();
    expect(config.tagline).toBeDefined();
    expect(config.description).toBeDefined();
  });

  it("has correct default locale", () => {
    expect(config.defaultLocale).toBe("en");
  });

  it("has numeric articles per page", () => {
    expect(typeof config.articlesPerPage).toBe("number");
    expect(config.articlesPerPage).toBeGreaterThan(0);
  });

  it("has numeric max upload size", () => {
    expect(typeof config.maxUploadSize).toBe("number");
    expect(config.maxUploadSize).toBeGreaterThan(0);
  });

  it("has boolean flags", () => {
    expect(typeof config.mapEnabled).toBe("boolean");
    expect(typeof config.registrationEnabled).toBe("boolean");
    expect(typeof config.discussionsEnabled).toBe("boolean");
  });
});
