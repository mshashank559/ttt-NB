# Phase 1: Candidate SAGA Escalation Workflow & Identity Privacy Audit Report

**Date of Audit:** October 22, 2026  
**Repository:** NetBounce Tech Team Tracker (`mshashank559/ttt-NB`)  
**Scope:** Candidate SAGA Low-Rating Escalation Workflow, 24-Hour SLA Timer, TSM Feedback Access, and Code-Name/Real-Name Privacy Policies.

---

## 1. Executive Summary

As part of Phase 1 of the Antigravity Master Plan, an exhaustive code and architecture audit was conducted across the frontend (`src/`), backend (`server.js`), data models (`MongoDB Atlas`), and storage layers (`localStorage`). 

This audit reveals the exact current behavior of the low-rating escalation logic, identifies critical gaps in SLA enforcement and duplicate handling, assesses Tech Support Manager (TSM) visibility limitations, and outlines the precise changes required for Phase 2 implementation.

---

## 2. Forensic Audit of the Existing Escalation Logic

### 2.1 Exact Low-Rating Trigger Condition
* **Actual Condition:** The escalation is triggered when a candidate submits an overall rating of **3.0 stars or below** (`rating <= 3`).
* **Source Evidence:**
  * `server.js` (lines 554-555):
    ```javascript
    const cRating = feedback.candidateFeedback?.performanceRating || feedback.candidateFeedback?.experienceRating;
    if (cRating && Number(cRating) <= 3) { ... }
    ```
  * `server.js` (line 607):
    ```javascript
    if (ratingNum <= 3) { ... }
    ```
  * `src/context/AppContext.js` (lines 731-732 & 761-762):
    ```javascript
    const rating = Number(feedbackData.performanceRating) || Number(feedbackData.experienceRating) || 5;
    if (rating <= 3) { ... }
    ```
  * `src/pages/FeedbackPage.js` (lines 208-211):
    ```javascript
    if (statusFilter === 'sla_escalated') {
      const rating = Number(item.candidateFeedback?.performanceRating || item.candidateFeedback?.experienceRating || 0);
      if (!item.candidateFeedback?.submitted || rating === 0 || rating > 3) return false;
    }
    ```
* **Evaluation:** Ratings of 1, 2, and 3 stars qualify for escalation. Ratings of 3.5, 4, 4.5, and 5 stars do not trigger escalation. This matches the target business rule.

---

### 2.2 Current Escalation Recipients & Selection Rules
* **Configured Recipients:**
  * In `server.js` (lines 567-568, 621-622):
    ```javascript
    responsibleTsm: 'Shashank Mishra',
    responsibleTsmId: 'u-shashank-01'
    ```
  * The recipient is currently **hardcoded** to `Shashank Mishra (u-shashank-01)` regardless of which TSE or team conducted the interview.
* **Role Visibility Analysis:**
  * **Upper Management & Management:** Can view the SLA Escalation Tickets table and KPI badge on the Executive Dashboard (`src/pages/Dashboard.js` lines 693–750).
  * **TSM (Tech Support Manager):** If logged in, can view the tickets on the dashboard and in the Feedback Page filter.
  * **Marketing TL & Marketing SR:** **Do NOT** receive SLA tickets and **cannot view** the SLA escalation table (enforced via role guards).
  * **TSE (Tech Support Engineer):** **Does NOT** receive the ticket or toast alert.
* **Selection Rule Defect:** The ticket is not dynamically assigned to the specific TSM responsible for the assigned TSE.

---

### 2.3 Current Notification Channels
* **In-App Toast:** A system-level error toast is fired in the client via Sonner (`src/context/AppContext.js` line 641):
  ```javascript
  toast.error(`⚠️ Low Rating Escalation: SLA Ticket ${newTicket.ticketNumber} created for TSM review.`);
  ```
* **Dashboard Table:** Displayed in a dedicated section on the Executive / Management / TSM Dashboard titled `"SLA Escalation Tickets (Candidate Feedback ≤ 3 Stars)"`.
* **Database Record:** Persisted in MongoDB Atlas (`/api/sla-tickets` collection) and synchronized via `ttt_sla_tickets` in `localStorage`.
* **Email / Push Notifications:** **No external email or webhook delivery is currently wired up.** All notifications are in-app UI alerts and database records.

---

### 2.4 Current SLA Duration & Configuration Source
* **Configured Duration:** **Indeterminate / Missing Deadline.**
  * In `server.js` (`SlaTicketSchema`, lines 125–141), tickets only record `createdAt` and `status: { type: String, default: 'Open' }`.
  * **There is no `deadline` or `slaHours` field on the ticket schema**, nor is there any 24-hour / 48-hour calculation being performed in the current backend code.
  * In previous documentation and notes, a 48-hour resolution window was assumed, but no backend logic actively computes or enforces it.
* **Status Transitions:** Tickets remain in status `'Open'` indefinitely until a manager opens the modal and changes the status to `'In Review'` or `'Resolved'`.

---

### 2.5 Timer Start Event & Deadline Calculation
* **Timer Start Event:** Triggered at the exact moment the candidate submits the low rating via `app.put('/api/feedbacks/:id/candidate')` or `app.post('/api/feedbacks')`.
* **Timestamp Used:** In `AppContext.js`, it uses `new Date().toISOString()`; in MongoDB, it uses the server document `createdAt` timestamp.
* **Gap Identified:** No `deadline` field (`createdAt + 24 hours`) is calculated or stored. There is no automated overdue checker.

