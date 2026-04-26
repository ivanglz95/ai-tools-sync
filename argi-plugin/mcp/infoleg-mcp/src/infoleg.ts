export type NormaResumen = {
  id: string;
  titulo: string;
  tipo?: string;
  numero?: string;
  fecha?: string;
  organismo?: string;
  resumen?: string;
  url: string;
};

export type NormaDetalle = NormaResumen & {
  texto?: string;
  articulos: Array<{ numero: string; texto: string }>;
  textoActualizadoUrl?: string;
  fuente: "api" | "web";
};

export type BuscarNormaParams = {
  query: string;
  organismo?: string;
  solo_vigentes?: boolean;
};

export type BuscarPorNumeroParams = {
  tipo: string;
  numero: string;
  anio?: string;
};

type RequestOptions = {
  method?: "GET" | "POST";
  body?: URLSearchParams;
  accept?: string;
};

const DEFAULT_API_BASE_URL = "https://servicios.infoleg.gob.ar/infoleg-internet/api/";
const DEFAULT_WEB_BASE_URL = "https://servicios.infoleg.gob.ar/infolegInternet/";

export class InfolegClient {
  private readonly apiBaseUrl: URL;
  private readonly webBaseUrl: URL;
  private readonly timeoutMs: number;
  private tipoNormaCache?: Map<string, string>;

  constructor() {
    this.apiBaseUrl = ensureTrailingSlash(
      new URL(process.env.INFOLEG_API_BASE_URL ?? DEFAULT_API_BASE_URL),
    );
    this.webBaseUrl = ensureTrailingSlash(
      new URL(process.env.INFOLEG_WEB_BASE_URL ?? DEFAULT_WEB_BASE_URL),
    );
    this.timeoutMs = Number(process.env.INFOLEG_TIMEOUT_MS ?? 15000);
  }

  async buscarNorma(params: BuscarNormaParams): Promise<NormaResumen[]> {
    const apiResults = await this.tryApiSearch(params);
    if (apiResults.length > 0) {
      return apiResults;
    }

    const url = new URL("buscarNormas.do", this.webBaseUrl);
    url.searchParams.set("texto", params.query);
    url.searchParams.set("INFOLEG_OLD_QUERY", "true");
    if (params.organismo) {
      url.searchParams.set("dependencia", params.organismo);
    }

    const html = await this.fetchText(url, { accept: "text/html" });
    return parseSearchResults(html, this.webBaseUrl);
  }

  async obtenerNorma(id: string): Promise<NormaDetalle> {
    const apiResult = await this.tryApiGetNorma(id);
    if (apiResult) {
      return apiResult;
    }

    const url = new URL("verNorma.do", this.webBaseUrl);
    url.searchParams.set("id", id);
    const html = await this.fetchText(url, { accept: "text/html" });
    const detail = parseNormaDetail(id, html, url);

    if (detail.textoActualizadoUrl) {
      try {
        const updatedHtml = await this.fetchText(new URL(detail.textoActualizadoUrl), {
          accept: "text/html",
        });
        const updatedText = cleanHtml(updatedHtml);
        detail.texto = updatedText;
        detail.articulos = extractArticles(updatedText);
      } catch {
        // Keep the base InfoLEG detail if the updated text page is unavailable.
      }
    }

    return detail;
  }

  async buscarPorNumero(params: BuscarPorNumeroParams): Promise<NormaResumen[]> {
    const apiResults = await this.tryApiSearchByNumber(params);
    if (apiResults.length > 0) {
      return apiResults;
    }

    const url = new URL("buscarNormas.do", this.webBaseUrl);
    url.searchParams.set("tipo", params.tipo);
    url.searchParams.set("nro", normalizeNumber(params.numero));
    url.searchParams.set("INFOLEG_OLD_QUERY", "true");
    if (params.anio) {
      url.searchParams.set("anio", params.anio);
    }

    const html = await this.fetchText(url, { accept: "text/html" });
    return parseSearchResults(html, this.webBaseUrl);
  }

