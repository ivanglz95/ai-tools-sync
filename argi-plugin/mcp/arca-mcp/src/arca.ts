import { createReadStream, existsSync } from "node:fs";
import { createInterface } from "node:readline";

export type Contribuyente = {
  cuit: string;
  denominacion?: string;
  impuestoGanancias?: string;
  impuestoIva?: string;
  monotributo?: string;
  integranteSociedad?: boolean;
  empleador?: boolean;
  actividadMonotributo?: string;
  estado?: string;
  actividades: string[];
  domicilio?: string;
  fuente: "padron-local";
};

export type ConsultaContribuyente = {
  cuit: string;
  cuitValido: boolean;
  encontrado: boolean;
  contribuyente?: Contribuyente;
  fuente: string;
  requiereCaptchaOWsaa: boolean;
  urlsOficiales: {
    constanciaPublica: string;
    archivoCompleto: string;
    manualWsConstancia: string;
  };
  nota?: string;
};

export type Vencimiento = {
  titulo: string;
  descripcion: string;
  terminacionCuit: string;
  fecha: string;
  periodo?: string;
  formasDePagoUrl?: string;
};

const ARCA_VENCIMIENTOS_XML = "https://www.arca.gob.ar/vencimientos/xml/vencimientos.xml";
const ARCA_CONSTANCIA_URL =
  "https://seti.afip.gob.ar/padron-puc-constancia-internet/ConsultaConstanciaAction.do";
const ARCA_ARCHIVO_COMPLETO_URL =
  "https://www.afip.gov.ar/genericos/cinscripcion/archivocompleto.asp";
const ARCA_WSCI_MANUAL_URL =
  "https://www.arca.gob.ar/ws/WSCI/manual-ws-sr-ws-constancia-inscripcion-V3.6.pdf";

const GANANCIAS: Record<string, string> = {
  NI: "No inscripto",
  AC: "Activo",
  EX: "Exento",
  NC: "No corresponde",
};

const IVA: Record<string, string> = {
  NI: "No inscripto",
  AC: "Activo",
  EX: "Exento",
  NA: "No alcanzado",
  XN: "Exento no alcanzado",
  AN: "Activo no alcanzado",
};

export class ArcaClient {
  private readonly timeoutMs: number;
  private readonly padronTxtPath?: string;

  constructor() {
    this.timeoutMs = Number(process.env.ARCA_TIMEOUT_MS ?? 15000);
    this.padronTxtPath = process.env.ARCA_PADRON_TXT_PATH;
  }

  async consultarContribuyente(cuitInput: string): Promise<ConsultaContribuyente> {
    const cuit = normalizeCuit(cuitInput);
    const cuitValido = isValidCuit(cuit);
    const urlsOficiales = officialUrls();

    if (!cuitValido) {
      return {
        cuit,
        cuitValido,
        encontrado: false,
        fuente: "validacion-local",
        requiereCaptchaOWsaa: false,
        urlsOficiales,
        nota: "CUIT invalida segun longitud, digitos verificadores o formato.",
      };
    }

    const contribuyente = await this.findInLocalPadron(cuit);
    if (contribuyente) {
      return {
        cuit,
        cuitValido,
        encontrado: true,
        contribuyente,
        fuente: "ARCA archivo completo local",
        requiereCaptchaOWsaa: false,
        urlsOficiales,
      };
    }

    return {
      cuit,
      cuitValido,
      encontrado: false,
      fuente: this.padronTxtPath ? "ARCA archivo completo local" : "sin padron local configurado",
      requiereCaptchaOWsaa: true,
      urlsOficiales,
      nota:
        "La consulta publica online de constancia requiere CAPTCHA y el web service formal requiere WSAA/certificado. Configure ARCA_PADRON_TXT_PATH con el archivo completo extraido para resolver datos individuales sin credenciales.",
    };
  }

