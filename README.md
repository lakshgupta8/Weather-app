# Weather App

A modern, full-stack weather application built with React 19 and Express. Features real-time weather data, 5-day forecasts, city comparison, and a beautiful responsive UI with dark mode support.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=flat-square&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=flat-square&logo=vite)
![Bun](https://img.shields.io/badge/Bun-Runtime-000000?style=flat-square&logo=bun)

## Features

- **Real-Time Weather** - Current conditions for any city worldwide
- **5-Day Forecast** - Daily temperature trends with visual charts
- **City Comparison** - Compare weather between two cities side-by-side
- **Geolocation** - Auto-detect and display your local weather
- **Dark Mode** - System-aware theme with manual toggle
- **Unit Toggle** - Switch between Celsius/Fahrenheit and m/s/mph
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Performance** - Code splitting, lazy loading, and memoization
- **Rate Limiting** - Backend protection against API abuse

## Tech Stack

### Frontend

- **React 19** - UI library with hooks and context
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **React Router v7** - Client-side routing
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **Vite** - Next-gen build tool

### Backend

- **Express 5** - Web framework
- **Node Cache** - In-memory caching (10 min TTL)
- **Express Rate Limit** - Request throttling
- **Axios** - HTTP client

### Runtime & Tooling

- **Bun** - JavaScript runtime & package manager
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+) or Node.js (v18+)
- OpenWeatherMap API Key ([Get one free](https://openweathermap.org/api))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/lakshgupta8/weather-app.git
   cd weather-app
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API key:

   ```
   OPENWEATHER_API_KEY=your_api_key_here
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. **Start the development servers**

   Terminal 1 - Backend:

   ```bash
   bun server
   ```

   Terminal 2 - Frontend:

   ```bash
   bun run dev
   ```

5. **Open the app**
   Navigate to `http://localhost:5173`

## Project Structure

```
src/
├── backend/
│   └── server.ts          # Express API server
├── frontend/
│   ├── components/        # Reusable UI components
│   │   ├── CitySearch.tsx
│   │   ├── GlobalErrorBoundary.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── TemperatureChart.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── UnitToggle.tsx
│   │   └── WeatherIcon.tsx
│   ├── context/           # React Context providers
│   │   ├── LocationContext.tsx
│   │   ├── SettingsContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── WeatherContext.tsx
│   ├── domains/
│   │   └── weather/
│   │       └── hooks/
│   │           └── useWeather.ts
│   ├── layouts/
│   │   └── MainLayout.tsx
│   ├── pages/
│   │   ├── AboutPage.tsx
│   │   ├── ComparisonPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── SearchPage.tsx
│   │   └── WeatherDetailsPage.tsx
│   ├── api.ts             # API client functions
│   ├── types.ts           # TypeScript interfaces
│   ├── App.tsx            # Root component
│   └── main.tsx           # Entry point
└── index.css              # Global styles
```

## API Endpoints

| Endpoint                                | Method | Description             |
| --------------------------------------- | ------ | ----------------------- |
| `/health`                               | GET    | Server health check     |
| `/weather/city?city={name}`             | GET    | Current weather by city |
| `/weather/location?lat={lat}&lon={lon}` | GET    | Weather by coordinates  |
| `/weather/forecast?city={name}`         | GET    | 5-day forecast          |

## Screenshots

> Add screenshots here to showcase the app:
>
> - Home page with location weather
> - Search results
> - City comparison view
> - Dark mode theme

## Available Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `bun run dev`     | Start Vite dev server    |
| `bun server`      | Start Express backend    |
| `bun run build`   | Build for production     |
| `bun run preview` | Preview production build |
| `bun run lint`    | Run ESLint               |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons by [Lucide](https://lucide.dev/)
