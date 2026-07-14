# LocalNest — Home Page Backend Design Document (v2 — Revised)

**Status:** Proposal — awaiting approval. No SQL/migrations have been written yet.
**Supersedes:** v1 (§10 decisions below resolve v1's four open questions).
**Scope:** Same as v1 — remaining Home sections — now updated with full business unification, a normalized Let's Play model, the `activities`→`notifications` rename, and a reusable feed aggregation layer for Happening Around.

---

## Changelog from v1

| Decision | v1 | v2 |
|---|---|---|
| Business unification | Flagged, deferred | **Proceeding now** — full `businesses` canonical table |
| Let's Play data | jsonb Option A/B | **Normalized relational model** — `sports`, `venue_sports`, `venue_slots` |
| `activities` rename | Flagged, deferred | **Proceeding now** — renamed to `notifications` |
| Happening Around | Events-only (+optional community_posts) | **Multi-source ranked feed** via a new `feed_items` aggregation layer |

---

## 1. Business Unification (proceeding now)

### 1.1 Design
A canonical `businesses` table replaces `shops` and `gyms` as the single source of truth for every physical/local business — used by Neara/Shops, Gyms, Let's Play, Neighbourhood Picks, Local Finds, Search, Explore, and Friend AI.

**Two-level categorization**, to satisfy both your literal ask (a `business_type` discriminator) and 3-year scalability (thousands of businesses, new categories added without migrations):

- `business_type` — a small, stable enum for coarse structural branching the app logic needs to treat differently: `retail | food | fitness | venue | service | other`. Rarely changes; safe as an enum.
- `category_id → business_categories.id` — a normalized, admin-extensible lookup table for the actual displayed category (`"Café"`, `"Badminton Court"`, `"Pharmacy"`, `"Unisex Salon"`, ...), including an optional `parent_id` for grouping (`"Badminton Court"` under `"Sports Venue"`). New categories are a row insert, not a schema change.

```
businesses
  id                uuid PK
  owner_id          uuid FK -> auth.users
  name              text
  description       text
  business_type     enum(retail|food|fitness|venue|service|other)
  category_id       uuid FK -> business_categories.id
  address           text
  locality          text
  city              text
  phone, email, website
  opening_time, closing_time
  images            text[]
  rating            numeric
  review_count      int
  is_verified       boolean
  status            enum(active|inactive|pending|banned)
  created_at, updated_at

business_categories
  id          uuid PK
  slug        text unique
  label       text
  icon        text
  parent_id   uuid FK -> business_categories.id (nullable, self-referencing)

gym_details                 -- specialization, 1:1 with businesses where business_type='fitness' and category='gym'
  business_id   uuid PK/FK -> businesses.id
  membership_plans  jsonb   -- kept as jsonb: genuinely unstructured/plan-specific, not filtered/searched on
  trainers          jsonb
  equipment         text[]
  facilities        text[]

business_reviews            -- merges shop_reviews + gym_reviews
  id            uuid PK
  business_id   uuid FK -> businesses.id
  user_id       uuid FK -> profiles.id
  rating        int (1-5)
  review        text
  created_at
```

Note on jsonb: `gym_details.membership_plans`/`trainers` stay jsonb deliberately — they're display-only, never filtered/sorted on in a query. This is different from Let's Play's sport/price data (§2), which *is* filtered and sorted on, and therefore must be relational, not jsonb.

### 1.2 Migration path (non-breaking)
1. Create `business_categories`, seed it from the distinct `category` text values currently in `shops` + a `sports_venue`/gym-derived set.
2. Create `businesses`, backfill from `shops` (all rows) and `gyms` (all rows, `business_type='fitness'`).
3. Create `gym_details`, backfill gym-specific columns from `gyms`.
4. Create `business_reviews`, backfill from `shop_reviews` + `gym_reviews`.
5. Replace `shops` and `gyms` with **views** of the same name/shape over `businesses` (+ `gym_details`), so `Shops.jsx`, `Gyms.jsx`, `shopService`-style calls keep working unmodified until they're migrated to query `businesses` directly on your own schedule.
6. Repoint FKs (`shop_reviews.shop_id`, `gym_reviews.gym_id`, future `offers.business_id`, `curated_picks`, `venue_sports.business_id`) at `businesses.id`.

### 1.3 RLS
Public read `status = 'active'`; write restricted to `owner_id = auth.uid()` or admin. `business_categories` is public read, admin-write only.

### 1.4 Indexes
`(category_id, locality)`, `(business_type, locality)`, `(locality, rating DESC)`, `(status)`.

---

## 2. Let's Play — Normalized Relational Model

No jsonb for sport/price/availability data — it needs to be filtered ("badminton under ₹300/hr near me") and sorted, which jsonb does poorly and non-indexably at scale. Structure:

```
sports                        -- lookup: badminton, football, cricket, swimming, tennis, ...
  id      uuid PK
  slug    text unique
  label   text
  icon    text

venue_sports                  -- bridge: which sports a venue (business) offers, and at what price
  id                    uuid PK
  business_id           uuid FK -> businesses.id     -- the venue IS a business (business_type='venue')
  sport_id              uuid FK -> sports.id
  price_per_hour        numeric
  slot_duration_minutes int
  surface_type          text nullable   -- e.g. "synthetic turf", "wooden court"
  indoor                boolean
  created_at, updated_at
  UNIQUE (business_id, sport_id)

venue_slots                   -- optional now, schema-ready for real booking later
  id              uuid PK
  venue_sport_id  uuid FK -> venue_sports.id
  starts_at       timestamptz
  ends_at         timestamptz
  capacity        int
  booked_count    int
  status          enum(open|full|cancelled)
```

This lets a query like *"badminton venues in Green Sector under ₹300/hr, sorted by rating"* run as a single indexed join across `businesses ⋈ venue_sports ⋈ sports`, with `venue_slots` ready to plug in the moment real-time booking is built — no redesign.

**Indexes:** `venue_sports (sport_id, price_per_hour)`, `venue_sports (business_id)`, `venue_slots (venue_sport_id, starts_at)`.
**RLS:** `venue_sports`/`sports` public read; write `business owner or admin`. `venue_slots` public read of `status='open'`; write via booking flow (service role) once built.
**Realtime:** only `venue_slots` is a realtime candidate (live seat/slot counts), and only once booking exists — not required for the Let's Play card view itself.

---

## 3. Rename `activities` → `notifications` (proceeding now)

Confirmed safe: I checked `src/services/activity.js` — it's the only file touching this table, with 8 references (`fetchActivities`, `markAllActivitiesRead`, realtime channel `activities:${userId}`, FK name `activities_actor_id_fkey`). Because usage is fully contained to one file, this is a clean rename with no compatibility view needed:

```
ALTER TABLE activities RENAME TO notifications;
-- FK constraint activities_actor_id_fkey / activities_user_id_fkey get renamed by Postgres automatically
-- on constraint name collision, explicit RENAME CONSTRAINT statements will be included in the migration.
```

**Accompanying code change (part of the same PR, not Home's scope but required for consistency):** update `src/services/activity.js` — `.from('activities')` → `.from('notifications')`, realtime channel/table filter target, and the `ACTIVITY_SELECT` FK reference name. This file is otherwise unaffected; its exported function names (`fetchActivities`, etc.) can stay as-is since they describe the *feature* (Activity Center), not the table.

No RLS/index changes — carried over as-is under the new name.

---

## 4. Happening Around — Multi-Source Ranked Feed

### 4.1 Should there be a reusable feed aggregation layer? — Evaluation

**Yes, recommended.** Reasoning:

- You explicitly need to blend 7+ heterogeneous sources (events, community posts, sports activity, ride shares, alerts, business updates, featured picks, future external integrations) into one *ranked* order. Doing this as a live N-way `UNION` across 5+ tables on every Home load doesn't scale past a few thousand rows per source and can't be cleanly ranked (each table has different "recency"/"relevance" semantics).
- The same problem — "a ranked, mixed-type stream, scoped by locality" — is also exactly what **Explore** and **Friend AI** need. Building it once as a shared layer avoids three teams solving the same problem three times (the duplication this whole exercise is trying to prevent).
- **Notifications is explicitly *not* a good fit** for this layer — notifications are per-user, targeted, and already well-served by the (renamed) `notifications` table. I'm not merging them; a notification can *reference* a `feed_items.id` when relevant (e.g. "an event you saved is starting soon"), but `feed_items` itself stays a public discovery feed, not a personal inbox.
- Cost/complexity is bounded: it's one denormalized table + a handful of triggers on tables you already have (or are already creating). No new external system, no separate service.

**Verdict: include it**, scoped to Home + Explore + Friend AI (read-only for now); Notifications stays separate.

### 4.2 Design

```
feed_items
  id                  uuid PK
  source_type         enum(event|activity|workshop|community_post|ride|offer|featured_pick|external)
  source_id           uuid nullable        -- polymorphic pointer into the origin table; null only for 'external'
  title               text
  subtitle            text
  image_url           text
  locality            text
  city                text
  occurs_at           timestamptz nullable -- event/ride/activity start time; null for evergreen items (e.g. an offer)
  created_at          timestamptz
  expires_at          timestamptz nullable -- community post 48h TTL, offer valid_until, etc.
  engagement_score    int default 0        -- rollup of likes/attendees/comments; updated by trigger, not stored-decayed
  editorial_priority  int default 0        -- populated from curated_picks when a source row is also featured
  status              enum(active|expired|removed)
  metadata            jsonb default '{}'   -- presentation-only (icon, tag label, color, CTA) — never filtered/searched on
  UNIQUE (source_type, source_id)
```

Deliberately **not** storing a single precomputed `rank_score` that decays over time (that requires a background recompute job to stay accurate). Instead, `feed_items` stores raw signals (`occurs_at`, `created_at`, `engagement_score`, `editorial_priority`) and the **query** computes final order:

```
ORDER BY editorial_priority DESC,
         (CASE WHEN occurs_at IS NOT NULL AND occurs_at > now() THEN 0 ELSE 1 END),
         COALESCE(occurs_at, created_at) ASC
```

This keeps ranking correct with zero background jobs at v1 scale, and leaves room to swap in a real scoring function (or a Friend-AI-produced score written into `editorial_priority`) later without touching the table shape.

### 4.3 Population strategy
`AFTER INSERT OR UPDATE` triggers on each source table upsert into `feed_items` (keyed by `source_type, source_id`):
- `events` → `source_type` = `event_type` value (`event|activity|workshop`)
- `community_posts` → `source_type = 'community_post'` (covers alerts, announcements, and — via the new nullable `business_id` — business updates, all through the *existing* table, see §4.4)
- `rides` → `source_type = 'ride'`
- `offers` → `source_type = 'offer'`
- `curated_picks` → updates `editorial_priority` on the matching `feed_items` row (doesn't create a new one; a curated pick boosts an existing item)

Expiry: a cheap periodic job (or a `status` check at query time via `expires_at < now()`) marks rows `expired` — no need for hard deletes, keeps history for Friend AI training data later.

### 4.4 Business updates & local alerts — reusing `community_posts`, not new tables
Rather than a bespoke `business_updates` table (which would duplicate `community_posts`' comments/reactions/votes/save infrastructure for no reason):
- Add a nullable `business_id → businesses.id` column to `community_posts`, so a business account can author a post the same way a resident does.
- Extend the existing `post_type` check constraint to include `'business_update'` and `'alert'` (currently: `post, ride_offer, ride_request, event, buysell, poll, announcement`).

This means "business updates" and "local alerts" get comments, reactions, and votes for free, and flow into `feed_items` through the same `community_posts` trigger — no parallel content system.

### 4.5 Indexes
`(status, locality, occurs_at)`, `(status, city, created_at DESC)`, `(source_type)`, unique `(source_type, source_id)`.

### 4.6 RLS
Public read `status = 'active'`. **No client-side writes at all** — every row is written by a trigger acting under the source table's own write permission, so `feed_items` can never drift from "derived from a real, permission-checked row." This also means Search/Explore/Friend AI reading `feed_items` inherit correct visibility for free (a removed/banned business's `community_post` update disappears from the feed the moment the source row's status changes, via the same trigger).

### 4.7 Realtime
Subscribe to `feed_items` INSERT (locality-filtered) for a single "something new nearby" realtime signal — replaces needing separate realtime subscriptions per source table for the purposes of Happening Around specifically (Smart Ride's live seat-count on already-rendered cards still subscribes to `rides` directly, since that's a different concern from feed composition).

---

## 5. Revised Table List

### New tables
| Table | Purpose |
|---|---|
| `business_categories` | Normalized, extensible business category lookup |
| `businesses` | Canonical business entity (replaces `shops`+`gyms`) |
| `gym_details` | Fitness-specific specialization (1:1 with `businesses`) |
| `business_reviews` | Merges `shop_reviews` + `gym_reviews` |
| `sports` | Sport-type lookup |
| `venue_sports` | Venue x sport bridge — price, duration, indoor/outdoor |
| `venue_slots` | Slot/availability (schema-ready now, booking feature later) |
| `ride_providers` | Smart Ride commercial comparison config |
| `offers` | Local Finds deals/affiliate offers |
| `curated_picks` | Generic polymorphic editorial ranking |
| `feed_items` | Reusable ranked aggregation layer (Home/Explore/Friend AI) |

### Renamed
| From | To |
|---|---|
| `activities` | `notifications` |

### Extended (additive columns)
| Table | Change |
|---|---|
| `events` | `+ event_type` enum(`event\|activity\|workshop\|meetup`) |
| `community_posts` | `+ business_id` FK nullable; `post_type` check `+ 'business_update', 'alert'` |

### Replaced by views (backward-compat during transition)
| Old table | New form |
|---|---|
| `shops` | View over `businesses` (`business_type` in retail/food/service/venue) |
| `gyms` | View over `businesses` join `gym_details` |
| `shop_reviews` | Superseded by `business_reviews` (kept as compat view if still referenced) |
| `gym_reviews` | Superseded by `business_reviews` (kept as compat view if still referenced) |

### Unchanged, reused as-is
`profiles`, `rides`, `ride_members`, `ride_requests`, `saved_items`, `community_comments`, `community_reactions`, `community_votes`, `community_saved`, `event_registrations`

---

## 6. ER Diagram

See attached `localnest_home_backend_er.mermaid` (rendered separately). Text summary of the core relationships:

```
profiles ─┬─< businesses (owner_id)
          ├─< events (organizer_id)
          ├─< community_posts (author_id)         [+ optional business_id for business-authored posts]
          ├─< rides (driver_id)
          ├─< saved_items / notifications / business_reviews (user_id)

business_categories ─< businesses (category_id, self-referencing parent_id)

businesses ─┬─< gym_details (business_id, 1:1)
            ├─< business_reviews (business_id)
            ├─< venue_sports (business_id) ─< venue_slots (venue_sport_id)
            ├─< offers (business_id, nullable)
            └─< community_posts (business_id, nullable)

sports ─< venue_sports (sport_id)

curated_picks ──> polymorphic (item_type, item_id) → businesses | events
saved_items   ──> polymorphic (item_type, item_id) → businesses | events | ...

feed_items ──> polymorphic (source_type, source_id) → events | community_posts | rides | offers
           <── boosted by curated_picks.editorial_priority

ride_providers  (standalone, admin-managed, no FKs)
```

---

## 7. Data Flow (Home, revised)

```
Home
 └─ HomeSectionRenderer
     ├─ HappeningAroundSection    → getHappeningAround(locality) → feed_items  [single ranked query]
     ├─ NeighbourhoodPulseSection → (existing)                  → community_posts
     ├─ SmartRideSection          → getCommunityRides() + getRideProviders()  → rides, ride_providers
     ├─ LetsPlaySection           → getSportsVenues(locality, sportId?, maxPrice?) → businesses join venue_sports join sports
     ├─ LocalFindsSection         → getOffers(locality)          → offers
     ├─ NeighbourhoodPicksSection → getFeaturedBusinesses(locality) → curated_picks join businesses
     ├─ ActivitiesSection         → getActivities(locality)      → events (event_type='activity')
     └─ WorkshopsSection          → getWorkshops(locality)       → events (event_type='workshop')
```

Happening Around collapses from "query 4-5 tables and merge client-side" to **one indexed query against `feed_items`** — the main structural win of this revision.

## 8. API Flow
Unchanged approach from v1 — all reads via the Supabase JS client from `HomeContentService`, one function per section, defensive (never throws to caller). `feed_items` is populated entirely server-side (triggers); the frontend never writes to it.

## 9. Realtime Flow
| Table | Subscribed by | Event |
|---|---|---|
| `community_posts` | Neighbourhood Pulse (existing) | INSERT |
| `rides` | Smart Ride | INSERT/UPDATE |
| `feed_items` | Happening Around | INSERT (locality-filtered) |
| `venue_slots` | Let's Play (future, once booking exists) | UPDATE |

Everything else (offers, curated_picks, ride_providers, business data) is pull-on-load — low-churn/editorial, no realtime justified.

## 10. Frontend Section → Table Map (revised)
| Home section | Primary table(s) | Join/lookup |
|---|---|---|
| Happening Around | `feed_items` | (denormalized — no runtime join needed) |
| Neighbourhood Pulse | `community_posts` | — |
| Smart Ride | `rides`, `ride_members` | `ride_providers` |
| Let's Play | `businesses`, `venue_sports` | `sports`, `business_reviews` |
| Local Finds | `offers` | `businesses` (optional FK) |
| Neighbourhood Picks | `curated_picks` | `businesses` |
| Activities | `events` (`event_type='activity'`) | — |
| Workshops | `events` (`event_type='workshop'`) | — |

---

## 11. What's ready for SQL once you approve this document
1. `business_categories`, `businesses`, `gym_details`, `business_reviews` + backfill from `shops`/`gyms`/`shop_reviews`/`gym_reviews` + compat views
2. `sports`, `venue_sports`, `venue_slots`
3. `ALTER TABLE activities RENAME TO notifications` + constraint renames + `src/services/activity.js` table-name updates
4. `events.event_type` column + backfill
5. `community_posts.business_id` column + `post_type` constraint update
6. `ride_providers`, `offers`, `curated_picks`
7. `feed_items` + trigger functions on `events`, `community_posts`, `rides`, `offers`, `curated_picks`
8. RLS policies + indexes for all of the above

Let me know if this revised design is approved as-is, or if anything in §1-§4 needs adjustment before I write the migrations.
