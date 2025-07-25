
# 📊 TezX DevTools

> Developer-friendly diagnostics and inspector panel for TezX-based applications. Plug in to see routes, middlewares, env variables, cookies, and add your own custom debug tabs.

---

## ✅ Installation

```bash
npm install @tezx/devtools
```

Ensure you also have:

```bash
npm install tezx
```

---

## 🚀 Quick Usage

In your TezX app entry (e.g., `server.ts` or `index.ts`):

```ts
import { TezX } from "tezx";
import {nodeAdapter} from "tezx/node";
import DevTools from "@tezx/devtools";

const app = new TezX();

app.get(
  "/devtools",
  DevTools(app, {
    // Optional
    // disableTabs: ['cookies', 'routes'],
    // extraTabs: (ctx) => [ ... ]
  })
);

nodeAdapter(app).listen(3000);
```

Now visit:
**`http://localhost:3000/devtools`**
to see a real-time diagnostic dashboard.

---

## 🧩 Built-in Tabs

| Tab           | Description                                              |
| ------------- | -------------------------------------------------------- |
| `routes`      | Lists all loaded routes with method, path, and source    |
| `middlewares` | Displays registered middleware and which routes use them |
| `cookies`     | Shows request cookies (parsed from `ctx`)                |
| `.env`        | Displays environment variables loaded via `.env`         |

---

## ⚙️ API: `DevTools(app, options)`

```ts
DevTools(app: TezX<any>, options?: Options): Callback
```

### Options

| Option        | Type                                                      | Description             |
| ------------- | --------------------------------------------------------- | ----------------------- |
| `extraTabs`   | `(ctx) => TabType \| Promise<TabType>`                    | Add your own tab panels |
| `disableTabs` | `Array<'cookies' \| 'routes' \| '.env' \| 'middlewares'>` | Hide built-in tabs      |

---

## 🛠️ Add Custom Tabs

You can inject your own debug panels using the `extraTabs` option.

```ts
import DevTools , { dumpMiddlewares } from "@tezx/devtools";

app.get(
  "/devtools",
  DevTools(app, {
    extraTabs(ctx) {
      const rows = dumpMiddlewares(app)
        .map(r => `<tr><td>${r.endpoint}</td><td>${r.pattern}</td><td>${r.appliedMiddlewares}</td></tr>`)
        .join("");
      return [
        {
          tab: "middlewares",
          label: "Middleware Table",
          doc_title: "Middleware Overview",
          content: `<table>${rows}</table>`
        }
      ];
    }
  })
);
```

---

## 📚 Types

```ts
type Tab = "cookies" | "routes" | ".env" | "middlewares";

type TabType = {
  doc_title: string;
  label: string;
  tab: Tab | string;
  content: string; // Rendered HTML content
}[];

type Options = {
  extraTabs?: (ctx: Context) => Promise<TabType> | TabType;
  disableTabs?: Tab[];
};
```

---

## 📁 Directory Example

**Using `tezx/router`**

```bash
my-app/
├── routes/
│   ├── _middleware.ts
│   └── ...
├── public/
│   └── ...
├── tezx.config.mjs             ← setup TezX + DevTools here
├── .env
├── package.json
└── tsconfig.json
```

---
