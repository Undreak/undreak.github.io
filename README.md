# Personal Portfolio Website

Modern, elegant portfolio website for physics researcher. Built with pure HTML, CSS, and JavaScript.

## 🎨 Design Philosophy

**Swiss Modernism + Brutalist Minimalism**
- Clean grid systems and geometric precision
- Bold typography with clear hierarchy
- Warm neutral color palette (cream/beige backgrounds)
- Coral accent color (#E07856)
- Functional, purposeful design with generous whitespace

## 🛠️ Tech Stack

- **HTML5**: Semantic, accessible structure
- **CSS3**: Modern layouts (Grid, Flexbox), CSS custom properties
- **JavaScript**: Vanilla JS for all interactions
- **GitHub Pages**: Static hosting
- **GitHub API**: Dynamic project showcase

## ✨ Features

- 🌓 Dark/Light theme toggle with system preference support
- 📱 Fully responsive design (mobile-first)
- ♿ Accessible (ARIA labels, semantic HTML, keyboard navigation)
- 🎭 Smooth scroll animations
- 📊 Live GitHub repository integration
- ⚡ Fast and lightweight (no frameworks)
- 🎨 Custom geometric SVG illustrations

## 📁 Project Structure

```
undreak.github.io/
├── index.html              # Main HTML structure
├── css/
│   ├── reset.css          # CSS reset/normalize
│   ├── variables.css      # Design system (colors, typography, spacing)
│   ├── layout.css         # Grid and layout utilities
│   ├── components.css     # Reusable components (buttons, cards, tags)
│   └── style.css          # Section-specific styles
├── js/
│   ├── theme.js           # Dark/light mode toggle
│   ├── github.js          # GitHub API integration
│   ├── animations.js      # Scroll animations and micro-interactions
│   └── main.js            # Navigation and general functionality
├── assets/
│   └── images/            # Images and icons
└── README.md              # This file
```

## 🚀 Setup & Customization

### 1. Personal Information

Replace placeholders in `index.html`:
- `[NAME]` - Your full name
- `[EMAIL]` - Your email address
- `[USERNAME]` - Your GitHub username
- `[YEAR]` - Current year and graduation years

### 2. GitHub Integration

Update `js/github.js`:
```javascript
this.username = 'your-github-username'; // Replace [USERNAME]
```

### 3. Color Customization

Edit `css/variables.css` to change colors:
```css
--accent: #E07856;  /* Change primary accent color */
--bg-primary: #FAF7F5;  /* Change background color */
```

### 4. Content Updates

Edit sections in `index.html`:
- **Hero**: Update tagline and skills
- **About**: Add your bio and background
- **Research**: Fill in internship details and dates
- **Skills**: Customize your technical skills
- **Contact**: Add your links (LinkedIn, GitHub, email)

## 📝 Content Sections

### Hero
- Name and professional title
- Brief tagline
- Skill badges
- Call-to-action buttons

### About
- Professional bio
- Education timeline
- Language proficiencies

### Research Experience
- Timeline-based layout
- Internships and projects
- Techniques and technologies used

### Skills & Expertise
- Programming languages
- Experimental techniques
- Theoretical background
- Tools and platforms

### Projects
- Auto-fetched from GitHub
- Displays: description, stars, languages, topics
- Links to repositories and live demos

### Contact
- Email, GitHub, LinkedIn
- Professional summary

## 🎯 Performance Features

- **CSS Variables**: Dynamic theming
- **Intersection Observer**: Efficient scroll animations
- **Lazy Loading**: Images load only when visible
- **No Build Step**: Pure HTML/CSS/JS (optional build tools)
- **Optimized Assets**: Minimal external dependencies

## 🔧 Development

### Local Testing

1. **Python Server** (Python 3):
   ```bash
   python3 -m http.server 8000
   ```

2. **Node.js Server**:
   ```bash
   npx serve
   ```

3. **VS Code Live Server**: Use the Live Server extension

4. Open: `http://localhost:8000`

### Deploy to GitHub Pages

1. Ensure you're on the correct branch: `claude/setup-github-page-011CV6DxMvTbNCftZfT44xun`
2. Commit your changes
3. Push to GitHub
4. GitHub Pages will automatically deploy

## 🎨 Design System

### Typography
- **Display**: Space Grotesk (bold, geometric)
- **Body**: Inter (clean, readable)
- **Code**: JetBrains Mono (technical)

### Colors (Light Theme)
- Background: `#FAF7F5` (warm cream)
- Text: `#1A1A1A` (near black)
- Accent: `#E07856` (coral/terracotta)

### Colors (Dark Theme)
- Background: `#0F0F0F` (true black)
- Text: `#E8E8E8` (off-white)
- Accent: `#F08B6E` (brighter coral)

### Spacing
8px base unit system:
- `--space-1`: 8px
- `--space-2`: 16px
- `--space-4`: 32px
- `--space-8`: 64px

## ♿ Accessibility

- Semantic HTML5 elements
- ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Color contrast compliance (WCAG AA)
- Reduced motion support
- Screen reader friendly

## 📱 Responsive Breakpoints

- **Desktop**: 1024px+
- **Tablet**: 768px - 1023px
- **Mobile**: < 768px

## 🔮 Future Enhancements

Potential additions:
- [ ] Blog section (Jekyll integration)
- [ ] Publication list from BibTeX
- [ ] Interactive physics visualizations
- [ ] Multilingual support (French/English toggle)
- [ ] PWA capabilities
- [ ] Contact form with backend
- [ ] Analytics integration

## 📄 License

Personal portfolio - All rights reserved.

## 🙏 Acknowledgments

Built with modern web standards and best practices. Design inspired by Swiss Modernism and contemporary academic portfolios.

---

**Last Updated**: 2025
**Built by**: [NAME]
