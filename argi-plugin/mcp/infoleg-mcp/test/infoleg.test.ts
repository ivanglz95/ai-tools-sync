import { describe, expect, test } from "bun:test";
import { InfolegClient } from "../src/infoleg.js";

describe("InfolegClient", () => {
  test("buscarPorNumero finds Ley 19550", async () => {
    const client = new InfolegClient();
    const results = await client.buscarPorNumero({ tipo: "Ley", numero: "19550" });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.id).toBe("25553");
    expect(results[0]?.titulo).toContain("19550");
  }, 30000);

  test("obtenerNorma extracts updated articles", async () => {
    const client = new InfolegClient();
    const norma = await client.obtenerNorma("25553");

    expect(norma.id).toBe("25553");
    expect(norma.articulos.length).toBeGreaterThan(10);
    expect(norma.textoActualizadoUrl).toContain("texact.htm");
  }, 30000);
});
