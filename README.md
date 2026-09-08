<div align="center">

<img src="https://optimus.openng.org/large-icon.svg" alt="Optimus UI" width="140" />

# Optimus UI

**A community-maintained, MIT licensed suite of 80+ accessible Angular UI components.**

[![npm](https://img.shields.io/npm/v/@openng/optimus-ui.svg?color=%23000)](https://www.npmjs.com/package/@openng/optimus-ui)
[![license](https://img.shields.io/badge/license-MIT-black.svg)](LICENSE.md)
[![angular](https://img.shields.io/badge/angular-%3E%3D21-black.svg)](https://angular.dev)

[Documentation](https://optimus.openng.org) · [Getting started](https://optimus.openng.org/installation) · [Migrating from PrimeNG](https://v1.optimus.openng.org/migration/primeng) · [Philosophy](https://optimus.openng.org/philosophy) · [FAQ](https://optimus.openng.org/faq)

</div>

---

## Why this exists

In June 2026 PrimeTek archived the PrimeNG repository and moved future major versions, starting with v22, to a commercial license — [their announcement explains why](https://primeui.dev/nextchapter). That left a lot of applications on a library with no further open source releases.

Optimus UI is a community fork of PrimeNG v21, the last MIT licensed version, maintained by OpenNG and the community. It stays MIT. There is no paid tier and none is planned.

It is not affiliated with, endorsed by, or sponsored by PrimeTek. The [philosophy page](https://optimus.openng.org/philosophy) sets out what the project commits to and — just as importantly — what it does not do.

## Quick start

```bash
ng add @openng/optimus-ui
```

The schematic asks which theme preset you want, adds the packages, wires `provideOptimus` into your root providers and installs everything.

```ts
import { Button } from '@openng/optimus-ui/button';
```

```html
<p-button label="Check" />
```

Full setup, including the manual path and icons, is in the [getting started guide](https://optimus.openng.org/installation).

## Migrating from PrimeNG

`ng add` does not migrate an existing workspace. It sets up new projects only, and when it detects a `primeng` dependency it leaves your code untouched and fails with an error pointing you here rather than reporting success. Use the `migrate-from-primeng` schematic instead: install the package so the Angular CLI can resolve it, then run the schematic. Packages are swapped, imports are rewritten, and you get a report of anything it could not handle automatically, with file and line numbers.

```bash
npm install @openng/optimus-ui@1
ng generate @openng/optimus-ui@1:migrate-from-primeng
```

See the [migration guide](https://v1.optimus.openng.org/migration/primeng) for prerequisites and the manual cases. If you are on PrimeNG v20 or older, upgrade to v21 first.

## Packages

| Package | What it is |
| --- | --- |
| [`@openng/optimus-ui`](packages/optimus-ui) | The components, directives and services. The only package most applications install directly. |
| [`@openng/optimus-ui-themes`](packages/optimus-ui-themes) | Built-in theme presets — Aura, Material, Lara and Nora. |
| [`@openng/optimus-ui-styled`](packages/optimus-ui-styled) | The styled-mode theming engine that turns presets into CSS variables. |
| [`@openng/optimus-ui-styles`](packages/optimus-ui-styles) | Base styles shared by the components. |
| [`@openng/optimus-ui-tailwindcss`](packages/optimus-ui-tailwindcss) | Tailwind CSS plugin, for both v3 and v4. |
| [`@openng/optimus-ui-locale`](packages/optimus-ui-locale) | i18n locale definitions. |
| [`@openng/optimus-ui-motion`](packages/optimus-ui-motion) | Animation and transition utilities. |
| [`@openng/optimus-ui-utils`](packages/optimus-ui-utils) | Shared helpers used across the packages. |

Icons live in [`@openng/icons`](https://www.npmjs.com/package/@openng/icons) and are optional — components accept any icon through templating, but the documentation examples use the `pi pi-*` classes.

## Requirements

- Angular v21 or newer
- RxJS v7.8.1 or newer

## Contributing

Issue triage, reproductions, pull requests and documentation fixes are all welcome — and if you had a pull request open on `primefaces/primeng` that never landed, [CONTRIBUTING.md](CONTRIBUTING.md) shows how to bring it across with its history intact.

```bash
pnpm install     # dependencies + git hooks
pnpm run dev     # run the documentation site locally
```

The [contribution guide](https://optimus.openng.org/contribution) covers the workflow, and the [roadmap](https://optimus.openng.org/roadmap) covers what is planned.

## Support

Community only — there is no SLA and no commercial support. [Issues](https://github.com/openng-org/optimus-ui/issues) for bugs, [Discussions](https://github.com/openng-org/optimus-ui/discussions) for questions.

## License

[MIT](LICENSE.md). Forked from PrimeNG v21, which was published under the same license, with the original copyright notices intact. PrimeNG, PrimeFaces, PrimeReact, PrimeVue and PrimeFlex are trademarks of PrimeTek.
