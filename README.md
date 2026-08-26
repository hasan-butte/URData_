# URData

**An independent research project on data collection, surveillance, and privacy ethics.**

[Live Site](https://hasan-butte.github.io/URData_/) · Built by [Hasan Butte](https://github.com/hasan-butte)

## Overview

URData is a static website documenting how everyday devices, apps, services, and institutions, corporate and government alike, collect personal data, why that collection matters ethically, and what a reader can concretely do about it.

Real-world examples on the Collected Data page and the ethical arguments on the So What? page are each backed by cited sources: sources for a given method live inside that method's own card, and the sources behind the So What? arguments are collected in a references section at the bottom of that page. The Resources page is separate from either of these: a curated set of external tools, organizations, legislation, and reporting on data privacy for anyone who wants to read further at their own discretion.

Where the site draws conclusions, they're built as structural critique: arguments anchored to named frameworks like incentive structures, business models, and legal precedent. That keeps the case grounded in documented patterns rather than open-ended speculation.

## Pages

- **Home**: Introduces the site's thesis that personal data has become a commodity, and most people don't know the extent of what's collected or why it matters.
- **Collected Data**: Twelve cards, one per data collection method (AI chatbots and conversational data, behavioral and algorithmic profiling, browser tracking, facial recognition, financial transaction surveillance, genetic data, ISP traffic monitoring, location trackers, OS telemetry, smart home devices, social network mapping, and wearable and health data tracking), each with a technical description, a real-world example, and its own sources.
- **So What?**: An argument page structured as a chain of linked nodes or "gears", each making a distinct ethical or philosophical case for why the collection documented on Collected Data matters (surveillance capitalism, illusion of choice, manufactured intimacy, loss of autonomy, erosion of trust, and others), with a references section at the bottom.
- **Now What?**: A concrete action page organized into five categories, personal computers, mobile devices, unconventional data sources, information and outreach, and the internet, giving the reader specific settings, tools, and steps to reduce their own exposure.
- **Resources**: A curated list of tools, organizations, legislation, and reporting on data privacy, including self-assessment tools like browser fingerprinting tests and breach-checking services alongside advocacy groups and relevant law, for further reading at the reader's own discretion.

## Design

- Dark, near-black purple background with a violet accent palette, tied to a recurring eye motif: the nav logo, a large glowing eye illustration on the homepage, and a cursor-tracking SVG pupil that appears throughout the site
- Monospace typography with a typewriter-style typing effect used across headings and intro text
- Collected Data's background runs an independent canvas-based particle and wire animation, uses collapsible text cards for the 12 methods. 
- So What? lays its argument out as a chain of connected circular nodes, with gear-ring decorations and the curved paths joining them built dynamically in SVG and recalculated on resize
- Collapsible sections across the site (Collected Data cards, Now What? accordions) expand via CSS `max-height` transitions

## Technical Highlights

- `IntersectionObserver` drives scroll-triggered reveals and typing effects, and pauses expensive animation (the So What? particle background and node states) while it's off-screen
- The cursor-tracking eye widget and the typewriter text effect are implemented in vanilla JavaScript, using `screenToSVG()` and `getScreenCTM().inverse()` for coordinate math
- So What?'s gear-ring decorations and inter-node connector paths are built and positioned at runtime through the SVG DOM API, based on each node's live on-screen position, rather than hardcoded in markup
- So What?'s resize handling is debounced to avoid rebuilding that SVG geometry on every resize event; scroll listeners across the site are registered as passive to keep animation-heavy pages responsive
- Fonts are loaded from Google Fonts rather than self-hosted

## Tech Stack

Plain HTML, CSS, and JavaScript. No frameworks, build step, or external dependencies. Hosted on GitHub Pages.

## License

Code in this repository is licensed under MIT (see `LICENSE`). Written content is not covered by that license and may not be reproduced without permission.

## About

Built by Hasan Butte, a Computer Science student at the University of Arkansas at Little Rock, as an independent research and web development project.
