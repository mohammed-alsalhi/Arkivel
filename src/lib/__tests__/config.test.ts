import { describe, expect, it } from "vitest";
import { createConfig } from "../config";

describe("config", () => {
  it("uses focused defaults", () => {
    const config = createConfig({});

    expect(config.name).toBe("Arkivel");
    expect(config.logoMark).toBe("/brand/arkivel-logo.svg");
    expect(config.siteMode).toBe("wiki");
  });

  it("reads Arkivel branding without legacy aliases", () => {
    const config = createConfig({
      ARKIVEL_SITE_MODE: "product",
      NEXT_PUBLIC_ARKIVEL_NAME: "my arkivel",
      NEXT_PUBLIC_ARKIVEL_LOGO_MARK: "/brand/custom.svg",
    });

    expect(config.name).toBe("my arkivel");
    expect(config.logoMark).toBe("/brand/custom.svg");
    expect(config.siteMode).toBe("product");
  });
});
