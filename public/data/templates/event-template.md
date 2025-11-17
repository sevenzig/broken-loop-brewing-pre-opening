---
# Event Template - All Available Options

# Basic Information
name: 'Event Name Here' # Required: Event name as displayed
image: '/images/events/event-slug.jpg' # Required: Path to event image (jpg, png, svg)
slug: 'event-slug' # Required: URL slug (lowercase, hyphens only)

# Date & Time
date: '2025-07-15' # Required: Event date in YYYY-MM-DD format
time: '7:00 PM - 9:00 PM' # Required: Time range or start time

# Scheduling
recurring: 'weekly' # Optional: "weekly" | "monthly" | "yearly" | "one-time" | null
status: 'active' # Required: "active" | "cancelled" | "postponed" | "sold-out" | "draft"

# Categorization
category: 'entertainment' # Required: "trivia" | "tasting" | "live-music" | "entertainment" | "educational" | "special" | "private"

# Display Options
featured: true # Required: true | false (shows featured badge and priority placement)

# Event Details
brief_description:
  'Short description for event cards and previews (1-2 sentences recommended).'
# Required: Brief description for cards and listings

price: '$15' # Required: Price per person ("Free" | "$X" | "$X-Y" for ranges)
capacity: '50' # Optional: Maximum number of attendees
organizer: 'Event Organizer Name' # Optional: Who is running/hosting the event

# Additional Notes:
# - All text fields support basic HTML in content body below frontmatter
# - Images should be optimized for web (recommended: 800x400px landscape)
# - Date format: YYYY-MM-DD (required for proper sorting and filtering)
# - Time format: Flexible but recommend "H:MM AM/PM - H:MM AM/PM" or "H:MM AM/PM"
# - Recurring events: Use base date, system handles recurrence display
# - Status affects display: active=normal, cancelled=strikethrough, sold-out=badge, draft=hidden
# - Categories determine filtering and organization on events page
# - Featured events appear prominently and may be highlighted
# - Price: Use "Free" for no cost, "$X" for fixed price, "$X-Y" for price ranges
# - Capacity helps with booking management and display
# - Organizer can be staff member, band name, or external organization
# - Slug must be unique and match the filename (without .md extension)
---

# Full Event Description

This is where you can add a comprehensive description of the event. This content
supports **markdown formatting** including:

- **Bold text** for important details
- _Italic text_ for emphasis
- Lists for schedules, prizes, or features
- Links to related pages or external resources

## Event Schedule

Provide a detailed timeline of the event:

- **6:30 PM**: Doors open, registration begins
- **7:00 PM**: Event officially starts
- **8:30 PM**: Intermission/break
- **9:00 PM**: Event concludes

## What's Included

List what attendees can expect:

- Entry to the event
- Complimentary items (if any)
- Access to special pricing
- Educational materials
- Food and drink options

## Pricing & Packages

Detail pricing structure if complex:

- **General Admission**: $15 per person
- **VIP Package**: $25 per person (includes...)
- **Group Rates**: 10+ people get 15% discount
- **Student Discount**: Show ID for $5 off

## Booking Information

Provide clear booking instructions:

- **Advance booking**: Recommended/Required
- **Walk-ins**: Welcome (if space allows)
- **Contact**: Phone number or online booking link
- **Cancellation policy**: Refund terms
- **Age requirements**: 21+ only, family-friendly, etc.

## Special Notes

Include any important information:

- Parking availability
- Accessibility information
- What to bring
- Dress code (if any)
- Weather contingencies (for outdoor events)
