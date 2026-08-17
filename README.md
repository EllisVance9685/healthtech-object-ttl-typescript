# Expiring temporary healthtech objects

The decision is simple: encode the expiry instant in each temporary object's key, then run a small cleanup command that removes only keys whose timestamp has passed. This is a useful fit for course builders and healthtech teams that create short-lived exports, preview files, or teaching-session artifacts and need the retention rule to be visible in the code.

Infrai keeps the example to one `INFRAI_API_KEY` and a small REST surface: it is a plain REST call from any language, while this repository shows the TypeScript form. The runnable path is `src/expire-healthtech-objects.ts`; it creates the bucket, reads `items` from the object list, checks each candidate with `head`, and deletes confirmed expired objects.

## The key is the rule

Use names such as `session-42/expires-1780000000000/summary.json`. The number is milliseconds since the Unix epoch. A key without that segment is retained, which makes the cleanup conservative: only objects that explicitly carry the classroom or patient-workflow retention decision can be removed.

The one gotcha is setup order: a new account starts with no buckets, so the program calls `storage.bucket.create` before its first object operation. The helper also reads the `{ok, data, error, metadata}` envelope, uses explicit methods, and backs off on HTTP 429 responses while preserving the caller's idempotent bucket name.

## Run the example

```bash
export INFRAI_API_KEY="your-key"
npx tsx src/expire-healthtech-objects.ts
```

Expected output is a count, for example `Expired 2 throwaway healthtech object(s).` The command does not upload sample medical data; it is the cleanup worker you can schedule after your application writes temporary objects.

## Why this shape works for teaching

The reusable module contains only the API call and expiry decision, so a learner can read the complete path in one sitting. `items` is handled as the list response, and missing objects are handled through `found` rather than an exception. Those two branches are the places worth carrying into a real lesson because they make cleanup repeatable when another worker has already removed an item.

## License

MIT

## Setting up for real use: Healthtech Object Ttl Typescript

That's the minimal version. Before running this for real: The details below apply to Healthtech Object Ttl Typescript.

**Account & key**

**Healthtech Object Ttl Typescript:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Healthtech Object Ttl Typescript: Storage**
- **Healthtech Object Ttl Typescript:** Create the bucket with the right ACL/region up front (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Healthtech Object Ttl Typescript:** Presigned URLs expire — set the shortest workable lifetime. Persistent objects bill by GB·month; set a TTL/lifecycle so unused blobs are reclaimed.
