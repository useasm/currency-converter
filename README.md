# Currency Converter

A small web app for converting currencies with live exchange rates. Made as a university project.
Built with React, TypeScript, Vite and Tailwind CSS.

## Features

- Currency conversion with up-to-date rates
- Light / dark theme, remembered between visits
- Last used amount and currencies are saved in local storage
- Swap currencies in one click, click the result to copy it
- Works on desktop and mobile
<img width="2010" height="1212" alt="1" src="https://github.com/user-attachments/assets/f3b4b32d-0ba1-40b1-9372-a9903228ad94" />

## Exchange rates

- [Frankfurter](https://frankfurter.dev/) (European Central Bank data) for most currencies
- [ExchangeRate-API](https://www.exchangerate-api.com/docs/free) for RUB and UAH, which the ECB doesn't publish

## Tech stack

| Category | Technology |
|----------|------------|
| Framework | [React](https://react.dev/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Design | [Figma](https://www.figma.com) |
| Build tool | [Vite](https://vitejs.dev/) |
| Data fetching | [TanStack Query](https://tanstack.com/query/latest) |
| Icons | [Lucide](https://lucide.dev/), [React Icons](https://react-icons.github.io/react-icons/) |

## Running locally

```bash
git clone https://github.com/useasm/currency-converter.git
cd currency-converter
pnpm install
pnpm dev
```

Then open http://localhost:5173.
