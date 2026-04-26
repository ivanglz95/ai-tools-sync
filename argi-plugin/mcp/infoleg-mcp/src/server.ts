#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { InfolegClient } from "./infoleg.js";

const client = new InfolegClient();

const server = new McpServer({
  name: "infoleg-mcp",
  version: "0.1.0",
});

server.tool(
  "buscar_norma",
  "Busca normas en InfoLEG por texto libre y devuelve resultados normalizados.",
  {
    query: z.string().min(2).describe("Texto a buscar en titulo, resumen o contenido."),
    organismo: z.string().optional().describe("Filtro opcional por organismo/dependencia."),
    solo_vigentes: z
      .boolean()
      .optional()
      .describe("Filtro opcional de vigencia si la API lo soporta."),
  },
  async (params) => {
    const results = await client.buscarNorma(params);
    return jsonToolResult({
      count: results.length,
      results,
      note:
        results.length === 0
          ? "InfoLEG no devolvio resultados para la busqueda indicada."
          : undefined,
    });
  },
);

server.tool(
  "obtener_norma",
  "Obtiene el detalle de una norma de InfoLEG por id.",
  {
    id: z.string().min(1).describe("Identificador InfoLEG de la norma."),
  },
  async ({ id }) => {
    const norma = await client.obtenerNorma(id);
    return jsonToolResult(norma);
  },
);

server.tool(
  "buscar_por_numero",
  "Busca una norma por tipo, numero y anio opcional.",
  {
    tipo: z.string().min(2).describe("Tipo de norma, por ejemplo Ley, Decreto o Resolucion."),
    numero: z.string().min(1).describe("Numero de norma, sin puntos separadores."),
    anio: z.string().optional().describe("Anio de sancion/publicacion cuando aplique."),
  },
  async (params) => {
    const results = await client.buscarPorNumero(params);
    return jsonToolResult({
      count: results.length,
      results,
      note:
        results.length === 0
          ? "InfoLEG no devolvio resultados para el tipo y numero indicados."
          : undefined,
    });
  },
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