  private async tryApiSearch(params: BuscarNormaParams): Promise<NormaResumen[]> {
    const candidates = [
      buildUrl(this.apiBaseUrl, "normas", { query: params.query, texto: params.query }),
      buildUrl(this.apiBaseUrl, "buscar", { query: params.query, texto: params.query }),
      buildUrl(this.apiBaseUrl, "normas/buscar", { query: params.query, texto: params.query }),
    ];
    return this.firstApiList(candidates);
  }

  private async tryApiSearchByNumber(params: BuscarPorNumeroParams): Promise<NormaResumen[]> {
    const candidates = [
      buildUrl(this.apiBaseUrl, "normas", {
        tipo: params.tipo,
        numero: params.numero,
        anio: params.anio,
      }),
      buildUrl(this.apiBaseUrl, "normas/buscar-por-numero", {
        tipo: params.tipo,
        numero: params.numero,
        anio: params.anio,
      }),
      buildUrl(this.apiBaseUrl, "buscar-por-numero", {
        tipo: params.tipo,
        numero: params.numero,
        anio: params.anio,
      }),
    ];
    return this.firstApiList(candidates);
  }

  private async tryApiGetNorma(id: string): Promise<NormaDetalle | undefined> {
    const candidates = [
      buildUrl(this.apiBaseUrl, `normas/${encodeURIComponent(id)}`),
      buildUrl(this.apiBaseUrl, `norma/${encodeURIComponent(id)}`),
      buildUrl(this.apiBaseUrl, "normas", { id }),
    ];

    for (const url of candidates) {
      try {
        const data = await this.fetchJson(url);
        const normalized = normalizeApiDetail(data, url.toString());
        if (normalized) {
          return normalized;
        }
      } catch {
        continue;
      }
    }
    return undefined;
  }

  private async firstApiList(candidates: URL[]): Promise<NormaResumen[]> {
    for (const url of candidates) {
      try {
        const data = await this.fetchJson(url);
        const normalized = normalizeApiList(data, url.toString());
        if (normalized.length > 0) {
          return normalized;
        }
      } catch {
        continue;
      }
    }
    return [];
  }

  private async resolveTipoNorma(tipo: string): Promise<string | undefined> {
    const cache = await this.getTipoNormaMap();
    const normalized = normalizeKey(tipo);
    return cache.get(normalized) ?? cache.get(normalizeKey(singularizeTipo(tipo)));
  }

  private async getTipoNormaMap(): Promise<Map<string, string>> {
    if (this.tipoNormaCache) {
      return this.tipoNormaCache;
    }

    const html = await this.fetchText(this.webBaseUrl, { accept: "text/html" });
    const map = new Map<string, string>();
    const optionRegex = /<option\s+value="([^"]*)"\s*>([\s\S]*?)<\/option>/gi;
    for (const match of html.matchAll(optionRegex)) {
      const value = match[1];
      const label = cleanHtml(match[2] ?? "");
      if (value && label) {
        map.set(normalizeKey(label), value);
      }
    }

    this.tipoNormaCache = map;
    return map;
  }

  private async fetchJson(url: URL): Promise<unknown> {
    const text = await this.fetchText(url, { accept: "application/json" });
    return JSON.parse(text);
  }

  private async fetchText(url: URL, options: RequestOptions = {}): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(url, {
        method: options.method ?? "GET",
        body: options.body,
        signal: controller.signal,
        headers: {
          Accept: options.accept ?? "application/json, text/html;q=0.8",
          "Content-Type": options.body
            ? "application/x-www-form-urlencoded; charset=UTF-8"
            : "application/json",
          "User-Agent": "argi-infoleg-mcp/0.1",
        },
      });
      if (!response.ok) {
        throw new Error(`InfoLEG responded ${response.status} for ${url.toString()}`);
      }
      const contentType = response.headers.get("content-type") ?? "";
      const charset =
        contentType.match(/charset=([^;]+)/i)?.[1]?.trim().toLowerCase() ??
        (contentType.includes("text/html") ? "iso-8859-1" : "utf-8");
      const buffer = await response.arrayBuffer();
      const decoder = new TextDecoder(charset === "iso-8859-1" ? "windows-1252" : "utf-8");
      return decoder.decode(buffer);
    } finally {
      clearTimeout(timeout);
    }
  }
}

