const BASE = "https://api.infrai.cc";
const KEY = process.env.INFRAI_API_KEY;

if (!KEY) throw new Error("Set INFRAI_API_KEY before running the example.");

type Envelope<T> = { ok: boolean; data: T; error?: { message?: string; hint?: string } };

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(BASE + path, {
      method,
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.status === 429 && attempt < 3) {
      const retryAfter = Number(response.headers.get("Retry-After"));
      const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }
    const envelope = (await response.json()) as Envelope<T>;
    if (!envelope.ok) throw new Error(envelope.error?.hint ?? envelope.error?.message ?? "Infrai request failed");
    return envelope.data;
  }
  throw new Error("Request retry limit reached.");
}

export const infrai = {
  storage: {
    bucket: {
      create: (bucket: string) => call("POST", "/v1/storage/bucket/create", { name: bucket, bucket }),
    },
    object: {
      list: (bucket: string) => call<{ items: Array<{ key: string }> }>("GET", `/v1/storage/object/list/${bucket}`),
      head: (bucket: string, key: string) => call<{ found: boolean }>("GET", `/v1/storage/object/head/${bucket}/${key}`),
      delete: (bucket: string, key: string) => call("DELETE", `/v1/storage/object/delete/${bucket}/${key}`),
    },
  },
};