  async verificarConstancia(cuitInput: string) {
    const consulta = await this.consultarContribuyente(cuitInput);
    const estado =
      consulta.contribuyente?.estado ??
      inferEstadoConstancia(consulta.contribuyente);

    return {
      cuit: consulta.cuit,
      cuitValido: consulta.cuitValido,
      constanciaVerificableAutomaticamente: Boolean(consulta.contribuyente),
      constanciaVigente:
        consulta.contribuyente ? estado !== "sin alta visible en impuestos principales" : null,
      estado,
      contribuyente: consulta.contribuyente,
      requiereCaptchaOWsaa: consulta.requiereCaptchaOWsaa,
      urlsOficiales: consulta.urlsOficiales,
      nota: consulta.contribuyente
        ? "Verificacion basada en el archivo completo publico configurado localmente."
        : consulta.nota,
    };
  }

  async obtenerVencimientos(periodo?: string): Promise<{
    periodo?: string;
    fuente: string;
    count: number;
    vencimientos: Vencimiento[];
  }> {
    if (periodo && !/^\d{6}$/.test(periodo)) {
      throw new Error("periodo debe tener formato AAAAMM.");
    }

    const xml = await this.fetchText(ARCA_VENCIMIENTOS_XML);
    const vencimientos = parseVencimientosXml(xml)
      .filter((vencimiento) => !periodo || vencimiento.periodo === periodo)
      .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.titulo.localeCompare(b.titulo));

    return {
      periodo,
      fuente: ARCA_VENCIMIENTOS_XML,
      count: vencimientos.length,
      vencimientos,
    };
  }

  private async findInLocalPadron(cuit: string): Promise<Contribuyente | undefined> {
    if (!this.padronTxtPath || !existsSync(this.padronTxtPath)) {
      return undefined;
    }

    const stream = createReadStream(this.padronTxtPath, { encoding: "latin1" });
    const lines = createInterface({ input: stream, crlfDelay: Infinity });
    try {
      for await (const line of lines) {
        if (line.startsWith(cuit)) {
          return parsePadronLine(line);
        }
      }
    } finally {
      lines.close();
      stream.destroy();
    }

    return undefined;
  }

  private async fetchText(url: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "text/xml, application/xml, text/html;q=0.8",
          "User-Agent": "argi-arca-mcp/0.1",
        },
      });
      if (!response.ok) {
        throw new Error(`ARCA responded ${response.status} for ${url}`);
      }
      const contentType = response.headers.get("content-type") ?? "";
      const charset =
        contentType.match(/charset=([^;]+)/i)?.[1]?.trim().toLowerCase() ??
        (contentType.includes("text/html") ? "windows-1252" : "utf-8");
      const buffer = await response.arrayBuffer();
      return new TextDecoder(charset === "iso-8859-1" ? "windows-1252" : charset).decode(buffer);
    } finally {
      clearTimeout(timeout);
    }
  }
}

function parsePadronLine(line: string): Contribuyente {
  const cuit = field(line, 0, 11);
  const denominacion = field(line, 11, 41);
  const impGananciasCode = field(line, 41, 43);
  const impIvaCode = field(line, 43, 45);
  const monotributoCode = field(line, 45, 47);
  const integranteSocCode = field(line, 47, 48);
  const empleadorCode = field(line, 48, 49);
  const actividadMonotributo = field(line, 50, 52);

  const contribuyente: Contribuyente = {
    cuit,
    denominacion,
    impuestoGanancias: decodeStatus(impGananciasCode, GANANCIAS),
    impuestoIva: decodeStatus(impIvaCode, IVA),
    monotributo: monotributoCode && monotributoCode !== "NI" ? monotributoCode : "No inscripto",
    integranteSociedad: integranteSocCode === "S",
    empleador: empleadorCode === "S",
    actividadMonotributo,
    estado: undefined,
    actividades: actividadMonotributo && actividadMonotributo !== "00" ? [actividadMonotributo] : [],
    fuente: "padron-local",
  };
  contribuyente.estado = inferEstadoConstancia(contribuyente);
  return contribuyente;
}

