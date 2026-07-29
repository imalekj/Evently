# Evently

A full-stack platform for advertising, publishing, searching, and booking/buying tickets for events. Supports both Arabic and English (RTL/LTR).

## Tech Stack

- **Backend**: ASP.NET Core 10 Web API + Entity Framework Core + PostgreSQL + JWT Auth + Stripe
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + react-i18next

## Features

- User registration / login (JWT)
- Publish a new event (title, description, category, location, dates, price, ticket count, image)
- Edit and delete only the events you published (enforced at the API level)
- Full search and filtering (free text, category, location, date range, price range, sorting)
- Instant booking for free events, and Stripe Checkout payment for paid events (test mode)
- Cancel a booking, with tickets automatically returned to inventory
- "My Events" page to manage your published events, and "My Tickets" page for your bookings
- Admin dashboard: overall stats, and management of all events/users/bookings
- Instant switch between Arabic and English, with automatic RTL/LTR layout change

## Running Locally

### Requirements
- .NET SDK 10
- Node.js 20+
- PostgreSQL (tested on PostgreSQL 17)
- A free Stripe account (test mode) if you want real payment checkout enabled

### 1) Backend

```bash
cd server/Evently.Api
```

Create an `appsettings.Development.json` file (this file is excluded from git via `.gitignore` to protect your secrets) with the following shape:

```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=evently;Username=postgres;Password=YOUR_PASSWORD"
  },
  "Jwt": {
    "Key": "REPLACE_WITH_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS",
    "Issuer": "EventlyApi",
    "Audience": "EventlyClient",
    "ExpiryMinutes": "1440"
  },
  "Stripe": {
    "SecretKey": "sk_test_...",
    "PublishableKey": "pk_test_...",
    "ClientUrl": "http://localhost:5173"
  }
}
```

Stripe test keys are free from [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys). If left empty, the site still works normally — only checkout for paid events will be disabled.

Then run:

```bash
dotnet ef database update
dotnet run --launch-profile http
```

On first run, an admin account (`admin@evently.com` / `Admin@123`) and 20 demo events are seeded automatically. The API runs on `http://localhost:5292` by default, with Swagger docs available at `/swagger` in development.

### 2) Frontend

```bash
cd client
npm install
npm run dev
```

The site runs on `http://localhost:5173`.

> If you run the API on a different port, update `VITE_API_URL` in a `.env` file inside the `client` folder, or change the default value in `src/lib/api.ts`.

## Security Notes Before Deploying to Production

- Change `Jwt:Key` to a new secret and never share it, and replace the Stripe test keys with real production keys via environment variables or a secret manager (never inside any appsettings file that gets pushed anywhere).
- Change the default admin account password immediately after first login.
- Enable HTTPS and restrict CORS to your actual production domain instead of `localhost`.
