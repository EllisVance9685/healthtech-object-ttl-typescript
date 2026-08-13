import { infrai } from "./infrai";

const BUCKET = "healthtech-throwaway";

function expiryFromKey(key: string): number | undefined {
  const match = key.match(/expires-(\d{13})/);
  return match ? Number(match[1]) : undefined;
}

export async function expireThrowawayObjects(now = Date.now()): Promise<string[]> {
  await infrai.storage.bucket.create(BUCKET);
  const { items } = await infrai.storage.object.list(BUCKET);
  const removed: string[] = [];
  for (const item of items) {
    const expiresAt = expiryFromKey(item.key);
    if (expiresAt === undefined || expiresAt > now) continue;
    const { found } = await infrai.storage.object.head(BUCKET, item.key);
    if (!found) continue;
    await infrai.storage.object.delete(BUCKET, item.key);
    removed.push(item.key);
  }
  return removed;
}

async function main(): Promise<void> {
  const removed = await expireThrowawayObjects();
  console.log(`Expired ${removed.length} throwaway healthtech object(s).`);
}

void main();
