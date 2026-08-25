# 👋 Well hello there , I'm Sebastian Valdemarsson

[![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5.svg?logo=linkedin&logoColor=white)](https://linkedin.com/in/sebastianvaldemarsson) [![Email](https://img.shields.io/badge/Email-D14836?logo=gmail&logoColor=white)](mailto:valdemarsson.sebastian@gmail.com) [![Cawa](https://img.shields.io/badge/Cawa-3FCF8E)](https://cawa.nu)

<img src="https://flagcdn.com/w20/se.png"/> Based in Kalmar, Sweden

Currently studying at **Medieinstitutet** to become a Fullstack Developer.

Alongside my studies I run **Calmar Webb AB**, where I single-handedly build and operate [**Cawa**](https://cawa.nu) - a social recipe platform shipped as both a web app and an Android app. I also hold a role as **Product Developer in the food industry**, currently on leave of absence to study.

Outside of work and school, I explore **Home Assistant**, automation, and modern web technologies.

When I'm not coding, I'm usually cooking, renovating, gaming, or spending time with my family.

#### Tech Stack

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Node.js](https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2306B6D4.svg?style=for-the-badge&logo=tailwindcss&logoColor=white)

#### Backend & Architecture

![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![REST API](https://img.shields.io/badge/REST-02569B?style=for-the-badge)
![API Integration](https://img.shields.io/badge/API%20Integration-009688?style=for-the-badge)
![Automation](https://img.shields.io/badge/Automation-FF6F00?style=for-the-badge)

#### Databases

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Database Design](https://img.shields.io/badge/Database%20Design-6A5ACD?style=for-the-badge)

#### Tooling & Deployment

![Git](https://img.shields.io/badge/git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white)
![NPM](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![PM2](https://img.shields.io/badge/PM2-2B037A?style=for-the-badge)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Google Play](https://img.shields.io/badge/Google%20Play-414141?style=for-the-badge&logo=googleplay&logoColor=white)
![Windows](https://img.shields.io/badge/windows%20server-0078D6?style=for-the-badge&logo=windows&logoColor=white)

#### Other Tools

![Home Assistant](https://img.shields.io/badge/home%20assistant-%2341BDF5.svg?style=for-the-badge&logo=home-assistant&logoColor=white)
![Adobe Photoshop](https://img.shields.io/badge/adobe%20photoshop-%2331A8FF.svg?style=for-the-badge&logo=adobe%20photoshop&logoColor=white)
![Trello](https://img.shields.io/badge/Trello-%23026AA7.svg?style=for-the-badge&logo=Trello&logoColor=white)

## Projects

### Development Projects

#### Cawa - Social Recipe Platform

My own SaaS product, built and operated through **Calmar Webb AB**. A social recipe platform where you create, organise, and share recipes with family and friends in a clean, ad-free environment - live in production with real users.

Tech Stack: React · TypeScript · Vite · Tailwind CSS · Supabase

- Solo Ownership: Product idea, architecture, development, launch, and day-to-day operations - all of it mine, alongside running the company.
- Social Layer: Accounts, friends, messaging, notifications, and reporting/moderation flows on top of the recipe engine.
- SEO-Indexed Recipes: Public recipe pages are served with per-recipe meta tags instead of a generic client-rendered shell, so individual recipes are indexable and shareable with proper preview cards.
- Cross-Platform Delivery: Ships as a web app and an Android app on Google Play from a single codebase.
- Defensive Runtime Check: An ES5 engine probe runs before the app bundle and shows a real explanation on outdated Android WebViews, instead of leaving users on a white screen.
- Theming Without FOUC: Light, dark, and system themes resolved before first paint, with system preference still driving `matchMedia` correctly.

[Visit Cawa](https://cawa.nu)

#### Home Assistant Simplified Panel (HASP)

A mobile-first, performance-driven dashboard built as a personal replacement for Home Assistant’s native UI. Designed to feel like a native app rather than a configuration layer, with a strong focus on real-time responsiveness, UX, and full creative control.

Tech Stack: TypeScript · Vite · Web Components · Home Assistant WebSocket API · Leaflet.js

- Replacing YAML with Code: Built to eliminate fragile Lovelace configs by creating a single TypeScript-driven source of truth for all UI logic and behavior.
- Optimistic UI: Sub-millisecond feedback for lights, toggles, and controls using client-side state prediction and debounced WebSocket sync.
- Device-Aware Experience: Detects the active device and user to dynamically adapt UI, greetings, tracking, and weather data.
- Location-Based Weather Engine: Fetches live GPS coordinates from the current device and pulls real-time forecasts from Open-Meteo with reverse geocoding.
- Advanced Navigation Handling: Custom history + sentinel system to fully control Android back-button behavior inside the Home Assistant Companion App WebView.
- Interactive Map System: Real-time person tracking with Leaflet maps, satellite imagery, zone overlays, and clustering.
- Custom UI Components: Fully bespoke controls (sliders, color pickers, popups) built with pointer events instead of native inputs for better mobile UX.
- Performance & Delivery: Automatic cache-busting system ensures fresh builds across WebView, iOS, and Android without manual cache clearing.

[View Repository](https://github.com/csschef/hasp)

#### OleaDB - Full-Stack Recipe Database

Self-hosted recipe management system running 24/7 on a Windows server.

**Tech Stack:** Node.js · Express · PostgreSQL · Vanilla JS · PM2

[View Repository](https://github.com/csschef/oleadb)
[Watch Demo](https://youtu.be/mswEZ2LkbjM)

---

## Currently Learning

**Ongoing**

- System Development

**Completed**

- Competence Portfolio & Sustainable Development
- JavaScript, HTML & CSS
- Database Technology
- DevOps & Testing
- Front-end Frameworks

**Upcoming**

- Third-party Integrations
- E-commerce Development
- Work Based Learning 1
- Final Project
- Work Based Learning 2
