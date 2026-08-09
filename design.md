---
version: "recharge-design-2026-08-09"
name: "Recharge | Sleep, Recovery & Energy"
description: "Recharge is a mobile-first employee wellbeing product focused on sleep, recovery, and energy. The design uses the premium hierarchy, refined cards, strong typography, and dashboard quality of the SynapseOS reference, softened into a calm, human, reassuring consumer experience."
source_reference:
  name: "SynapseOS | Neural Wellness & Focus Recovery"
  origin: "Neuform staff featured templates"
  author: "Samnang Aing (@samnang)"
  tags: ["dashboard", "animated", "webgl", "threejs", "cta", "charts", "navigation", "links"]
colors:
  primary: "#2DD4BF"
  secondary: "#080C16"
  accent: "#5EEAD4"
  background: "#080C16"
  surface: "#1E293B"
  surface-soft: "#111827"
  text-primary: "#FFFFFF"
  text-secondary: "#A1A1AA"
  border: "#27272A"
typography:
  display-lg:
    fontFamily: "Manrope"
    fontSize: "64px"
    fontWeight: 500
    lineHeight: "1.04"
    letterSpacing: "0"
  display-md:
    fontFamily: "Manrope"
    fontSize: "40px"
    fontWeight: 500
    lineHeight: "1.1"
    letterSpacing: "0"
  body-md:
    fontFamily: "Manrope"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "1.6"
  label-md:
    fontFamily: "JetBrains Mono"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "1.2"
spacing:
  base: "8px"
  gap: "16px"
  card-padding: "24px"
  section-padding: "80px"
rounded:
  card: "16px"
  control: "8px"
  pill: "9999px"
components:
  card:
    background: "Use the surface token with subtle borders and soft shadow depth."
    radius: "Match the declared card radius token."
  button:
    background: "Use primary or accent colors for the main action."
    radius: "Use the control or pill radius based on the source composition."
  bottom-navigation:
    destinations: ["Today", "Journey", "Coach"]
    behavior: "Use on mobile as the primary app navigation after onboarding."
---

# Recharge | Sleep, Recovery & Energy

Recharge is a mobile-first employee wellbeing platform focused initially on sleep, recovery, and energy.

The core product principle is:

**Recharge starts with a conversation, not a questionnaire.**

The first MVP should demonstrate one polished vertical journey:

**Landing -> free-text AI problem intake -> adaptive follow-up questions -> personalized interpretation -> first 7-day plan -> Today screen.**

Do not build the full platform yet.

## Design Direction

Use the supplied SynapseOS design reference as the main structural inspiration. Preserve its premium information hierarchy, refined card design, strong typography, sophisticated dashboard quality, generous spacing, and confident first-screen composition.

Soften the original futuristic and neural-tech aesthetic considerably. Recharge should feel calm, premium, human, reassuring, contemporary, and minimal. It should feel like a consumer product employees voluntarily want to use, not an HR portal, medical application, or e-learning platform.

Avoid cyberpunk aesthetics, excessive neon or glow, medical dashboard styling, information overload, excessive metrics, large content libraries, courses, quizzes, and long explanatory screens.

## Visual Hierarchy

The interface should retain the visible confidence of the SynapseOS reference while reducing its intensity. Use compact, purposeful modules rather than generic SaaS card grids. The first viewport must make Recharge immediately understandable and actionable.

Key Recharge headings include:

- **Start your Recharge**
- **What's been getting in the way of feeling rested?**
- **What I'm hearing**
- **Your Recharge starting point**
- **Your first Recharge**
- **Good morning**
- **Today's quest**

## Colors

Anchor the palette in the source tokens: primary `#2DD4BF`, secondary `#080C16`, accent `#5EEAD4`, background `#080C16`, surface `#1E293B`, and text-primary `#FFFFFF`.

Use these colors with restraint. Teal should signal clarity, progress, and action, not create a neon or sci-fi mood. Keep background, surface, text, and border roles distinct so layouts retain the same contrast pattern as the source while feeling softer and more breathable.

## Typography

Use Manrope for display and body copy. Use JetBrains Mono, or an equivalent monospace face, only for labels, small metadata, and subtle system-style indicators.

Display typography should be strong but not loud. Body copy should be concise, warm, and practical. Avoid clinical language, productivity jargon, or HR-style phrasing.

## Layout

Design mobile-first. The primary app shell should use three destinations only:

- Today
- Journey
- Coach

Use bottom navigation on mobile. Desktop layouts may widen into a composed dashboard, but they should preserve the same product journey and avoid introducing admin-like complexity.

