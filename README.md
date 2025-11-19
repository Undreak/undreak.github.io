# Personal Portfolio Website

Modern portfolio website for physics researcher Alexandre De Cuyper. Built with pure HTML, CSS, and JavaScript.

**Live Site**: [undreak.github.io](https://undreak.github.io)

## 🎨 Design Philosophy

**Swiss Modernism + Minimalism**
- Clean grid systems and geometric precision
- Bold typography with clear hierarchy
- Warm neutral color palette (cream/beige backgrounds)
- Coral accent color (#E07856)
- Functional, purposeful design with generous whitespace

## ✨ Features

- 🌓 **Dark/Light theme** with system preference support
- 📱 **Fully responsive** mobile-first design
- 📝 **Article system** for research write-ups and blog posts
- 🖼️ **Image lightbox** with keyboard navigation
- 📑 **Auto-generated table of contents** for articles
- ♿ **Accessible** (ARIA labels, semantic HTML, keyboard navigation)
- 🎭 **Smooth scroll animations** with Intersection Observer
- 📊 **Live GitHub integration** for projects showcase
- ⚡ **Fast and lightweight** (no frameworks, no build step)

## 📁 Project Structure

```
undreak.github.io/
├── index.html                  # Main portfolio page
├── projects.html               # Dedicated projects page
├── articles/                   # Research articles and blog posts
│   ├── article-template.html
│   ├── polymer-wetting-dynamics.html
│   └── fan-2024-experience.html
├── css/
│   ├── reset.css              # CSS normalization
│   ├── variables.css          # Design tokens (colors, spacing, typography)
│   ├── layout.css             # Grid and layout utilities
│   ├── components.css         # Reusable UI components
│   ├── style.css              # Main page styles
│   ├── article.css            # Article page typography and layout
│   ├── lightbox.css           # Image lightbox modal
│   ├── toc.css                # Table of contents sidebar
│   └── projects-page.css      # Projects page styles
├── js/
│   ├── theme.js               # Dark/light mode toggle
│   ├── github.js              # GitHub API integration
│   ├── animations.js          # Scroll animations
│   ├── main.js                # Navigation and general functionality
│   ├── projects-page.js       # Projects page functionality
│   ├── lightbox.js            # Image enlargement modal
│   └── toc.js                 # Table of contents generation
├── images/
│   └── articles/              # Article images (WebP format)
│       ├── polymer-wetting-dynamics/
│       └── fan-2024-experience/
├── pdfs/                      # Downloadable documents
│   ├── cv.pdf
│   └── polymer-wetting-dynamics.pdf
├── favicon.svg
└── README.md
```

## 📝 Content Sections

### Main Portfolio (index.html)

- **Hero**: Name, title, skills, call-to-action
- **About**: Bio, education timeline, languages
- **Research Experience**: Timeline of internships and projects
- **Publications**: Links to article write-ups
- **Skills & Expertise**: Technical and scientific skills
- **Projects**: GitHub repositories showcase
- **Contact**: Email, GitHub, LinkedIn

### Articles System

Published articles:
1. **Polymer Wetting Dynamics** - Master's thesis research on nano-textured surfaces
2. **FAN 2024 Experience** - Neutron scattering training journal

Each article includes:
- Auto-generated table of contents (desktop sidebar, mobile hamburger menu)
- Clickable images with lightbox enlargement
- Responsive typography optimized for reading
- Breadcrumb navigation
- Social sharing metadata

## 🎯 Article Features

### Image Lightbox
- Click any article image to enlarge
- Navigate with arrow keys or on-screen buttons
- Press ESC or click outside to close
- Shows image counter (e.g., "3 / 7")
- Displays image captions

### Table of Contents
- **Desktop**: Fixed left sidebar with section highlighting
- **Mobile**: Collapsible hamburger menu
- Auto-generated from h2/h3 headings
- Smooth scroll to sections
- Highlights current section while reading

## 🎨 Design System

### Typography
- **Display**: Space Grotesk (geometric, bold)
- **Body**: Inter (clean, readable)
- **Code**: JetBrains Mono (monospaced)

### Colors

**Light Theme:**
- Background: `#FAF7F5` (warm cream)
- Text: `#1A1A1A` (near black)
- Accent: `#E07856` (coral)

**Dark Theme:**
- Background: `#0F0F0F` (true black)
- Text: `#E8E8E8` (off-white)
- Accent: `#F08B6E` (brighter coral)

### Spacing
8px base unit system: `--space-1` (8px), `--space-2` (16px), `--space-4` (32px), `--space-8` (64px)

## 🛠️ Tech Stack

- **HTML5** - Semantic structure
- **CSS3** - Grid, Flexbox, CSS custom properties
- **Vanilla JavaScript** - No frameworks
- **GitHub Pages** - Static hosting
- **GitHub API** - Dynamic project showcase

## 🔧 Development

### Local Testing

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve

# Then open: http://localhost:8000
```

### Adding a New Article

1. Copy `articles/article-template.html`
2. Update metadata (title, description, Open Graph)
3. Write content using semantic HTML
4. Add images to `images/articles/[article-name]/`
5. Convert images to WebP: `cwebp -q 85 input.jpg -o output.webp`
6. Include lightbox and TOC CSS/JS in `<head>` and before `</body>`

### Image Optimization

All article images use WebP format for optimal performance:
```bash
cwebp -q 85 input.png -o output.webp
```

## ♿ Accessibility

- Semantic HTML5 elements (`<nav>`, `<article>`, `<section>`)
- ARIA labels and roles
- Keyboard navigation (Tab, Arrow keys, ESC)
- Focus indicators
- WCAG AA color contrast
- Reduced motion support (`prefers-reduced-motion`)
- Screen reader friendly

## 📱 Responsive Design

- **Desktop**: 1024px+ (TOC sidebar visible)
- **Tablet**: 768px - 1023px
- **Mobile**: < 768px (TOC becomes hamburger menu)
- Mobile-first approach with progressive enhancement

## 🚀 Deployment

Automatically deployed via GitHub Pages from the `claude/portfolio-improvements-*` branch.

To deploy changes:
```bash
git add .
git commit -m "Description of changes"
git push origin [branch-name]
```

GitHub Pages will rebuild and deploy automatically.

## 📊 Performance

- Zero dependencies (no npm packages)
- No build step required
- Lazy loading for GitHub projects
- Intersection Observer for animations
- WebP images for optimal size
- CSS custom properties for theming

## 📄 License

Personal portfolio - All rights reserved.

---

**Last Updated**: November 2025
**Built by**: Alexandre De Cuyper