function parseVencimientosXml(xml: string): Vencimiento[] {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  const vencimientos: Vencimiento[] = [];

  for (const item of items) {
    const block = item[1] ?? "";
    const titulo = cleanInline(readTag(block, "titulo"));
    const descripcionRaw = readTag(block, "descripcion");
    const descripcion = cleanInline(stripTables(descripcionRaw));
    const formas = cleanInline(readTag(block, "formas"));
    const rows = parseRows(descripcionRaw);

    for (const row of rows) {
      const fecha = toIsoDate(row.fecha);
      vencimientos.push({
        titulo,
        descripcion,
        terminacionCuit: row.terminacionCuit,
        fecha,
        periodo: fecha.slice(0, 7).replace("-", ""),
        formasDePagoUrl: formas ? new URL(formas, "https://www.arca.gob.ar").toString() : undefined,
      });
    }
  }

  return vencimientos;
}

function parseRows(html: string): Array<{ terminacionCuit: string; fecha: string }> {
  const rows: Array<{ terminacionCuit: string; fecha: string }> = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  for (const row of html.matchAll(rowRegex)) {
    const cells = [...(row[1] ?? "").matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) =>
      cleanInline(cell[1] ?? ""),
    );
    if (cells.length >= 2 && /\d{2}\/\d{2}\/\d{4}/.test(cells[1] ?? "")) {
      rows.push({
        terminacionCuit: cells[0] ?? "",
        fecha: cells[1] ?? "",
      });
    }
  }
  return rows;
}

function toIsoDate(value: string): string {
  const match = value.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) {
    return value;
  }
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function readTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*<\\/${tag}>`, "i"));
  return decodeEntities(match?.[1] ?? "");
}

function stripTables(value: string): string {
  return value.replace(/<table[\s\S]*?<\/table>/gi, " ");
}

function field(line: string, start: number, end: number): string {
  return line.slice(start, end).trim();
}

function decodeStatus(code: string, map: Record<string, string>): string {
  return map[code] ? `${code} - ${map[code]}` : code || "Sin dato";
}

function inferEstadoConstancia(contribuyente?: Contribuyente): string | undefined {
  if (!contribuyente) {
    return undefined;
  }
  const active =
    contribuyente.impuestoGanancias?.startsWith("AC") ||
    contribuyente.impuestoIva?.startsWith("AC") ||
    (contribuyente.monotributo && contribuyente.monotributo !== "No inscripto") ||
    contribuyente.empleador;
  return active ? "activo en padron publico" : "sin alta visible en impuestos principales";
}

export function normalizeCuit(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidCuit(cuit: string): boolean {
  if (!/^\d{11}$/.test(cuit)) {
    return false;
  }
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = weights.reduce((acc, weight, index) => acc + Number(cuit[index]) * weight, 0);
  const mod = 11 - (sum % 11);
  const verifier = mod === 11 ? 0 : mod === 10 ? 9 : mod;
  return verifier === Number(cuit[10]);
}

function officialUrls() {
  return {
    constanciaPublica: ARCA_CONSTANCIA_URL,
    archivoCompleto: ARCA_ARCHIVO_COMPLETO_URL,
    manualWsConstancia: ARCA_WSCI_MANUAL_URL,
  };
}

function cleanInline(value: string): string {
  return decodeEntities(value.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&aacute;/gi, "a")
    .replace(/&eacute;/gi, "e")
    .replace(/&iacute;/gi, "i")
    .replace(/&oacute;/gi, "o")
    .replace(/&uacute;/gi, "u")
    .replace(/&ntilde;/gi, "n")
    .replace(/&Aacute;/g, "A")
    .replace(/&Eacute;/g, "E")
    .replace(/&Iacute;/g, "I")
    .replace(/&Oacute;/g, "O")
    .replace(/&Uacute;/g, "U")
    .replace(/&Ntilde;/g, "N")
    .replace(/&ordm;/gi, "º")
    .replace(/&#176;/g, "°")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}
