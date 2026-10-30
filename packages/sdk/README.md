# @rejisterjack/pennant

Server-side TypeScript client for a [Pennant](https://github.com/rejisterjack/pennant) feature-flag service.

```ts
import { Pennant } from "@rejisterjack/pennant";

const pennant = new Pennant({
  baseUrl: process.env.PENNANT_URL!,
  apiKey: process.env.PENNANT_API_KEY!,
});

await pennant.isEnabled("new-checkout", userId);
```

Do not put the API key in browser code. A failed request throws unless you pass `defaultValue`. `cacheTtlMs` defaults to `0`, so each check reads the current flag from your Pennant server.
