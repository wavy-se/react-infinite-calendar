# CLAUDE.md

## Systemarkitektur

Systemkartan finns i [`wavy-se/architecture`](https://github.com/wavy-se/architecture) (`docs/components/react-infinite-calendar.md`). Den avgör vad som ska byggas var; läs `docs/placement-guide.md` innan du placerar ny funktionalitet.

- **Roll**: Wavys fork av datepickern, används av `wavy-se/business`. Kanonisk gren är `WIP/desktopFlag`.
- **Regel**: patcha i `dist/` (commonjs **och** es6 i synk). `dist/` är handpatchad före `src/`, så bygg inte om från `src` utan att portera ändringarna.
- **Efter ny commit**: pinna commit-sha i business `app/package.json` (inte grennamnet) och uppdatera `from`/`version` i `package-lock.json`.
- **Obs**: `wavy` använder upstream-paketet, inte denna fork.
