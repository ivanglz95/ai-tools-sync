#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ArcaClient } from "./arca.js";

const client = new ArcaClient();

const server = new McpServer({
  name: "arca-mcp",
  version: "0.1.0",
});

server.tool(
  "consultar_contribuyente",
  "Consulta datos publicos de un contribuyente ARCA por CUIT cuando hay padron local configurado.",
  {
    cuit: z.string().min(8).describe("CUIT/CUIL/CDI, con o sin guiones."),
  },
  async ({ cuit }) => jsonToolResult(await client.consultarContribuyente(cuit)),
);

server.tool(
  "obtener_vencimientos",
  "Obtiene vencimientos publicados por ARCA. Puede filtrarse por periodo AAAAMM.",
  {
    periodo: z.string().regex(/^\d{6}$/).optional().describe("Periodo opcional en formato AAAAMM."),
  },
  async ({ periodo }) => jsonToolResult(await client.obtenerVencimientos(periodo)),
);

server.tool(
  "verificar_constancia",
  "Verifica si una constancia ARCA puede validarse automaticamente para un CUIT.",
  {
    cuit: z.string().min(8).describe("CUIT/CUIL/CDI, con o sin guiones."),
  },
  async ({ cuit }) => jsonToolResult(await client.verificarConstancia(cuit)),
);

const transport = new StdioServerTransport();
await server.connect(transport);

function jsonToolResult(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}