function parseSearchResults(html: string, webBaseUrl: URL): NormaResumen[] {
  const results: NormaResumen[] = [];
  const linkRegex = /<a\s+href="([^"]*verNorma\.do[^"]*id=(\d+)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of html.matchAll(linkRegex)) {
    const href = match[1] ?? "";
    const id = match[2] ?? "";
    const titleText = cleanInline(cleanHtml(match[3] ?? ""));
    const afterLink = html.slice(match.index ? match.index + match[0].length : 0, (match.index ?? 0) + match[0].length + 1200);
    const topic = matchClean(afterLink, /<b>([\s\S]*?)<\/b>/i) ?? "";
    const summary = matchClean(afterLink, /<span[^>]*>\s*<i>([\s\S]*?)<\/i>\s*<\/span>/i) ?? "";
    const { tipo, numero } = splitNormaTitle(titleText);
    results.push({
      id,
      titulo: [titleText, topic].filter(Boolean).map(cleanInline).join(" - "),
      tipo,
      numero,
      resumen: summary || undefined,
      url: absoluteInfolegUrl(href, webBaseUrl),
    });
  }

  return dedupeById(results);
}

function parseNormaDetail(id: string, html: string, url: URL): NormaDetalle {
  const plain = cleanHtml(html);
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = titleMatch?.[1]
    ? cleanInline(cleanHtml(titleMatch[1]))
    : firstNonEmptyLine(plain) ?? `Norma ${id}`;
  const { tipo, numero } = splitNormaTitle(title);
  const resumen = matchClean(html, /<strong>\s*Resumen:\s*<\/strong>\s*<br\s*\/?>([\s\S]*?)(?:<br\s*\/?>\s*<br\s*\/?>|<a\s+)/i);
  const textoActualizadoHref = matchRaw(
    html,
    /<a\s+href=['"]([^'"]*texact\.htm)['"][^>]*>\s*<b>\s*Texto actualizado de la norma\s*<\/b>/i,
  );
  const articulos = extractArticles(plain);

  return {
    id,
    titulo: title,
    tipo,
    numero,
    resumen: resumen || undefined,
    texto: plain,
    articulos,
    textoActualizadoUrl: textoActualizadoHref
      ? absoluteInfolegUrl(textoActualizadoHref, url)
      : undefined,
    url: url.toString(),
    fuente: "web",
  };
}

function normalizeApiList(data: unknown, sourceUrl: string): NormaResumen[] {
  const items = Array.isArray(data)
    ? data
    : getArray(data, ["results", "items", "data", "normas", "content"]);

  return dedupeById(
    items
      .map((item) => normalizeApiSummary(item, sourceUrl))
      .filter((item): item is NormaResumen => Boolean(item)),
  );
}

function normalizeApiDetail(data: unknown, sourceUrl: string): NormaDetalle | undefined {
  const summary = normalizeApiSummary(data, sourceUrl);
  if (!summary) {
    return undefined;
  }
  const record = isRecord(data) ? data : {};
  const texto = stringFrom(record, ["texto", "textoCompleto", "contenido", "body"]);
  return {
    ...summary,
    texto,
    articulos: texto ? extractArticles(texto) : [],
    fuente: "api",
  };
}

