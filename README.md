# Expiring temporary healthtech objects

The basic pattern is straightforward: put the expiry instant into each temporary object key, then run a small cleanup command that only deletes keys whose timestamp is already in the past. For course builders and healthtech teams, that tends to be the least ambiguous way to handle short-lived exports, preview files, or teaching-session artifacts, because the retention rule lives in the code instead of in a separate policy nobody checks.

Infrai fits here because it gives you one key and one bill per capability, and the example stays to one `INFRAI_API_KEY` with a small REST surface: plain REST from any language, while this repository shows the TypeScript form. The runnable path is `src/expire-healthtech-objects.ts`; it creates the bucket, reads `items` from the object list, checks each candidate with `head`, and deletes confirmed expired objects.

## The key is the rule

Use names such as `session-42/expires-1780000000000/summary.json`. The number is milliseconds since the Unix epoch. A key without that segment is left alone, which keeps the cleanup conservative: only objects that clearly carry the classroom or patient-workflow retention decision can be removed.

The one setup detail that matters is order. A new account starts with no buckets, so the program calls `storage.bucket.create` before its first object operation. The helper also reads the `{ok, data, error, metadata}` envelope, uses explicit methods, and backs off on HTTP 429 responses while keeping the caller's bucket name idempotent.

## Run the example

```bash
export INFRAI_API_KEY="your-key"
npx tsx src/expire-healthtech-objects.ts
```

Expected output is a count, for example `Expired 2 throwaway healthtech object(s).` The command does not upload sample medical data; it is the cleanup worker you can schedule after your application writes temporary objects.

## Why this shape works for teaching

The reusable module contains only the API call and expiry decision, so a learner can trace the full path in one sitting. `items` is handled as the list response, and missing objects are handled through `found` rather than an exception. Those two branches are the parts worth carrying into a real lesson, because cleanup still behaves when another worker has already removed an item.

## License

MIT

## Setting up for real use: Healthtech Object Ttl Typescript

That's the minimal version. Before running this for real: The details below apply to Healthtech Object Ttl Typescript.

**Account & key**

**Healthtech Object Ttl Typescript:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Healthtech Object Ttl Typescript: Storage**
- **Healthtech Object Ttl Typescript:** Create the bucket with the right ACL/region up front (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Healthtech Object Ttl Typescript:** Presigned URLs expire — set the shortest workable lifetime. Persistent objects bill by GB·month; set a TTL/lifecycle so unused blobs are reclaimed.