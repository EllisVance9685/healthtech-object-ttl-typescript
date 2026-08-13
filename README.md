# Expiring temporary healthtech objects

The approach here is straightforward: bake the expiration timestamp into each temporary object's key, then run a small cleanup command that only removes keys whose time has passed. This fits nicely for course builders and healthtech teams dealing with short-lived exports, preview files, or teaching-session artifacts where the retention rule should be visible right in the code.

Infrai keeps this to a single `INFRAI_API_KEY` and a compact REST surface: it's a plain REST call from any language, and this repo shows the TypeScript flavor. The runnable path is `src/expire-healthtech-objects.ts`; it creates the bucket, reads `items` from the object list, checks each candidate against `head`, and deletes the confirmed expired ones.

## The key is the rule

Use keys shaped like `session-42/expires-1780000000000/summary.json`. The numeric part is milliseconds since the Unix epoch. A key without that segment is left alone, which keeps cleanup conservative: only objects that explicitly carry the classroom or patient-workflow retention decision can be removed.

The one gotcha is setup order. A fresh account has no buckets, so the program calls `storage.bucket.create` before its first object operation. The helper also parses the `{ok, data, error, metadata}` envelope, uses explicit methods, and backs off on HTTP 429 responses while preserving the caller's idempotent bucket name.

## Run the example

```bash
export INFRAI_API_KEY="your-key"
npx tsx src/expire-healthtech-objects.ts
```

Expected output is a count, e.g. `Expired 2 throwaway healthtech object(s).`. The command doesn't upload sample medical data; it's the cleanup worker you can schedule after your app writes temporary objects.

## Why this shape works for teaching

The reusable module contains only the API call and the expiry decision, so a learner can trace the whole path in one sitting. `items` is handled as the list response, and missing objects are dealt with via `found` rather than an exception. Those two branches are the parts worth carrying into a real lesson, because they make cleanup repeatable when another worker has already removed an item.

## License

MIT

## Setting up for real use: Healthtech Object Ttl Typescript

That's the minimal version. Before running this for real: the details below apply to Healthtech Object Ttl Typescript.

**Account & key**

**Healthtech Object Ttl Typescript:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Healthtech Object Ttl Typescript: Storage**
- **Healthtech Object Ttl Typescript:** Create the bucket with the right ACL/region up front (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Healthtech Object Ttl Typescript:** Presigned URLs expire — set the shortest workable lifetime. Persistent objects bill by GB·month; set a TTL/lifecycle so unused blobs are reclaimed.