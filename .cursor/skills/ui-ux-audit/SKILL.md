---
name: ui-ux-audit
description: Reviews React + Tailwind interfaces for usability, accessibility, visual hierarchy, and interaction clarity. Use when the user asks for UI/UX review, design critique, heuristic audit, usability improvements, accessibility feedback, or layout/content-flow fixes.
---

# UI UX Audit

## Scope

Use this skill to audit existing screens/components and return a practical report the user can apply quickly.

## Audit Workflow

1. Define the review target:
   - Single component
   - Full screen/page
   - Multi-step flow
2. Identify user goal and primary action on that surface.
3. Evaluate the UI with the checklist below.
4. Prioritize findings by severity and user impact.
5. Return the report format in `Output Template`.

## UI/UX Checklist

### Usability

- Primary action is obvious within 3 seconds.
- Labels are clear and specific; no ambiguous wording.
- Related controls are grouped; spacing implies structure.
- Error states explain what happened and what to do next.
- Empty/loading/success/error states are handled.

### Visual Hierarchy

- Heading levels and text emphasis are consistent.
- Contrast and size make primary content easy to scan.
- Important actions are visually distinct from secondary actions.
- Layout has enough whitespace; sections do not feel cramped.
- Mobile and desktop hierarchy remain consistent.

### Accessibility

- Color contrast is sufficient for text and controls.
- Interactive elements are keyboard reachable and visible on focus.
- Form controls have explicit labels and helpful validation text.
- Buttons and links use descriptive text (not only icons).
- Motion/animation does not hide content or block interaction.

### Interaction Quality

- Click/tap targets are large enough for touch.
- Feedback appears after interaction (loading, disabled, success).
- Navigation/back behavior is predictable.
- Destructive actions require confirmation when needed.
- Multi-step flows show progress and preserve user input.

### React + Tailwind Specific Checks

- Tailwind class usage is consistent and readable.
- Repeated UI patterns are componentized instead of copied.
- State-driven classes (`disabled`, `error`, `active`) are explicit.
- Breakpoints are intentional (`sm/md/lg`) and tested.
- Focus/hover/active states are present, not only default browser states.

## Severity Model

- `Critical`: Blocks task completion, causes major confusion, or creates major accessibility risk.
- `High`: Significant friction or misunderstanding likely for many users.
- `Medium`: Noticeable quality issue that hurts clarity or confidence.
- `Low`: Polish/consistency issue with minor impact.

## Output Template

Use this structure:

```markdown
# UI/UX Audit Report: [Surface Name]

## Context
- Surface: [component/page/flow]
- Primary user goal: [goal]
- Main action: [CTA]

## Findings
### [Critical|High|Medium|Low] - [Short issue title]
- **Where:** [exact UI location]
- **Problem:** [what is wrong]
- **Impact:** [how users are affected]
- **Recommendation:** [specific fix]
- **Implementation note (React + Tailwind):** [practical code-level guidance]

## Priority Fix Plan
1. [Highest-impact fix]
2. [Second fix]
3. [Third fix]

## Quick Wins
- [Small improvement 1]
- [Small improvement 2]
```

## Response Rules

- Prefer concrete findings over generic design advice.
- Tie every issue to user impact.
- Provide implementation notes that are realistic in React + Tailwind projects.
- If context is missing (user persona, device, journey), state assumptions briefly.
- Keep tone direct and actionable.
