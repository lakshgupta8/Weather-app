# HorizonHue

A premium, full-stack weather intelligence application built with **React 19** and **Express 5**. Designed for visual excellence, performance, and a seamless user experience.

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=for-the-badge&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite)
![Bun](https://img.shields.io/badge/Bun-Runtime-000000?style=for-the-badge&logo=bun)

---

## Features

### Smart Autocomplete Search

- **Real-Time City Suggestions:** Typing just a few characters (e.g., "Del") triggers a debounced (600ms) geocoding search.
- **Global Coverage:** Matches cities worldwide with detailed State and Country labels.
- **Visual Feedback:** Integrated loading spinners and "No Results" states for a polished feel.

### Premium Visual Design

- **System-Aware Dark Mode:** Beautiful dark theme that respects your OS settings with a manual override.
- **Responsive Excellence:** Optimized layouts from mobile handsets to ultra-wide monitors.

### Performance & Intelligence

- **Dual-Layer Caching:**
  - **Weather Data:** 10-minute TTL for real-time accuracy.
  - **City Searches:** 24-hour TTL for lightning-fast autocomplete responses.
  - Cached responses live in memory and, when deployed on Netlify, in [Netlify Blobs](https://docs.netlify.com/blobs/overview/) so every function instance shares them across cold starts.
- **Geolocation Auto-Detection:** Instantly identifies your city and fetches local weather on boot.
- **Rate Limiting:** Backend protection ensures stability and prevents API abuse.

### Data Visualization

- **Hourly & 5-Day Forecasts:** The next 24 hours in 3-hour steps, plus a daily high/low trend chart drawn with plain SVG (no charting library).
- **Unit Control:** Seamlessly toggle between Metric (°C, m/s) and Imperial (°F, mph) systems.
- **City Comparison:** Side-by-side weather analytics to compare two locations instantly. The comparison lives in the URL (`/compare?a=London&b=Paris`) so it can be shared.
- **Condition-Aware Colours:** Cards take on a palette that matches the conditions and time of day.

---

## Tech Stack

### Frontend

- **React 19** (Core Library)
- **TypeScript 5.9** (Type Safety)
- **Tailwind CSS v4** (Modern Styling)
- **React Router v7** (Dynamic Navigation)
- **Lucide React** (Premium Iconography)
- **Vite 7.3** (Lightning Fast Build Tool)

### Backend

- **Express 5** (Flexible Web Framework)
- **Node Cache + Netlify Blobs** (Two-layer response cache)
- **Express Rate Limit** (Security & Throttling)
- **Axios** (Robust HTTP Client)

### Runtime & Tooling

- **Bun** (Next-gen JavaScript Runtime)
- **ESLint** (Code Quality)
- **Vitest + Testing Library** (Unit and component tests)
- **GitHub Actions** (Lint, typecheck, test and build on every push and pull request)

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+) or Node.js (v18+)
- OpenWeatherMap API Key ([Get one free](https://openweathermap.org/api))

### Installation

1. **Clone & Enter**

   ```bash
   git clone https://github.com/lakshgupta8/weather-app.git
   cd weather-app
   ```

2. **Install Dependencies**

   ```bash
   bun install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   # Add your OPENWEATHER_API_KEY
   ```

4. **Launch Application**

   ```bash
   # Terminal 1: Backend
   bun server

   # Terminal 2: Frontend
   bun run dev
   ```

---

## 📂 Project Architecture

```bash
src/
├── backend/
│   └── server.ts          # Express API server (Caching, Geocoding, Proxy)
├── frontend/
│   ├── components/        # CitySearch (with Autocomplete), Charts, UI Atoms
│   ├── context/           # Weather, Location, Theme & Settings State
│   ├── hooks/             # useDebounce, useWeather, useGeolocation
│   ├── pages/             # Home, Search, Comparison, Details
│   ├── api.ts             # Typed API Client
│   └── types.ts           # Global Interface Definitions
```

---

## 🛡️ API Protection

| Limit Type        | Threshold     | Window     |
| :---------------- | :------------ | :--------- |
| Global Rate Limit | 100 requests  | 15 Minutes |
| Weather Cache     | 600 seconds   | Per Query  |
| Search Cache      | 86400 seconds | Per Query  |

---

## API Endpoints

| Endpoint                                | Method | Description             |
| --------------------------------------- | ------ | ----------------------- |
| `/health`                               | GET    | Server health check, including which cache backend is active |
| `/weather/search/cities?q={text}`       | GET    | City autocomplete suggestions (name, state, country, lat, lon) |
| `/weather/city?city={name}`             | GET    | Current weather by city |
| `/weather/location?lat={lat}&lon={lon}` | GET    | Weather by coordinates  |
| `/weather/forecast?city={name}`         | GET    | `{ timezone, daily[5], hourly[8] }` forecast by city |
| `/weather/forecast?lat={lat}&lon={lon}` | GET    | Same forecast by coordinates |

---

## License

Available under the [MIT License](LICENSE).

## Acknowledgments

- Weather Data: [OpenWeatherMap](https://openweathermap.org/)
