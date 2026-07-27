---
name: Orval generated hook queryKey requirement
description: Generated React Query hooks in lib/api-client-react require queryKey in the query option object.
---

When using the Orval-generated hooks from `lib/api-client-react/src/generated/api.ts`, the `query` option object must include `queryKey`.

Example:

```ts
import { useGetCart, getGetCartQueryKey } from "@workspace/api-client-react";

const { data: cart } = useGetCart({
  query: { queryKey: getGetCartQueryKey(), enabled: true }
});
```

**Why:** The generated hook signatures type `options.query` as `UseQueryOptions<T, TError, TData>` with a required fourth generic parameter, making `queryKey` a required field. Omitting it raises `TS2741: Property 'queryKey' is missing`.

**How to apply:** Always import the matching `getGetXxxQueryKey` helper and pass it in the `query` object. For hooks that take path parameters, include the same ID in the query key, e.g. `getGetProductQueryKey(id)` for `useGetProduct(id, { query: { queryKey: getGetProductQueryKey(id), enabled: !!id } })`.
