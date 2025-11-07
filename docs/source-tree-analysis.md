# Source Tree Analysis (Quick Scan)

```
Miners hub/
├── frontend/                  # Next.js app (React + TS)
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components.json        # shadcn/ui config (if used)
│   ├── eslint.config.mjs
│   ├── lib/
│   │   └── utils.ts
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── public/
│   ├── README.md
│   └── tsconfig.json
├── docs/
│   └── stories/
└── bmad/                      # BMAD rules and workflows
```

- Critical folders: `frontend/app`, `frontend/lib`
- Entry points: `frontend/app/layout.tsx`, `frontend/app/page.tsx`
- Build tooling: Next.js + PostCSS + ESLint

This tree is based on Quick Scan (no source file reading beyond manifests).