function normalizeApiSummary(data: unknown, sourceUrl: string): NormaResumen | undefined {
  if (!isRecord(data)) {
    return undefined;
  }

  const id = stringFrom(data, ["id", "normaId", "idNorma", "identificador"]);
  if (!id) {
    return undefined;
  }

  const titulo =
    stringFrom(data, ["titulo", "tituloNorma", "nombre", "denominacion"]) ?? `Norma ${id}`;
  const tipo = stringFrom(data, ["tipo", "tipoNorma"]);
  const numero = stringFrom(data, ["numero", "nro", "nroNorma"]);

  return {
    id,
    titulo,
    tipo,
    numero,
    fecha: stringFrom(data, ["fecha", "fechaSancion", "fechaPublicacion"]),
    organismo: stringFrom(data, ["organismo", "dependencia"]),
    resumen: stringFrom(data, ["resumen", "sumario", "descripcion"]),
    url: stringFrom(data, ["url", "link"]) ?? sourceUrl,
  };
}

function extractArticles(text: string): Array<{ numero: string; texto: string }> {
  const compact = text.replace(/\r/g, "").replace(/[ \t]+/g, " ");
  const articleRegex =
    /(?:^|\n)\s*(ART(?:ICULO|\.?)\s+[0-9]+[^\n]*)\n([\s\S]*?)(?=\n\s*ART(?:ICULO|\.?)\s+[0-9]+|\n\s*DISPOSICIONES|\n\s*TITULO|\n\s*CAPITULO|$)/gi;
  const articles: Array<{ numero: string; texto: string }> = [];
  for (const match of compact.matchAll(articleRegex)) {
    const heading = cleanText(match[1] ?? "");
    const body = cleanText(match[2] ?? "");
    if (heading && body) {
      articles.push({ numero: heading, texto: body.slice(0, 4000) });
    }
    if (articles.length >= 80) {
      break;
    }
  }
  return articles;
}

function buildUrl(base: URL, path: string, params: Record<string, string | undefined> = {}): URL {
  const url = new URL(path.replace(/^\//, ""), base);
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }
  return url;
}

function getArray(data: unknown, keys: string[]): unknown[] {
  if (!isRecord(data)) {
    return [];
  }
  for (const key of keys) {
    const value = data[key];
    if (Array.isArray(value)) {
      return value;
    }
  }
  return [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringFrom(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number") {
      return String(value);
    }
  }
  return undefined;
}

function splitNormaTitle(title: string): { tipo?: string; numero?: string } {
  const match = title.match(/^([A-Za-zÁÉÍÓÚÜÑáéíóúüñ.\s]+?)\s+([0-9./-]+)/);
  return {
    tipo: match?.[1]?.trim(),
    numero: match?.[2]?.trim(),
  };
}

function cleanHtml(value: string): string {
  return decodeHtmlEntities(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|h\d|li|tr)>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  ).replace(/\n{3,}/g, "\n\n").trim();
}

function cleanText(value: string): string {
  return value.replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();
}

function cleanInline(value: string): string {
  return cleanText(value).replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value: string): string {
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
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function matchClean(html: string, regex: RegExp): string | undefined {
  const value = matchRaw(html, regex);
  return value ? cleanHtml(value) : undefined;
}

function matchRaw(html: string, regex: RegExp): string | undefined {
  return html.match(regex)?.[1];
}

function absoluteInfolegUrl(href: string, base: URL): string {
  return new URL(href.replace(/;jsessionid=[^?"]+/i, ""), base).toString();
}

function ensureTrailingSlash(url: URL): URL {
  if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }
  return url;
}

function dedupeById(items: NormaResumen[]): NormaResumen[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function singularizeTipo(tipo: string): string {
  return tipo.replace(/es$/i, "").replace(/s$/i, "");
}

function normalizeNumber(numero: string): string {
  return numero.replace(/[.\s]/g, "");
}

function firstNonEmptyLine(value: string): string | undefined {
  return value.split("\n").map((line) => line.trim()).find(Boolean);
}