Keep spacing deliberate and stable. Favor the same grid direction, max-width behavior, card density, and responsive stacking seen in the SynapseOS reference. Do not replace distinctive source structures with generic marketing sections.

## Components

Cards, panels, progress elements, and conversational surfaces should preserve a compact operational hierarchy while remaining calm and human.

Primary components:

- Conversational free-text intake field
- Optional quick-start chips
- Interpretation panel
- Adaptive follow-up question cards
- Starting point summary
- Seven-day plan preview
- Today quest module
- Lightweight energy or emotion check-in
- Simple 7-day progress indicator
- Coach prompt entry points

Use buttons for clear commands only. The main CTA should be visually confident and easy to tap. Primary CTA copy:

**Start my Recharge**

## Motion

Preserve the spirit of the source motion cues: masked reveals, staggered entrance, hover lift, scroll-triggered transitions, and ambient movement.

Keep easing smooth and restrained. Motion should make the product feel responsive and premium, not animated for spectacle. Avoid busy particle-heavy effects during the core intake flow.

## Effects

If canvas, WebGL, Three.js, gradients, particles, or atmospheric effects are used, rebuild them as supporting layers behind the content. Effects must remain performant, responsive, and secondary to the interface.

Atmosphere should feel like calm focus and recovery, not neural-tech intensity.

## MVP Flow

### 1. Landing

Introduce Recharge with a concise value proposition around better sleep, recovery, and energy.

Primary CTA:

**Start my Recharge**

Do not force account creation before the user experiences value.

### 2. Problem Intake

The primary interaction is a large conversational free-text field.

Heading:

**What's been getting in the way of feeling rested?**

Placeholder:

**I sleep around 7 hours but still wake up exhausted...**

Optional quick-start chips:

- I can't fall asleep
- I'm always tired
- My shifts disrupt my sleep
- I wake up during the night

Free text remains the primary interaction.

### 3. AI Interpretation

After submission, show an interpretation screen that makes the user feel understood.

Use this structure:

- **What I'm hearing**
- Short natural-language interpretation
- **Main challenge**
- **Things worth exploring**

Do not diagnose medical conditions. Finish with:

**I just need a couple of details to personalize this.**

### 4. Adaptive Follow-Up

Support adaptive questions rather than a fixed questionnaire. Ask no more than three follow-up questions. Questions should be short and mostly answerable through one-tap choices.

Different problems should lead to different question paths, including morning fatigue, difficulty falling asleep, night awakenings, shift work, irregular schedules, and disrupted sleep due to family circumstances.

For the first implementation, mock the AI decision-making with predefined scenarios. Do not integrate a real AI API yet.

### 5. Personalized Starting Point

Show:

**Your Recharge starting point**

Include:

- Personal goal
- Likely modifiable contributors
- Recommended first focus

Do not present an artificial medical or sleep-health score.

### 6. Seven-Day Plan

Show:

**Your first Recharge**

Use no more than three behavioral focus areas. Frame them as experiments rather than a training course.

Example focus areas:

- Consistency
- Caffeine timing
- Morning light

Explain that Recharge will surface only one small action at a time.

Primary CTA:

**Start Day 1**

### 7. Today

The Today screen is the core recurring screen.

Structure:

- **Good morning**
- Lightweight emotional or energy check-in
- **Today's quest**
- One concrete action
- Short personalized explanation
- Primary action: **I'm in**
- Simple 7-day progress
- Entry point into the future Recharge Coach with example prompts

Example quest:

**Get 10 minutes of morning light**

Example explanation:

**Based on what you told us, improving your morning rhythm is a good place to start.**

## Content Tone

Recharge copy should feel clear, warm, and respectful. It should help the user feel understood without overclaiming.

Use phrases like:

- "What I'm hearing..."
- "A good place to start..."
- "Let's try one small experiment today."
- "This is not about perfect sleep. It's about finding what helps you recover."

Avoid diagnosis, treatment claims, medical certainty, employer surveillance language, and productivity-pressure language.

## Guardrails

- Do not flatten the source into a generic card grid.
- Do not swap the color mode unless the source clearly supports it.
- Preserve the first viewport signal, focal object, and visual density.
- Keep buttons, cards, and badges aligned to the same radius and border language.
- Do not build an employer dashboard, admin portal, wearable integration, payment flow, full authentication, or real AI integration in the MVP.
- Do not present health scores, diagnoses, or treatment recommendations.
- Keep the journey fast enough that a user can reach their first personalized action in roughly two minutes.
