<div align="center">

# ⚽ FanFare

### The AI matchday companion for the FIFA World Cup 2026

*Helping 5 million fans find their seat, 
staff speak 8 languages, and organizers make the right call — in real time.*

<br>

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-2.5-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

---

## 🌍 What is this, in plain English?

A World Cup match is a small city that appears for four hours and then vanishes. **Eighty thousand people**, speaking dozens of languages, all arriving at once, all needing something — a seat, a toilet, a train home, a doctor.

Today they get printed signs and a stretched-thin steward.

**FanFare gives everyone in that stadium an assistant that actually knows what's happening right now.**

| If you're a… | FanFare tells you… |
|---|---|
| 🎟️ **Fan** | Which gate is quickest *this minute*, how to get home, what you need to know — **in your own language** |
| 🦺 **Staff / Volunteer** | What a fan is saying when you don't share a language, and how to log an incident in seconds |
| 📋 **Organizer** | Where the crowd is building, what's about to go wrong, and what to do about it |

It isn't a chatbot bolted onto a map. Every answer is **grounded in live data** — the real fixture, the real weather, the real gate queues — and the AI is explicitly forbidden from inventing the rest.

---

## ✨ The nine AI features

FanFare has **nine Generative AI surfaces**, each powered by Google Gemini.

### 🎟️ For fans

| Feature | What it does |
|---|---|
| **Matchday Concierge** | Ask anything — by voice or text, in **8 languages** — and it answers in yours, using your real ticket and live gate queues. |
| **Access Plan** | Tell it what you need (step-free routes, quiet spaces, visual support) and it writes you a personal plan for the day. |
| **Departure Advisor** | Reads the final whistle, the weather and the crowd, then tells you the best way and time to leave. |

### 🦺 For staff and volunteers

| Feature | What it does |
|---|---|
| **Live Interpreter** | A fan speaks; the AI translates both ways. No shared language required. |
| **Incident Intake** | Describe a problem in normal words. The AI turns it into a structured, triaged, routed report. |

### 📋 For organizers

| Feature | What it does |
|---|---|
| **Operations Copilot** | "Gate C is backing up — what do I do?" It answers using the live crowd feed. |
| **Auto Briefings** | Turns hours of live operational data into a briefing you can read in a minute. |
| **Analytics Narrator** | Explains what the numbers actually *mean*, in prose, not dashboards. |
| **Carbon Footprint** | Calculates the match's real travel emissions and models how to cut them. |

---

## 🔒 Our honesty rule

> **Nothing modelled is ever presented as measured.**

Most hackathon demos quietly fake their data. We decided not to, because a stadium assistant that confidently misdirects someone in a crowd is worse than one that admits it doesn't know.

**✅ Genuinely real**
- Live World Cup fixtures and scores — the venue is *never hardcoded*; the app reads the real feed to learn where the match is
- Real weather at that stadium (Open-Meteo) and real coordinates (OpenStreetMap)
- Real carbon factors — published DEFRA/BEIS emissions data, applied to real distances
- Live currency rates, team crests, and maps

**⚠️ Simulated — and labelled as such, on screen**
- Crowd density and gate queues. No public sensor feed exists, and the AI needs *something* to reason over. So it's simulated — and every screen showing it wears a **`SIMULATED FEED`** badge.

**🚫 What the AI will never do**
- Invent a gate, a seat, a policy, or a room. We don't have stadium floor plans — no one publishes them — so the concierge gives honest general guidance and points you to a steward, rather than confidently sending you the wrong way.

---

## 🚀 Run it yourself

**You'll need:** [Node.js](https://nodejs.org) 18+ and a free [Google Gemini API key](https://aistudio.google.com/apikey).

```bash
# 1. Install
npm install

# 2. Go
npm run dev
```

**To switch the AI on**, create a file called `.env.local` in the project root containing your key:

```bash
GEMINI_API_KEY=paste_your_key_here
```

`.env.local` is gitignored, so your key can never be committed by accident.

Open the printed `localhost` URL. That's it.

> 💡 **No key?** The app still runs — every AI panel will simply say *"assistant not configured"* rather than pretending. Nothing breaks.

### Other commands

```bash
npm run build      # production build → dist/
npm run preview    # preview that build locally
```

---

## ☁️ Deploying to Vercel

1. Import this repo at [vercel.com/new](https://vercel.com/new) — the framework auto-detects as **Vite**.
2. Add **one** environment variable:

   | Name | Value |
   |---|---|
   | `GEMINI_API_KEY` | your Gemini key |

3. Deploy.

> ⚠️ **Do not** name it `VITE_GEMINI_API_KEY`. The `VITE_` prefix would ship your secret key to every visitor's browser. FanFare deliberately routes all AI calls through a serverless function ([`api/ai.js`](api/ai.js)) so **the key never leaves the server**.

---

## 🧱 How it's built

**React 18** + **Vite** on the front. **Google Gemini 2.5 Flash** for the AI, behind a serverless proxy. **Leaflet** for maps. No backend, no database — state lives in React and `localStorage`.

```
├── api/ai.js              ← serverless AI proxy (your key lives here, server-side only)
│
└── src/
    ├── App.jsx            state + routing for every screen
    ├── data.js            copy, palette, role config
    │
    ├── lib/
    │   ├── ai.js          the Gemini client
    │   ├── venue.js       resolves the REAL stadium from the live fixture feed
    │   ├── carbon.js      published DEFRA emissions factors
    │   ├── freeApis.js    weather · translation · FX · team crests
    │   └── simFeed.js     the simulated crowd feed (always badged on screen)
    │
    └── components/
        ├── landing/       marketing site
        └── dashboard/
            ├── fan/       concierge · access plan · transport · map
            ├── staff/     interpreter · incidents · tasks · zones
            └── organizer/ copilot · briefings · analytics · heatmap · sustainability
```

---

<div align="center">

**Built for the FIFA World Cup 2026.**

<sub>FanFare is an independent concept platform.<br>
Not affiliated with FIFA or any official tournament, federation or governing body.</sub>

</div>
