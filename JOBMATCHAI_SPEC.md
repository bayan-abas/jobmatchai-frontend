# JobMatchAI — Complete Application Specification

Purpose of this document: an exact, factual description of the current production JobMatchAI frontend (React 19 + TypeScript + Vite + Tailwind CSS v4), for recreating it as closely as possible in the Base44 prototype. Nothing here is invented or idealized — every color, string, and behavior below is taken directly from the current source code. Where something is a known gap or inconsistency in the real app, it is called out explicitly rather than silently "fixed."

The app is a bilingual-plus (English/Arabic/Hebrew) AI recruitment platform with two user roles — **Candidate** and **Company** — sharing one codebase, one login, and one design language, but almost entirely separate page sets and navigation once logged in.

---

## Table of Contents

0. [Design System Foundation](#0-design-system-foundation)
1. [Landing Page](#1-landing-page)
2. [Authentication](#2-authentication)
3. [Navigation Shell (Sidebar / Mobile Nav / Layouts)](#3-navigation-shell)
4. [Candidate Dashboard](#4-candidate-dashboard)
5. [Company Dashboard](#5-company-dashboard)
6. [User Profile Pages](#6-user-profile-pages)
7. [Resume/CV Management & AI CV Analysis](#7-resumecv-management--ai-cv-analysis)
8. [Internal Jobs (Job Matches) & Public Jobs](#8-internal-jobs--public-jobs)
9. [External Jobs](#9-external-jobs)
10. [Job Details Page](#10-job-details-page)
11. [Match Score System](#11-match-score-system)
12. [AI Summary](#12-ai-summary)
13. [Saved Jobs (Favorites)](#13-saved-jobs-favorites)
14. [Recently Viewed Jobs](#14-recently-viewed-jobs)
15. [Notifications](#15-notifications)
16. [Applications Page (Candidate)](#16-applications-page-candidate)
17. [Company Job Management](#17-company-job-management)
18. [Candidate Management (Company Applications Review)](#18-candidate-management)
19. [Interview Invitations](#19-interview-invitations)
20. [Subscription / Payment Pages](#20-subscription--payment-pages)
21. [Settings (Password, Account Deletion)](#21-settings)
22. [Loading States](#22-loading-states)
23. [Empty States](#23-empty-states)
24. [Error States](#24-error-states)
25. [Success Messages / Toasts](#25-success-messages--toasts)
26. [Pagination](#26-pagination)
27. [Search, Filtering & Sorting](#27-search-filtering--sorting)
28. [Responsive Behavior](#28-responsive-behavior)
29. [All Dialogs, Modals, Confirmations & Popups](#29-all-dialogs-modals-confirmations--popups)
30. [Icons, Buttons, Cards, Badges, Progress Indicators, Statistics](#30-shared-ui-kit)
31. [Full Route Map](#31-full-route-map)
32. [Known Gaps / Inconsistencies in the Real App](#32-known-gaps--inconsistencies)

---

## 0. Design System Foundation

Tailwind CSS v4, CSS-native `@theme` config (no `tailwind.config.js`), defined in `src/index.css`.

### Colors
| Token | 300 | 400 | 500 | 600 | 700 |
|---|---|---|---|---|---|
| **brand** (purple/violet — primary identity) | `#b7a3ff` | `#9d7bff` | `#7f4cff` | `#6a35eb` | `#5726c2` |
| **accent** (cyan/blue) | `#7dd3fc` | `#38bdf8` | `#22d3ee` | `#0ea5c7` | — |
| **success** (green) | `#6ee7b7` | `#34d399` | `#22c55e` | `#16a34a` | — |
| **danger** (rose/red) | `#fda4af` | `#fb7185` | `#f43f5e` | `#e11d48` | — |
| **warning** (amber) | `#fcd34d` | `#fbbf24` | `#f59e0b` | `#d97706` | — |
| **info** (sky) | `#7dd3fc` | `#38bdf8` | `#0ea5e9` | — | — |
| **ink** (text, near-white→muted) | 100 `#ffffff` | 200 `#e2e6ff` | 300 `#c9d6ed` | 400 `#aeb4d6` | 500 `#9ca3c5` / 600 `#6b7495` |

- Base page background (`html, body, #root`): **`#0a0d2e`** — set globally so route-transition opacity fades never flash white.
- Most page bodies actually paint their own richer background over that base: `bg-[radial-gradient(circle_at_top_left,rgba(86,45,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(32,146,255,0.13),transparent_22%),linear-gradient(135deg,#0a0d2e_0%,#101548_45%,#181b58_100%)]` (dashboards/utility pages), or the auth-shell variant `linear-gradient(135deg,#17184a_0%,#1a1b56_40%,#17234f_100%)`, or the marketing variant `radial-gradient(circle_at_top,rgba(76,70,255,0.18),transparent_28%),linear-gradient(135deg,#090b3a_0%,#15145a_45%,#0f1f59_100%)` (Home/PublicJobs).
- Surfaces ("glass cards") are near-universally `bg-white/[0.03]` to `bg-white/[0.09]` with `border-white/10`, sometimes a solid tinted navy `rgba(44,45,95,0.85–0.96)`.

### Radii
- `rounded-control` = **14px** (inputs, small buttons, chips)
- `rounded-card` = **20px** (list items, compact cards)
- `rounded-panel` = **28px** (large surfaces, modals)
- Many hand-written values also appear directly (`rounded-[24px]`, `rounded-[30px]`, `rounded-[16px]`) predating/alongside the token system — treat 20–30px as the app's general "roundness" range.

### Shadows
- `shadow-elevated` = `0 18px 50px rgba(0,0,0,0.18)`
- `shadow-floating` = `0 24px 70px rgba(0,0,0,0.35)` (modals)
- `shadow-brand-glow` = `0 12px 30px rgba(127,76,255,0.28)` (primary buttons/brand icon tiles)

### Typography
- Font: **Inter** (`ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto` fallback stack).
- Headings run large and extrabold: page H1s are commonly 34–46px `font-extrabold` (scaling down on mobile, e.g. `text-[42px] max-[640px]:text-[28px]`); marketing H1 on HomePage reaches **92px**.
- Body copy: 14–17px, `leading-6` to `leading-8`, muted via `ink-400`/`text-white/50-70`.

### Motion
- Global: `MotionConfig reducedMotion="user"` wraps the whole app (respects OS-level reduced-motion automatically).
- Route transitions: 220ms fade+rise (`opacity 0→1, y 8→0`), `AnimatePresence mode="wait"`, ease `[0.16,1,0.3,1]`.
- Scroll-reveal (`Reveal` component): fade+slide-up on first viewport entry only (`viewport once:true`), 450ms, same ease.
- Standard modal entrance: scale 0.94→1 + slight y-shift, 220ms, same ease; backdrop fade 180ms.
- Score-ring count-up animation: 900ms, cubic ease-out `1-(1-t)³`.
- CSS-only `prefers-reduced-motion: reduce` backstop kills all `animate-*`/`transition-*` durations to 0.01ms **except** `animate-spin` (deliberately — freezing a loading spinner reads as "hung", not "reduced motion").

### Shared UI kit (`src/components/ui/`)
See [§30](#30-shared-ui-kit) for full detail on Button, Card, Badge, Skeleton, Toast, ConfirmDialog, EmptyState, Reveal, FormField, Input, ScoreRing, SearchableSelect.

### Language & RTL
Every page reads `useLanguage()` and computes `isRTL = language === "ar" || language === "he"`, applying `dir="rtl"`/`"ltr"` at the page root and mirroring: text alignment, flex-row-reverse on icon+label rows, and 180° icon rotation on directional arrows (back/chevron/external-link).

---

## 1. Landing Page

`src/pages/HomePage.tsx`, route `/`. Fully public, no auth required. Uses its own inline copy object (not `translations.ts`'s unused `homePage` namespace).

**Background:** marketing gradient (see §0) + two soft radial glows (violet top-left `rgba(115,73,255,0.18)`, blue bottom-right `rgba(0,153,255,0.16)`) + a faint 72×72px grid-line texture fading toward the bottom.

**Nav bar:** logo (cyan→violet gradient dot + "JobMatchAI" wordmark) · centered pill nav (Home / Jobs, hidden below 900px) · language switcher (עברית/العربية/GB English pills) · "Login" ghost button · "Get Started" primary button (smooth-scrolls to the Career CTA section).

**Hero section** (`min-h-[calc(100vh-96px)]`):
- Badge: "✧ AI-Powered Job Matching for the Israeli Market"
- H1 (92px): "Find Your Perfect Career" + gradient line "Match" (`from-[#b38cff] via-[#8e7dff] to-[#3ec9ff]`)
- Subtext: "Let AI analyze your skills and experience to connect you with opportunities that truly fit in the Israeli job market."
- Buttons: "Learn More" (gradient `from-[#38bdf8] via-[#4f8cff] to-[#6366f1]`, scrolls to About) / "Contact Us" (outline, opens contact modal)
- 4 stat cards (staggered reveal): **95% Match Accuracy · 10K+ Active Jobs · 50K+ Candidates · 500+ Companies**

**Features section:** heading "Powered by Artificial Intelligence" + 4-card grid: 🧠 AI-Powered Matching · 🎯 Smart Match Analysis · ⚡ Pre-Interview Module · 🛡️ Resume Scoring (each with a one-sentence description, see agent transcript for exact copy).

**About section:** "Built to improve the recruitment experience for everyone" + numbered 01/02/03 cards: For Candidates / For Companies / AI Assistance.

**How It Works section:** 4 numbered horizontal rows: Create an Account → Complete Your Profile → Receive Smart Matches → Connect and Move Forward.

**Career CTA banner:** "Ready to Transform Your Career?" + two buttons: "I'm a Candidate" (→ `/register/candidate`) / "I'm Hiring" (→ `/register/company`).

**No footer section exists** — the page ends at the CTA banner. **No testimonials.**

**Contact modal:** textarea + "Send Message"/"Close" — client-side only, shows a success toast, makes no backend call.

---

## 2. Authentication

All auth pages share one **split-panel shell**: `max-w-6xl` rounded-panel card, `lg:grid-cols-2` — left branding panel (hidden below `lg`, radial cyan/violet glows, headline + supporting card) and right form panel. Background: `linear-gradient(135deg,#17184a_0%,#1a1b56_40%,#17234f_100%)`.

### 2.1 Sign In — `LoginPage.tsx`, route `/login`
- Left: badge "Secure Access" · H1 "Welcome back to your smarter hiring space." · 3-row access card (Candidate dashboard access / Company dashboard access / Secure sign-in experience).
- Right: top bar with "Back" (→`/`) + language pills. Fields: **Email Address** (`Mail` icon), **Password** (`Lock` icon, eye-toggle). Row: "Remember me" checkbox + "Forgot password?" link. Submit: "Sign In"/"Signing in...". Below: "Create Candidate Account" / "Create Company Account" (2-up).
- Validation: only required-field checks (no format/length checks on login) — "Please enter your email." / "Please enter your password."
- Submit: `POST /api/users/login`; success → `login(token,user,rememberMe)` then routes by role to `/candidate-dashboard` or `/company-dashboard`.

### 2.2 Sign Up — Candidate — `CandidateRegisterPage.tsx`, routes `/register`, `/register/candidate`
- Left: badge "Candidate Portal" · H1 "Create your profile and discover smarter opportunities."
- Fields (2-col grid): Full Name, Email, Password, Confirm Password, Phone, **Location** (SearchableSelect, ~120 Israeli cities), **Current Title** (SearchableSelect, 48 fixed job titles), **Years of Experience** (SearchableSelect, 12 fixed buckets: "No experience" … "10+ years"), **Skills** (SearchableSelect + Add button + removable chips, ~100-item fixed skill list), **Summary** (textarea, optional — silently defaults server-side to "Passionate professional looking for great opportunities and continuous growth." if blank), **Upload Resume (Optional)** (dashed drop zone, `.pdf/.doc/.docx`).
- Validation order: required fields → email format → password ≥6 chars → password has letter+digit → confirm matches.
- Submit is **two-phase**: (1) `POST /api/auth/send-verification-code` → opens `EmailVerificationModal`; (2) on verified code: `POST /api/users/register` → `POST /api/users/login` → `login()` → `PUT /api/users/:id` (profile fields, best-effort) → optional `POST /api/cv/upload` (best-effort) → toast "Candidate account created successfully!" → navigate to `/candidate-dashboard` after 900ms.
- Bottom: "Already have an account?" (→`/login`) + "Switch to Company Registration" (→`/register/company`).

### 2.3 Sign Up — Company — `CompanyRegisterPage.tsx`, route `/register/company`
- Left: badge "Company Portal" · H1 "Create your company account and find the right talent faster."
- Fields (2-col grid): Company Name, Email, Password, Confirm Password, Phone, **Company Location** (plain text input, NOT searchable), **Industry** (native `&lt;select&gt;`, 20 fixed options), **Company Size** (native `&lt;select&gt;`, 6 fixed brackets), **Website** (optional), **About Company** (textarea, optional).
- Same validation order/pattern as candidate registration.
- Same two-phase verify→register→login→`PUT` profile flow; toast "Company account created successfully!" → `/company-dashboard`.
- Bottom: single "Already Have an Account? Sign In" line — no reverse "switch to candidate" shortcut.

### 2.4 Forgot Password — `ForgotPasswordPage.tsx`, route `/forgot-password`
- Left: badge "Secure Password Recovery" · H1 "We'll help you get back into your account."
- Single **Email Address** field → "Send Reset Link".
- `POST /api/auth/forgot-password`; deliberately **no user-enumeration signal** — success screen is identical whether or not the email exists: green checkmark, "Check Your Email", "If an account with that email exists, a password reset link has been sent. Check your inbox." + "Back to Login" button. (A `devResetLink` field, if present in the response, is only console-logged for dev convenience — no visible dev/prod UI difference.)

### 2.5 Reset Password — `ResetPasswordPage.tsx`, route `/reset-password?token=...`
- Left: H1 "Choose a new password."
- Fields: New Password, Confirm New Password → "Reset Password".
- Missing token → immediate toast "This reset link is invalid or has expired."
- Validation: ≥6 chars → letter+digit → match.
- `POST /api/auth/reset-password`. Success screen: green checkmark, "Password Updated", "Your password has been reset. You can now sign in with your new password." + "Sign In" button.
- **Note:** this page's copy is hardcoded English only — it does not localize to ar/he like every other auth page (a real gap in the current app, not a design intent).

### 2.6 Email Verification — `EmailVerificationModal.tsx` (shared by both register pages)
Modal, not a page. Header "Verify your email" + "We sent a 6-digit verification code to {email}". **Single text input** (not 6 separate boxes), numeric-only, max 6 chars, large centered tracked text, Enter submits. Error: "That code is incorrect or has expired. Please check and try again." Buttons: "Verify & Create Account" (disabled until 6 digits) / "Resend code" — cooldown **30 seconds**, label "Resend code (Ns)" during cooldown.

---

## 3. Navigation Shell

### 3.1 Desktop sidebar (`CandidateSidebar.tsx` / `CompanySidebar.tsx`)
Fixed, full-height, hidden below **980px**. Width animates 320px (expanded) ↔ 96px (collapsed), toggled via a `ChevronLeft` button in the header. Background `linear-gradient(180deg,#15184c_0%,#111444_60%,#0d1038_100%)`.

- **Header:** logo tile (46px, gradient `from-[#7c4dff] to-[#a855f7]`, `Sparkles` icon) + "JobMatch" wordmark + subtitle (hidden when collapsed).
- **Candidate nav items** (8): Dashboard, Job Matches, External Jobs, Favorites, Applications, My Profile, My Resume, Notifications.
- **Company nav items** (5): Dashboard, Job Postings, Applications, Company Profile, Notifications.
- Active item: animated shared-layout highlight pill (`layoutId`, spring transition) sliding between items; small brand-colored dot when expanded.
- Notifications item gets a red unread-count badge (shows number, or "9+" above 9).
- **Footer:** 3-way language switcher pill (עברית/العربية/English, company version appends "IL"/"IL"/"GB") + Logout button.

### 3.2 Mobile nav (`MobileNav.tsx`)
Bottom bar, visible only **below 980px**. 4 primary icons + "More" (5th). Candidate primary: Dashboard, Job Matches, Applications, My Profile. Candidate overflow (in "More" sheet): External Jobs, Favorites, My Resume, Notifications. Company primary: Dashboard, Job Postings, Applications, Company Profile. Company overflow: Notifications only.

"More" opens a spring-animated bottom sheet (slide up from `y:100%`) containing: overflow nav items, a divider, the language switcher, and Logout.

### 3.3 Page shell (`CandidateLayout.tsx` / `CompanyLayout.tsx`)
Fixed 78px header (`bg-[rgba(10,14,50,0.88)] backdrop-blur-[14px]`) containing: circular "back" button (candidate only, `navigate(-1)`) · circular notifications bell (with unread badge) · user/company info pill (avatar-initial circle + name + role label, hidden below 560px). Content offset by the sidebar's current width (margin, animates with collapse); collapses to 0 margin below 980px where `MobileNav` takes over. `AIChatButton` floats on top of everything regardless.

### 3.4 AI Chat button (`AIChatButton.tsx`)
Floating pill, bottom-right (bottom-left in RTL): circular `Bot` icon + "AI Assistant" / "Online now". Opens a 460×760px chat panel (near-fullscreen on mobile) with: header (title/subtitle + reset "New chat" + close), quick-prompt chips, message bubbles (user: gradient purple, right-aligned; AI: glass, left-aligned), typing indicator (3 bouncing dots), input bar with send button. Backend: `POST /api/chat` with `{message, history, language}`. Content and quick-prompts differ by role (candidate vs company) and language.

---

## 4. Candidate Dashboard

`CandidateDashboard.tsx`, route `/candidate-dashboard`. Loads fast, non-AI data first (`if (loading) return &lt;LoadingScreen message="Loading your dashboard..."/&gt;`), then streams AI match data in progressively — the whole page never blocks on AI computation finishing.

- Header: "Welcome, {name} 👋" + subtitle "Here's what's happening with your job search today."
- **4 stat tiles** (StatSkeleton while loading): Job Matches, Applications, Interviews, Profile Score. The "Job Matches" tile has its own dedicated AI-loading sub-state (spinner + "Finding your best job matches..." / "This may take a minute while our AI analyzes available jobs.") shown only for that one tile while match scores are still streaming, distinct from the page-level loading gate.
- **Top Job Matches** section: up to 3 highest-scoring jobs (internal+external combined pool), each with a `ScoreRing`, title/company/location, "Remote" badge if applicable. Empty: "No job matches yet."
- **Recently Viewed** section: horizontal scroll strip of the candidate's last-viewed jobs (arrow buttons scroll left/right, RTL-aware direction).
- **Applications** section: up to 3 most recent applications, each rendering immediately with `percent: null` (shows a pending ScoreRing state) and filling in progressively as match scores stream in — deliberately not blocking the whole dashboard render on this.
- **Profile completion box:** "Complete Your Profile" + progress text + "Upload Resume"/"Edit Profile" buttons.
- **Plan/usage box:** Free plan shows "{used} of {N} applications used" + "Upgrade to Premium" button; Premium shows "Unlimited applications" + "Manage Subscription".
- **Notifications preview** panel (small, "3 new" style counter + a few item previews) — separate from the full Notifications page.

---

## 5. Company Dashboard

`CompanyDashboard.tsx`, route `/company-dashboard`. Same fast-data-first / progressive-AI-fill pattern.

- Header: "Hello, {companyName} Team 👋" + today's hiring summary line (new applications count, candidates waiting for review, average AI match or "N/A").
- **4 stat tiles** (StatSkeleton while loading): Job Posts, Candidates, Applications, Avg Match Score.
- **Top Candidates** section: up to 3 highest match-scoring applicants across all the company's jobs, deduplicated by candidate email, each with initial-avatar, name, match badge.
- **Recent Job Posts** section + "View All Job Posts".
- **Recent Activity** section: latest applications, "View All Applications".
- **Quick Actions:** Post New Job, Review Applications, View Candidates, Manage Company Profile.
- **AI Hiring Insights:** up to 4 auto-generated insight lines (e.g. "Review {topCandidate} — AI Match Score {X}%.", "{job} position has the highest application rate.", "{N} candidates are strong matches...", "Average AI Match Score across candidates is {X}%.") — purely derived from already-loaded data client-side, not a separate AI call.

---

## 6. User Profile Pages

### 6.1 Candidate — `ProfilePage.tsx`, route `/profile`
- Header toggle: "Edit Profile" ↔ "Save Changes"/"Saving...".
- Plan panel: Free ("{used} of {N} applications used this month" + "Upgrade to Premium") or Premium ("Unlimited applications" + "Manage Subscription") — both navigate to `/payment`.
- Left card: initial-letter avatar (no photo upload), name, title, circular **profile completeness ring** (conic-gradient, 0–100%, 8 equally-weighted checks: name/phone/location/currentTitle/experience/summary/skills/hasResume).
- Right card — **Personal Information**: Full Name, Email (always read-only), Phone, Location (SearchableSelect), Current Title (SearchableSelect), Years of Experience (SearchableSelect, same 12-bucket list as registration), Professional Summary (textarea).
- **Skills** card: chip list with add/remove while editing.
- **Security** card → "Change Password" modal.
- **Danger Zone** card → "Delete My Account" modal.
- No explicit Cancel button while editing (only Save).

### 6.2 Company — `CompanyProfile.tsx`, route `/company-profile`
- Left card: 128px initial-avatar, Company Name + Industry (inline-editable), 3-stat row (Active Jobs / Total Applications / Avg Match Score).
- Right card — **Company Information** grid: Company Name, Industry, Company Size, Location, Website, Contact Email (read-only), LinkedIn (clickable link when not editing), GitHub (same), Founded (4-digit year), Company Type (`&lt;select&gt;`: Startup/Private Company/Enterprise/Non-profit).
- **About Company** — dashed empty-state box with "Add Description" CTA when blank.
- **Account Settings** → Change Password modal.
- **Danger Zone** → Delete Account modal (requires current password **and** typing "DELETE" to confirm).

---

## 7. Resume/CV Management & AI CV Analysis

`ResumeManager.tsx`, route `/resume-manager`.

- **No file yet:** big centered upload card, icon, "Upload Your Resume", "Choose File" button, caption "Supported formats: PDF, DOC, DOCX".
- **File exists:** card with `CheckCircle2` icon, "Resume Uploaded" + "Active File" pill, filename, and action buttons: **View CV** (opens in new tab via blob URL), **Analyze**, **Delete** (routed through the shared confirm dialog).
- **Analyzing (loading):** dedicated card, pulsing `Brain` icon, "Analyzing your CV...", a two-phase status line ("Reading CV structure..." → "Generating AI feedback and suggestions..."), gradient progress bar (20%→75%→100%).
- **Results:**
  1. Score-explanation banner (what the score means).
  2. `AiDisclaimer` strip.
  3. Score hero card: huge gradient "{score}%", AI summary paragraph, optional evaluation-reason italic line, "ATS Readiness: Strong/Good/Needs Improvement" pill (≥75/≥55/else), optional "Detected Field: {field}" pill.
  4. Strengths / Improvements 2-column cards.
  5. Missing-skills card (chip list), only if any exist.
- Uploading/deleting/re-analyzing all clear the app's match-score session cache immediately (so job-match percentages elsewhere refresh against the new CV).

---

## 8. Internal Jobs & Public Jobs

### 8.1 Job Matches — `JobMatches.tsx`, route `/job-matches` (candidate, authenticated)
- Filters: Industry, Seniority Level, Min Salary (slider, thousands), Min Match (slider), "Match You" toggle (splits results into Profession vs General/Vocational tabs when on).
- Each job card: `ScoreRing` + status-dependent label (loading / error+retry button / insufficientData / noScore / scored), title, company, location, salary, industry/type tags, Apply button.
- Match scores stream in progressively per visible page of results (not the whole unpaginated list at once) via SSE, backed by a session-scoped client cache keyed by (email, cvIdentity) so an already-scored job never re-triggers AI on revisit within the same tab session.
- A failed-to-compute card shows a **"Couldn't compute - tap to retry"** button (re-triggers just that batch, not a full page reload).
- URL-driven pagination (`?page=N`) — see [§26](#26-pagination).

### 8.2 Public Jobs — `PublicJobsPage.tsx`, route `/jobs` (no auth required)
Same visual family as Job Matches but **no match-score UI at all** (not computable without a logged-in candidate profile). Apply/View Details buttons both open an "Unlock the full JobMatchAI experience" login/register prompt modal instead of navigating anywhere. Filters: search, Location, Type (both dynamically populated from loaded data, not fixed lists); collapses into a bottom-sheet "Filters" drawer below `lg`.

---

## 9. External Jobs

`ExternalJobsPage.tsx` (+ `ExternalJobCard.tsx`), route `/external-jobs` (candidate, authenticated). Jobs imported from third-party providers (Jooble, JSearch, Jobicy) on a backend cron.

- Card layout (`ExternalJobCard.tsx`): `ScoreRing` (with status/error-retry same as Job Matches) · title/type badge · company · location/type/salary rows · description excerpt (3-line clamp) · skill chips · **only the "Posted {date}"** row (the original source's publish date) — the "Imported {date}" row that used to sit next to it has been removed app-wide; the underlying `importedAt` field is still used internally only to order the "Newest/Oldest" sort option, never displayed · footer: "External Job" badge, "Source: {name}", Apply Now (opens `applyUrl` in a new tab, with a disclaimer that applying happens on the original site), Save/Saved toggle.
- Filters mirror Job Matches (industry, seniority via job level inference, min salary, min match, Match-You toggle) plus a Region/City filter specific to this page and a sort order control (Best Match / Newest → Oldest / Oldest → Newest).
- Streaming match-score fetch here is a simpler, independent implementation (not the shared session-cache module Job Matches/Dashboard use) — it always clears and re-requests scores fresh whenever the visible job list or language changes, rather than reading from a persistent per-tab cache.

---

## 10. Job Details Page

`JobDetailsPage.tsx`, route `/job-details/:jobType/:jobId` (jobType = `internal`|`external`).

- Fetches `GET /api/jobs/:id` or `GET /api/external-jobs/:id` depending on type; shows a dedicated `jobDetails.loading` = "Loading job details..." message while fetching (previously incorrectly borrowed the External Jobs page's "Loading external jobs..." string regardless of job type — this has been fixed to always show the correct, job-type-neutral message).
- Sections: title/company/location/type/salary header, full description ("About the role" — external jobs may show an AI-generated structured summary instead of raw text; internal jobs always show the raw curated text), requirements, skills chips (clickable → `SkillExplanationModal`), match breakdown (field relevance / required skills / experience / education / certification / location components, each individually explorable), Apply button (opens `PreInterviewModal` → `ApplicationSuccessModal` for internal jobs; opens the external `applyUrl` directly for external jobs).
- Match status states: loggedOut, loading, noAnalysis, scored, noScore, error — each with its own ScoreRing label/messaging, consistent with the shared match-status vocabulary used across Job Matches/External Jobs.

---

## 11. Match Score System

Shared, single source of truth across the whole app — never independently re-implemented per page.

- **`getMatchTier(score)`** (`utils/matchScore.ts`): 85–100 🟢 emerald · 70–84 🟢 lime · 50–69 🟠 orange · 0–49 🔴 rose. Each tier defines text/border/bg/bar/ring colors.
- **`getMatchLabel(score)`**: ≥85 "Excellent Match" · ≥70 "Strong Match" · ≥50 "Moderate Match" · ≥30 "Weak Match" · else "Poor Match".
- **`ScoreRing`** component: animated SVG ring (not conic-gradient div), 900ms count-up, center fill `#252654`, `percent=null` → static gray ring with "—" (or a custom override label like "?"/"!"/empty-string-while-loading).
- Every consumer (Dashboard, Job Matches, External Jobs, Job Details, Applications, Company Applications, AI Summary modal) clamps the percent to 0–100 before ever rendering it as text — this is a hardened invariant (both in the shared `ScoreRing` component and defensively on the backend's `JobMatchScore` entity read path) specifically so a legacy or malformed value can never display as a negative or out-of-range number, even briefly.
- Backend persists one `JobMatchScore` row per (candidate, job), fingerprinted against both the candidate's current CV content and the job's current content — unchanged CV+job never re-triggers AI; only a genuinely new/changed CV, a new/changed job, or an explicit user-triggered recalculation causes new AI computation. Background computation runs through a persistent, rate-limited, retry-with-backoff queue, decoupled from any single page request's lifetime.

---

## 12. AI Summary

`CandidateAiSummaryModal.tsx` — opened from the **company** side (Company Applications) to view an AI-generated briefing on one candidate for one specific job.

Sections in order: `AiDisclaimer` · **AI Match Score** (tier-colored card, emoji + percent + label + progress bar) · Professional Background · Key Technical Skills (chips) · Years of Experience · Main Strengths · Potential Weaknesses / Missing Skills · **Overall Suitability** (visually distinct violet-tinted card). Loading: spinner + "Generating AI summary...". No-analysis state: "This candidate has not completed a CV analysis yet...". Results are cached client-side per (applicationId, language) so reopening is instant; switching language forces a fresh fetch.

---

## 13. Saved Jobs (Favorites)

`FavoritesPage.tsx`, route `/favorites`. Simpler/flatter card style than other job lists — **no score ring, no status badge**: just title + Internal/External type pill, company, location, formatted salary. "Remove" button optimistically removes the row immediately, then fires the delete request in the background (silently restores the row if that request fails, no error toast). Empty: "You haven't saved any jobs yet." Not-logged-in: "Log in to see your saved jobs."

---

## 14. Recently Viewed Jobs

Surfaced in two places: (1) a horizontal-scroll strip on the Candidate Dashboard (arrow-button scrolling, RTL-aware), and (2) tracked server-side via `POST /api/recently-viewed/track` fired whenever a candidate opens any Job Details page (internal or external), recording job id/type/title/company/location. There is no dedicated standalone "Recently Viewed" page/route — it only surfaces as the dashboard strip.

---

## 15. Notifications

Two parallel pages sharing the same interaction pattern (opening the page marks everything read immediately — no per-item read toggle), but different visual treatment.

### 15.1 Candidate — `NotificationsPage.tsx`, route `/notifications`
Cards with a type-colored icon tile (`JOB_MATCH_HIGH`→purple Briefcase, `APPLICATION_*`/`INTERVIEW_*`→emerald CheckCircle2, `COMPANY_MESSAGE`→cyan MessageSquare, `PREMIUM_ACTIVATED`→violet Crown, `PREMIUM_CANCELLED`→gray XCircle, `PREMIUM_PAYMENT_FAILED`→rose AlertTriangle, default→amber TrendingUp), unread = subtle ring highlight + "New" pill + glowing dot. Actions: "Mark all as read", "Clear all", per-item dismiss.

### 15.2 Company — `CompanyNotifications.tsx`, route `/company-notifications`
Grouped into **Today / Yesterday / Earlier** sections (empty buckets hidden). Type-colored gradient icon tiles: `APPLICATION_SUBMITTED`→cyan-blue UserPlus, `AI_ANALYSIS_COMPLETED`→fuchsia-purple Sparkles, `JOB_POSTED/UPDATED/DELETED`→violet-purple Briefcase, `APPLICATION_ACCEPTED/REJECTED/REMOVED`/`CANDIDATE_SHORTLISTED`/`INTERVIEW_*`→emerald-teal CheckCircle2, `COMPANY_MESSAGE`→cyan-blue MessageSquare, default→amber-orange TrendingUp. Empty state includes 3 explanatory hint rows (new application / AI analysis completed / status updated).

---

## 16. Applications Page (Candidate)

`Applications.tsx`, route `/applications`. List → detail (client-side toggle, no route change).

- **List:** filter tabs All / Active / Accepted; each card: ScoreRing (or "Pre-interview pending" pill), title + status badge, company/location/applied-date rows, contact-method row (if accepted) or rejection-reason row (if rejected, 2-line clamp), a 5-step progress-dot timeline, and a right-side score/pending box captioned "Interview Score".
- **Detail:** larger ScoreRing + match-reason text, Withdraw button (only while not yet viewed by the company — otherwise a muted explanatory line replaces it), a 5-stage visual timeline (Applied → AI Screening → Under Review → Shortlisted → Accepted/Rejected), a contact-info panel (emerald, only once accepted) or rejection-reason panel (rose, only once rejected, verbatim company text, never AI-rewritten).
- Status badge tones: accepted→success, rejected→danger, shortlisted→brand, under review→info, else→neutral.

---

## 17. Company Job Management

### 17.1 Job Postings list — `CompanyJobPostings.tsx`, route `/company-job-postings`
Cards: title + status badge (Active/Closed/Draft — in practice always "Active" today, since the backend never actually produces Closed/Draft), location/salary/posted-date meta, Applicants count + Avg Match Score stat block, "View Candidates" button (→ filtered Company Applications), kebab menu (View Details / Edit Job / Delete Job). Edit opens an inline modal (Title, Location, Employment Type, Salary, Description, Requirements, Skills). Delete routes through the shared confirm dialog.

### 17.2 Post Job — `PostJob.tsx`, route `/post-job`
Single scrolling form (not a wizard), two sections: **Basic Information** (Job Title, Description, Location + Remote-Work toggle switch) and **Requirements** (Seniority Level select, Employment Type select, Experience Min/Max, Salary Min/Max, Required Skills chip-input defaulting to "React"/"TypeScript"). Numeric fields block negative values at input time and validate max≥min before submit (both client-side and, redundantly, server-side). "Save as Draft" is a pure client-side stub (toast only, nothing persisted); "Post Job" submits for real.

### 17.3 Job Details (company view) — `CompanyJobDetailsPage.tsx`, route `/company-job-details/:jobId`
Read-only stats/detail view: header (title/status/meta), Applicants + Avg Match Score tiles, Description, Requirements/Experience Level (bulleted), Required Skills (chip grid). No edit control on this page itself — editing only happens via the Postings list's kebab menu.

---

## 18. Candidate Management

`CompanyApplications.tsx`, route `/company-applications` (optionally `?jobId=&jobTitle=` to scope to one posting). This is the company's main applicant-review surface, and the largest page in the app.

- **List view:** tabs All/New/Screening/Shortlisted/Decided (derived from raw status string); optional AI-Rank sort when job-scoped. Each card: initial-avatar, name + AI-Rank pill (job-scoped only) + match-tier badge + status badge, email, "Applied for {job} • {date}", ScoreRing + recommendation-label pill, action buttons View / AI Summary / Accept / Reject (Accept/Reject disabled once in a final state).
- **Detail view** (replaces list content, not a modal): header card (avatar, name, badges, job/email/date, action column: Contact Candidate / Schedule Interview / Download Resume); left column — Application Analysis (ScoreRing + AI hiring summary, "Generate AI Summary" CTA if none yet), color-coded Recommendation card (accept=emerald/consider=amber/reject=rose/none=neutral), Candidate Skills, Experience/Education (2-col), Languages; right column — Hiring Decision card (status + AI-recommended-action box + Accept/Reject/Keep Under Review/Shortlist 2×2 buttons — Accept/Reject open their own confirmation modals rather than applying immediately), a 5-step Progress stepper, Application Info key/value list, Pre-Interview Answers (if any), Contact-info-sent panel (accepted) / Rejection-reason-sent panel (rejected).
- **Accept flow** (`AcceptApplicationModal.tsx`): required contact-method picker (Phone call/Email/WhatsApp/LinkedIn/In-person meeting/Other + free-text if Other), optional message to candidate.
- **Reject flow** (`RejectApplicationModal.tsx`): **required** free-text rejection reason, explicitly disclosed to the candidate verbatim, never AI-generated or rewritten.
- **Contact Candidate modal** (separate, ad-hoc messaging, distinct from the Accept flow's contact-method capture): pre-filled textarea → `POST /api/messages`.

---

## 19. Interview Invitations

Embedded inside Company Applications' detail view — **"Schedule Interview" modal**: Date (native date input), Time (native time input), Interview Type (`&lt;select&gt;`: Online / In Person), Notes (textarea). Requires date+time. `POST /api/interviews`; success banner "Interview scheduled with {name}". There is no separate stand-alone "Interviews" page/route on either the candidate or company side — the candidate only ever sees the result of a scheduled interview reflected in their Applications timeline/notifications, not a dedicated interview-management UI.

---

## 20. Subscription / Payment Pages

### 20.1 `PaymentPage.tsx`, route `/payment`
**This is a fully simulated/demo checkout — no real Stripe account or payment processor is used.** Two-column layout: left checkout card (icon badge, "Upgrade to Premium" / "Get unlimited applications and unlock advanced AI-powered career tools", plan/price banner "$9.99 / per month", Payment Details form — Cardholder Name / Card Number (placeholder "4242 4242 4242 4242") / Expiry (MM/YY) / CVV — client-side format validation only, "Pay $9.99" button); right Order Summary sidebar (feature checklist: Unlimited job applications, AI CV analysis and scoring, Detailed AI match insights, Priority application status, Cancel anytime; Secure Checkout note; totals block).

Already-Premium state replaces this with a single centered card: "Premium Activated!", "Go to Dashboard" + "Cancel Premium" (danger button → confirm dialog "Cancel Premium subscription?" / "You'll lose Premium benefits immediately." → `POST /api/payments/demo/cancel-premium`).

Subscribing calls `POST /api/payments/demo/activate-premium` (no external gateway involved at all).

### 20.2 `PaymentSuccessPage.tsx` / `PaymentCancelPage.tsx`, routes `/payment/success`, `/payment/cancel`
Leftover routes from an earlier session-based (Stripe-style) checkout design that the demo flow no longer navigates to directly — still reachable if visited directly. Success: confirms a `session_id` query param server-side, shows "Premium Activated!" or an error state ("We couldn't confirm your payment" / "Missing payment session."). Cancel: static "Checkout cancelled" / "No charge was made. You can try again anytime."

---

## 21. Settings

There is no single dedicated "Settings" page/route — settings are distributed:
- **Change Password**: modal on both `ProfilePage.tsx` (candidate) and `CompanyProfile.tsx` (company) — current/new/confirm password fields, ≥6-char + letter+digit validation, success sub-state "Your password has been updated."
- **Delete Account**: modal on both profile pages — candidate version requires only a confirm click via the shared danger confirm dialog pattern described for other destructive actions; company version additionally requires entering the current password **and** typing the literal word "DELETE" before the button enables.
- **Language**: 3-way switcher present in every sidebar/mobile-nav/auth-page header (not a separate settings screen).
- **Logout**: sidebar/mobile-nav footer, not a settings page.

---

## 22. Loading States

- **Full-page:** `LoadingScreen` component — a 96px "rotating brain" indicator (conic-gradient spinning ring masked to a thin arc, centered pulsing `Brain` icon, small pulsing `Sparkles` badge top-right) + title + optional message, on the dashboard-style gradient background. Used by `ProtectedRoute` during auth rehydration and by the route-level `Suspense` fallback while a lazy page chunk downloads (same visual either way, so "loading" always looks identical regardless of cause).
- **Page-section:** `ListSkeleton`/`CardSkeleton`/`StatSkeleton` — shimmering (`animate-pulse`) placeholder shapes matching the real content's layout, never fake data.
- **Per-field/button:** `Button`'s `loading` prop swaps the leading icon for a spinning `Loader2` and disables the control.
- **Cold-start resilience:** initial-load network failures on the jobs/job-details pages now show a "Reconnecting to the server... this can take up to a minute after a period of inactivity." message and retry automatically with backoff, rather than a dead-end error requiring a manual page refresh.

---

## 23. Empty States

Shared `EmptyState` component (icon in a 64px tile, bold heading, optional description, optional action) used consistently for: no job matches yet, no applications yet, no saved jobs, no notifications, no CV uploaded, no candidates in a given tab, no skills added, zero search results. Copy is always specific to the context (never a generic "Nothing here").

---

## 24. Error States

- **Field-level:** red text + `AlertCircle` icon under the specific input (via `FormField`).
- **Page-level fetch failure:** rose-tinted banner/card (`border-red-400/20 bg-red-500/10`), plus — on the pages recently hardened against backend cold starts — a visible "Retry" button that re-runs just that fetch, instead of a dead end.
- **Toast-level:** red toast variant for background-action failures (e.g. withdraw application, save profile).
- **Match-score-specific:** a per-card "Couldn't compute - tap to retry" control rather than a static "please refresh the page" message.
- **404:** dedicated `NotFoundPage` — gradient "404", "Page Not Found", "Go to Home"/"Go Back" buttons, fully localized.

---

## 25. Success Messages / Toasts

Shared `ToastProvider`/`useToast()` — 4 variants (success/error/warning/info), each a distinct icon + tinted dark background, stacked top-center, auto-dismiss after 5000ms plus manual close. Used for: CV uploaded/analyzed/deleted, profile saved, job posted, application submitted, premium activated/cancelled, password changed, contact message sent, and every other non-navigating confirmation across the app — replacing the app's old native `alert()` calls entirely.

---

## 26. Pagination

Only **Job Matches** (`/job-matches`) implements true numbered pagination, driven by a `?page=N` URL query param (not local-only state) — this is deliberate so a candidate's browser back/forward and the scroll-restoration mechanism (§28) both work correctly per page. No other list in the app paginates: External Jobs, Public Jobs, Favorites, Applications, Notifications, Company Job Postings, and Company Applications all render their full filtered result set in one continuously-scrollable list (no "load more"/infinite-scroll mechanism exists anywhere either).

---

## 27. Search, Filtering & Sorting

- **Public Jobs:** search (title/company/skills substring) + Location/Type selects (options dynamically derived from currently-loaded data).
- **Job Matches / External Jobs:** Industry, Seniority Level, Min Salary slider, Min Match slider, "Match You" profession-vs-vocational toggle; External Jobs additionally has Region/City and a sort-order control (Best Match / Newest→Oldest / Oldest→Newest — "newest" is ordered by internal import timestamp, not the displayed Posted date).
- **Applications (candidate):** status filter tabs only (All/Active/Accepted).
- **Company Applications:** status filter tabs (All/New/Screening/Shortlisted/Decided) + AI-Rank-vs-Date sort (only shown when scoped to one job).
- No page in the app currently offers column-sortable tables (there are no literal HTML tables anywhere — every list is a stack of cards).

---

## 28. Responsive Behavior

Single consistent breakpoint: **980px**. Above it: full desktop sidebar (collapsible 320↔96px) + fixed header. At/below it: sidebar and its content-margin offset disappear entirely, replaced by the fixed bottom `MobileNav` bar (4 icons + "More" overflow sheet) with safe-area-inset padding for notched devices. The floating AI Chat button repositions above the mobile nav bar on small screens and expands to near-fullscreen when opened. Auth pages' left branding panel is hidden below Tailwind's `lg` breakpoint, collapsing to a single-column form-only layout. Scroll position (and, implicitly, "which job card you were looking at") is restored on browser back/forward navigation via a global `ScrollToTop` mechanism that re-applies the saved offset across animation frames until the returning page's content finishes loading in, rather than a single one-shot scroll attempt.

---

## 29. All Dialogs, Modals, Confirmations & Popups

Every modal in the app shares one visual recipe: full-screen `bg-black/60` (+ blur) backdrop that fades in 180ms, a scale+fade-in panel (0.94→1 scale, slight y-shift, 220ms, ease `[0.16,1,0.3,1]`), rounded 28-30px, dark navy/purple background, click-outside-to-dismiss (click inside the panel does not propagate to the backdrop).

Full inventory:
1. **Generic confirm dialog** (`ConfirmDialog.tsx` / `useConfirm()`) — reused for: CV delete, job delete, any other "are you sure" action app-wide. Danger or brand tone, 2-button footer.
2. **Email Verification** modal (§2.6).
3. **Change Password** modal (candidate + company profile pages).
4. **Delete Account** modal (candidate: simple confirm; company: password + type-"DELETE").
5. **Upgrade to Premium** modal (exists in `ProfilePage.tsx` code but currently has no way to be opened from the UI — a real, present-day dead code path, not a documentation simplification).
6. **CandidateAiSummaryModal** (§12).
7. **SkillExplanationModal** — "Why it matters" / "Where it's used" / "Recommended resources" / "Tips to learn it".
8. **PreInterviewModal** — 5 fixed free-text questions before applying (no skip button; Cancel or Submit are the only exits).
9. **ApplicationSuccessModal** — post-apply confirmation, "Keep Browsing" / "View My Applications".
10. **AcceptApplicationModal** / **RejectApplicationModal** (§18).
11. **Contact Candidate** modal + **Schedule Interview** modal (§18/§19).
12. **Edit Job** modal (Company Job Postings, §17.1).
13. **HomePage contact modal** (§1) — client-side only, no backend call.
14. **PublicJobsPage auth-prompt modal** — "Unlock the full JobMatchAI experience" login/register gate.
15. **PublicJobsPage mobile filter drawer** — spring bottom-sheet, not a centered modal.
16. **MobileNav "More" sheet** — spring bottom-sheet (§3.2).

---

## 30. Shared UI Kit

(`src/components/ui/`)

- **`Button`** — variants `primary` (violet gradient + glow), `secondary` (translucent outline), `ghost`, `danger` (rose gradient), `success` (green gradient); sizes `sm`/`md`/`lg` (38/44/52px min-height); `loading` prop → spinner + disabled; `active:scale-[0.97]` press feedback on every variant.
- **`Card`** — padding `none`/`sm`/`md`/`lg`; `interactive` variant adds hover-lift (`-translate-y-1`) + lighten + click-scale.
- **`Badge`** — tones `brand`/`success`/`danger`/`warning`/`info`/`neutral`, always icon+text (never color-only); `applicationStatusTone(status)` helper maps raw status strings to the right tone app-wide.
- **`ScoreRing`** — §11.
- **`Skeleton`/`CardSkeleton`/`ListSkeleton`/`StatSkeleton`** — §22.
- **`Toast`/`ToastProvider`/`useToast`** — §25.
- **`ConfirmDialog`/`ConfirmProvider`/`useConfirm`** — §29.
- **`EmptyState`** — §23.
- **`Reveal`** — scroll-triggered fade+slide-up, once per element.
- **`FormField`** — label + control + error/helper text.
- **`Input`** — leading icon slot, error border state, built-in password show/hide toggle.
- **`SearchableSelect`** — typeahead combobox (not a native `&lt;select&gt;`), keyboard nav, free-text-on-blur commit, used for Location/Current Title/Years of Experience/Skills wherever those appear.

**Statistics/numbers** are always presented either as a big bold number in a stat tile (Dashboard, Company Dashboard, Profile stats) or as a percentage inside a `ScoreRing` — never in a literal `&lt;table&gt;`. **Progress indicators**: the circular `ScoreRing`, the profile-completeness conic-gradient ring, the CV-analysis linear gradient progress bar, and the Applications/Company-Applications 5-step dot/icon timelines are the only progress-indicator patterns in the app.

---

## 31. Full Route Map

| Path | Page | Auth |
|---|---|---|
| `/` | HomePage | public |
| `/jobs` | PublicJobsPage | public |
| `/login` | LoginPage | public |
| `/forgot-password` | ForgotPasswordPage | public |
| `/reset-password` | ResetPasswordPage | public |
| `/register`, `/register/candidate` | CandidateRegisterPage | public |
| `/register/company` | CompanyRegisterPage | public |
| `/candidate-dashboard` | CandidateDashboard | candidate |
| `/job-matches` | JobMatches | candidate |
| `/external-jobs` | ExternalJobsPage | candidate |
| `/job-details/:jobType/:jobId` | JobDetailsPage | candidate |
| `/favorites` | FavoritesPage | candidate |
| `/applications` | Applications | candidate |
| `/profile` | ProfilePage | candidate |
| `/resume-manager` | ResumeManager | candidate |
| `/notifications` | NotificationsPage | candidate |
| `/payment`, `/payment/success`, `/payment/cancel` | Payment* | candidate |
| `/company-dashboard` | CompanyDashboard | company |
| `/company-job-postings` | CompanyJobPostings | company |
| `/company-job-details/:jobId` | CompanyJobDetailsPage | company |
| `/post-job` | PostJob | company |
| `/company-applications` | CompanyApplications | company |
| `/company-profile` | CompanyProfile | company |
| `/company-notifications` | CompanyNotifications | company |
| `/company-candidates` | → redirects to `/company-applications` | company |
| `*` | NotFoundPage | public |

Route transitions: 220ms fade+rise, `AnimatePresence mode="wait"`. Lazy-loaded per route (`React.lazy`); `Suspense` fallback is the same full-screen `LoadingScreen` used for auth rehydration.

---

## 32. Known Gaps / Inconsistencies

Documented honestly since the goal is an accurate reproduction, not an idealized one:

- `ResetPasswordPage.tsx` copy is hardcoded English only — does not localize to ar/he like every other auth page.
- `PaymentSuccessPage.tsx` references `t.paymentPage.successTitle`/`successText` translation keys that do not exist in the English translations block — these render as `undefined` in production today.
- `ProfilePage.tsx`'s "Upgrade to Premium" modal exists fully coded but has no button anywhere in the current render tree that opens it — effectively unreachable dead code.
- `CompanyApplications.tsx`'s detail view renders several hardcoded English fallback strings (e.g. "Keep Under Review", "Shortlist", "Strong Candidate", "Awaiting Analysis") because the corresponding translation keys were never added to `translations.ts` — these do not localize either.
- `CompanyJobPostings.tsx` job status can theoretically be Active/Closed/Draft, but the current data-mapping always hardcodes "Active" — Closed/Draft are unreachable in practice today.
- `Applications.tsx` computes pre-interview score/strength/text fields but never actually renders them anywhere in its JSX.
- "Save as Draft" on `PostJob.tsx` is a pure UI stub — it shows a success toast but never persists anything.
- The Payment flow is a **fully simulated demo** — no real Stripe account, no real charge, ever.