---

### 2.6 Escalation Stages & Reminder Behavior
* **Immediate Stage:**
  1. Low rating submitted (<= 3 stars).
  2. SLA ticket created with status `'Open'`.
  3. Toast alert fired on client.
  4. Ticket appears in the Dashboard SLA table with an `'Open'` badge.
* **Subsequent Stages:** **Missing.**
  * There are no automated scheduled jobs or background cron tasks to send timed reminders at 12 hours, 20 hours, or escalate to `'Overdue'` at 24 hours.

---

### 2.7 Duplicate Escalation Risk Analysis
* **Risk in `app.put('/api/feedbacks/:id/candidate')`:** **Protected.**
  * Checks `const existingTicket = await SlaTicket.findOne({ interviewId: req.params.id })`.
* **Risk in `app.post('/api/feedbacks')`:** **Vulnerable.**
  * Does NOT check for an existing ticket before inserting. Repeated POST calls create duplicate tickets for the same feedback.
* **Client-Side Storage:** Checks `prev.some(t => t.id === id || t.interviewId === newTicket.interviewId)` to avoid duplicate state items.

---

### 2.8 Cross-Module Inconsistencies
* **Candidate SAGA:** Computes `performanceRating` from text ratings (`excellent` = 5.0, `very_good` = 4.5, `good` = 4.0, `average` = 3.0, `needs_improvement` = 2.0). Both 3.0 and 2.0 trigger the low-rating escalation.
* **Feedback Module (`FeedbackPage.js`):**
  * Declares `const [activeCandidateFeedback, setActiveCandidateFeedback] = useState(null)`, but **never renders a modal or drawer for it**. Clicking on candidate rows does not show the submitted Candidate SAGA feedback form.
  * Line 96 defines `const canViewRealName = ['upper_management', 'management'].includes(currentRole);` which **excludes `tsm`**, preventing TSMs from seeing real names even though the policy permits it!
* **Identity Privacy (`mockData.js`):**
  * `sanitizeForIdentityPrivacy` correctly replaces real names with IDs for Marketing roles, but frontend components in some pages still have partial real-name leaks if not thoroughly sanitized.

---

## 3. Phase 1 Audit Summary Matrix

| Audit Item | Current System Status | Planned Phase 2 Fix |
|---|---|---|
| **Trigger Condition** | `rating <= 3` stars | Preserve exactly as-is (`rating <= 3`). |
| **Escalation SLA** | No deadline computed; legacy 48h assumption | Set authoritative **24-hour SLA** (`createdAt + 24 hours`). |
| **Overdue Detection** | None (stays `'Open'` indefinitely) | Add live overdue calculation & badge (`Overdue` if > 24 hours elapsed without resolution). |
| **Escalation Recipients** | Hardcoded to `Shashank Mishra` | Dynamically resolve assigned TSM based on TSE/team assignment. |
| **Duplicate Prevention** | Incomplete in `app.post('/api/feedbacks')` | Add idempotent unique check on `interviewId` across all endpoints. |
| **TSM Feedback Access** | Only summary/ratings visible; modal missing | Implement full field-by-field Candidate SAGA drawer/modal with questions, ratings, comments, and SLA status. |
| **Code Name / Real Name (Mgmt/TSM)** | TSM currently excluded from real names in `FeedbackPage.js` | Enforce Code Name first, Real Name underneath for Upper Mgmt, Management, and TSM. |
| **Code Name Only (Marketing TL/SR)** | Partially masked in UI; needs server-side boundary | Strictly enforce Code Name only (`TSE-XXX`); never expose real names in UI or payloads. |

---

## 4. Specific Files to be Modified in Phase 2

1. **`server.js`:**
   - Add `deadline` (server `createdAt + 24 hours`) and `slaHours: 24` to `SlaTicketSchema`.
   - Prevent duplicate tickets in `app.post('/api/feedbacks')`.
   - Dynamically resolve `responsibleTsm` from TSE user profile / team assignment.
   - Add endpoint or computed property for overdue ticket status.

2. **`src/context/AppContext.js`:**
   - Update `addSlaTicket` to enforce 24-hour SLA deadline calculation.
   - Add overdue ticket check and notification logic.
   - Ensure TSM data scoping allows complete access to their team's feedback.

3. **`src/pages/FeedbackPage.js`:**
   - Include `tsm` in `canViewRealName` so TSM can view Code Name + Real Name.
   - Implement the complete Candidate SAGA feedback detail modal / drawer (`activeCandidateFeedback`).
   - Highlight <= 3 star feedbacks with active SLA countdown and Overdue alert.
   - Add filters for Date, TSE, Rating, and SLA Escalation status.

4. **`src/pages/Dashboard.js`:**
   - Update SLA tickets table with `Deadline (24h SLA)` and live countdown / overdue badge.
   - Display Code Name + Real Name format for Management and TSM viewers.

5. **`src/data/mockData.js`:**
   - Standardize Code Name + Real Name helper format (`Code Name` above `Real Name`).
   - Validate and maintain team scoping for TSM and identity privacy for Marketing roles.
