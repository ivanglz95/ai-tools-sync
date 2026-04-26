import { describe, expect, test } from "bun:test";
import { ArcaClient, isValidCuit, normalizeCuit } from "../src/arca.js";

describe("CUIT helpers", () => {
  test("normalizes and validates CUIT", () => {
    expect(normalizeCuit("20-11111111-2")).toBe("20111111112");
    expect(isValidCuit("20111111112")).toBe(true);
    expect(isValidCuit("20111111111")).toBe(false);
  });
});

describe("ArcaClient", () => {
  test("obtiene vencimientos desde XML publico", async () => {
    const client = new ArcaClient();
    const result = await client.obtenerVencimientos("202604");

    expect(result.periodo).toBe("202604");
    expect(result.count).toBeGreaterThan(0);
    expect(result.vencimientos[0]?.fecha).toMatch(/^2026-04-/);
  }, 30000);

  test("explains CAPTCHA/WSAA when no local padron is configured", async () => {
    const previousPath = process.env.ARCA_PADRON_TXT_PATH;
    delete process.env.ARCA_PADRON_TXT_PATH;
    const client = new ArcaClient();
    const result = await client.consultarContribuyente("20-11111111-2");
    if (previousPath) {
      process.env.ARCA_PADRON_TXT_PATH = previousPath;
    }

    expect(result.cuitValido).toBe(true);
    expect(result.requiereCaptchaOWsaa).toBe(true);
    expect(result.nota).toContain("CAPTCHA");
  });
});
