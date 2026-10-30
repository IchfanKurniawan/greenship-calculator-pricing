# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Building owners and developers estimating the likely GREENSHIP certification fee before beginning an application.
- GBC Indonesia staff helping applicants identify the correct scheme, understand the estimate, and proceed to the appropriate certification pathway.

## Product Purpose

Provide a fast, understandable estimate of GREENSHIP certification fees across the supported schemes. Success means a user can choose the correct scheme, enter the minimum required project facts, understand how the estimate was calculated, and move confidently to GBCI's official certification process.

## Positioning

The calculator turns GBCI's official scheme-specific pricing rules into a guided, transparent estimate rather than presenting applicants with a static fee table.

## Operating Context

Users may arrive early in project planning with only a building type and approximate area. GBCI staff may use the same interface while explaining options to applicants. Results are estimates and may exclude project-specific costs such as verifier accommodation outside Jabodetabek.

## Capabilities and Constraints

- Support New Building, Existing Building, Interior Space, Transit Station, Homes — Individual, Homes — Developer, and Neighborhood schemes.
- Use only the pricing mathematics documented in `doc.md`; implementation notes and the previous technical architecture in that file are not product requirements.
- Update estimates as valid inputs become available, show an intelligible fee breakdown, and preserve the Rp500,000,000 cap behavior where applicable.
- Provide a clear next step into GBCI's official certification journey.
- Use only free ReUI components and free web technology.
- Deploy on Vercel's free tier.

## Brand Commitments

- The product is an official-looking companion to `gbcindonesia.org`, not a separate startup brand.
- Preserve the GBC Indonesia and GREENSHIP names and use the parent site's visual language as the authority.
- Parent-site identity evidence includes the GBCI mark, dark institutional green, pale mint surfaces, blue and orange secondary accents, Onest body typography, Parkinsans display typography, architectural imagery, and a measured, credible editorial voice.

## Evidence on Hand

- Pricing mathematics: `doc.md`.
- Current calculator: `https://greenship-calc.vercel.app/`.
- Parent brand and certification context: `https://gbcindonesia.org/` and `https://gbcindonesia.org/certification`.
- No testimonials, usage statistics, or conversion claims were supplied; future work must not fabricate them.

## Product Principles

1. Guide before calculating: help users choose the correct scheme instead of assuming prior GREENSHIP knowledge.
2. Show the reasoning: every total should be accompanied by the inputs and pricing rule that produced it.
3. One trustworthy system: the calculator should feel visibly owned by GBC Indonesia.
4. Serve self-service and assisted use equally well.
5. Keep estimates honest: distinguish estimates, exclusions, caps, and official next steps.

## Accessibility & Inclusion

Use plain Indonesian as the primary interface language, preserve readable contrast and keyboard navigation, and never rely on color alone to communicate scheme, validation, or result state.
