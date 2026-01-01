# 🌸 Terriva by SkyBee

**Terriva** is a privacy-first, data-driven **Progressive Web App (PWA)** for menstrual cycle tracking.
It helps users log periods and daily flow, predicts upcoming cycles, provides health insights, and sends automated reminders.

---

## ✨ Features

* 🩸 **Period Tracking** — Log start & end dates of cycles
* 📊 **Daily Flow Logging** — Track flow intensity (0–3 scale)
* 🔮 **Cycle Predictions** — Predict next period using historical averages
* 📈 **Insights & Analytics**

  * Average cycle length
  * Regularity score
  * Current cycle phase
* 📬 **Automated Email Reminders**

  * Sent **2 days before** predicted periods
* 📉 **Visual Charts**

  * Monthly flow & period trends
* 📱 **Progressive Web App**

  * Installable on mobile & desktop
* 🔐 **Privacy-First**

  * Auth-protected APIs
  * User-isolated data
  * No third-party analytics

---

## 🧠 Tech Stack

| Category        | Technology                      |
| --------------- | ------------------------------- |
| Framework       | Next.js 16 (App Router)         |
| UI              | React 19, Tailwind CSS          |
| Auth            | NextAuth (Email + Google OAuth) |
| Database        | PostgreSQL                      |
| ORM             | Prisma                          |
| Charts          | Chart.js + react-chartjs-2      |
| Animations      | Framer Motion                   |
| PWA             | next-pwa + Workbox              |
| Emails          | Nodemailer                      |
| Dates           | date-fns                        |
| Package Manager | Bun                             |

---

## 🏗️ Architecture Overview

Terriva follows a **layered full-stack architecture**:

```
Browser (PWA)
 ├── Landing Page
 ├── Dashboard
 └── Insights
        ↓
Next.js API Routes
 ├── Auth
 ├── Periods
 ├── Daily Flow
 └── Insights
        ↓
Business Logic Layer
 └── Cycle Calculations & Predictions
        ↓
Prisma ORM
        ↓
PostgreSQL Database
```

---

## 🔐 Authentication & Security

* Email Magic Link (10-minute expiry)
* Google OAuth 2.0
* Session persistence via Prisma Adapter
* All API routes protected
* Row-level user data isolation
* Cascade deletes on account removal (GDPR-friendly)

---

## 🗄️ Database Models

Core tables:

* **User**
* **Period**
* **DailyFlow**
* **CycleInsight**

Each record is strictly tied to the authenticated user.

---

## 📊 Core Business Logic

* **Cycle length** calculated from historical periods
* **Next period prediction** based on rolling averages
* **Regularity score** to detect irregular cycles
* **Health warnings** for abnormal patterns
* Logic lives in:

```
lib/cycleInsights.ts
```

---

## 📬 Email Reminder System

* Daily cron job
* Sends reminder **2 days before** predicted period
* User-controlled notification preferences
* Idempotent delivery (no duplicates)

---

## 📱 Progressive Web App (PWA)

* Install prompt on supported browsers
* Service worker powered by Workbox
* Manifest with app icons & theme colors

---

## 🚀 Getting Started

### 1️⃣ Clone the repo

```bash
git clone https://github.com/Shivamkhator/terriva.git
cd terriva
```

### 2️⃣ Install dependencies

```bash
bun install
```

### 3️⃣ Environment variables

Create `.env`:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
EMAIL_SERVER=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 4️⃣ Prisma setup

```bash
bun prisma migrate dev
bun prisma generate
```

### 5️⃣ Run locally

```bash
bun dev
```

---

## 📂 Project Structure

```
app/
 ├── (site)/        # Landing page
 ├── dashboard/     # Period & flow tracking
 ├── insights/      # Charts & predictions
 ├── api/           # Backend routes
 └── layout.tsx     # Root layout & providers

lib/
 ├── prisma.ts
 └── cycleInsights.ts
```

---

## 🧑‍💻 Author

Full-Stack Developer
GitHub: [@Shivamkhator](https://github.com/Shivamkhator)

---

## 📄 License

MIT License — free to use, modify, and distribute.

---
