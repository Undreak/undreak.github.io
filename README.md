# Alexandre De Cuyper -- Physics Researcher Portfolio

Academic portfolio for PhD applications in soft matter physics.

**Live site**: [undreak.github.io](https://undreak.github.io)

## Tech Stack

- Vanilla HTML, CSS, JavaScript -- no frameworks, no build step
- GitHub Pages (auto-deploy on push to `master`)
- GitHub and GitLab APIs for the projects showcase
- DOMPurify for XSS protection on dynamic content

## Project Structure

```
.
├── index.html                      # Main portfolio page
├── projects.html                   # GitHub/GitLab projects listing
├── articles/
│   ├── article-template.html       # Template for new articles
│   ├── polymer-wetting-dynamics.html
│   └── fan-2024-experience.html
├── css/
│   ├── reset.css                   # CSS normalization
│   ├── variables.css               # Design tokens (colors, spacing, typography)
│   ├── layout.css                  # Grid, containers, section rhythm
│   ├── components.css              # Reusable UI components (buttons, tags, cards)
│   ├── style.css                   # Main page styles (nav, hero, sections)
│   ├── hero-animations.css         # Hero section animations
│   ├── bento-skills.css            # Bento grid layout for skills section
│   ├── technique-icons.css         # Technique cards grid (Spring 2024 projects)
│   ├── article.css                 # Article page typography
│   ├── lightbox.css                # Image lightbox modal
│   ├── toc.css                     # Table of contents sidebar
│   ├── projects-page.css           # Projects page styles
│   ├── hero-glow.css               # Animated mesh gradient for hero background
│   └── section-backgrounds.css     # CSS ambient effects for non-hero sections
├── js/
│   ├── theme.js                    # Dark/light mode with system preference
│   ├── github.js                   # GitHub and GitLab API integration
│   ├── animations.js               # Scroll animations (IntersectionObserver)
│   ├── hero-interactive.js         # Mouse-tracking scattering response
│   ├── main.js                     # Navigation, lazy loading, interactions
│   ├── lightbox.js                 # Image enlargement modal
│   ├── toc.js                      # Auto-generated table of contents
│   ├── article-mobile.js           # Article mobile-specific behavior
│   └── projects-page.js            # Projects page filtering and search
├── images/
│   ├── articles/                   # Article images (WebP)
│   └── logos/                      # Institutional logos
├── code-snippet/                   # Embedded code examples and PDF figures
├── pdfs/                           # CV and thesis documents
└── favicon.svg
```

## Design System

Defined in `css/variables.css`. Dark theme via `[data-theme="dark"]` overrides.

### Typography

| Role    | Font             | Fallback                 |
|---------|------------------|--------------------------|
| Display | Fraunces         | Georgia, serif           |
| Heading | Playfair Display | Georgia, serif           |
| Body    | Crimson Pro      | Georgia, Times New Roman |
| Code    | IBM Plex Mono    | Monaco, Courier New      |

Fluid sizing with `clamp()` from `--text-xs` (0.75rem) to `--text-4xl` (5rem).

### Color Palette

Physics-inspired -- modeled on a neutron scattering intensity map.

| Token                | Light     | Dark      | Role                 |
|----------------------|-----------|-----------|----------------------|
| `--accent-primary`   | `#E63946` | `#FF4D5A` | High intensity (red) |
| `--accent-secondary` | `#5B9FCC` | `#6BB3D9` | Diffraction (blue)   |
| `--accent-tertiary`  | `#F1A208` | `#FFB830` | Highlight (amber)    |
| `--bg-primary`       | `#F8F9FA` | `#0F0F0F` | Page background      |
| `--bg-elevated`      | `#FFFFFF` | `#252525` | Card surfaces        |

### Spacing

8px base unit: `--space-1` (8px) through `--space-16` (128px).

## Development

```bash
python3 -m http.server 8000
# or
npx serve
```

No dependencies to install.

### Adding a New Article

1. Copy `articles/article-template.html`
2. Update `<head>` metadata (title, description, Open Graph tags)
3. Write content using semantic HTML
4. Place images in `images/articles/<article-name>/` (WebP preferred)
5. Link from `index.html` in the Research section

## Architecture Notes

### Background Effects

`css/hero-glow.css` renders an animated mesh gradient behind the hero content using
the physics palette (amber/red warm blob + blue cool blob). Pure CSS with `@keyframes`,
no JavaScript. `css/section-backgrounds.css` adds lightweight ambient effects to
other sections (grid pattern, radial halos, dot lattice, gradient wash).

### GitHub/GitLab Integration

`js/github.js` fetches public repositories from both platforms via their REST APIs,
normalizes the data, and renders project cards. Includes timeout handling, rate-limit
detection, and URL validation against open-redirect attacks.

### Security

- Content-Security-Policy via `<meta>` tags
- DOMPurify for sanitizing API responses before DOM insertion
- URL validation on all external links from API data
- No inline scripts (CSP-compliant event handling)

## License

All rights reserved.
