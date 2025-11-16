# Articles Directory

This directory contains all your publication articles and blog posts.

## Creating a New Article

### Quick Start

1. **Copy the template**:
   ```bash
   cp article-template.html your-article-name.html
   ```

2. **Edit the new file**:
   - Replace all `[PLACEHOLDER]` text with your content
   - Write your article content in the `<div class="article__content">` section
   - Update the `<title>` and meta tags for SEO

3. **Link from homepage**:
   - Open `../index.html`
   - Find the Publications section
   - Convert a publication card to a link:
     ```html
     <a href="articles/your-article-name.html" class="publication-card publication-card--link">
         <!-- card content -->
     </a>
     ```

## HTML Elements Guide

### Headings
```html
<h2>Main Section</h2>
<h3>Subsection</h3>
<h4>Minor Heading</h4>
```

### Paragraphs and Text
```html
<p>Regular paragraph text</p>
<p><strong>Bold text</strong> and <em>italic text</em></p>
```

### Lists
```html
<ul>
    <li>Unordered list item</li>
</ul>

<ol>
    <li>Ordered list item</li>
</ol>
```

### Blockquotes (Important Callouts)
```html
<blockquote>
    <p>Important quote or callout text</p>
</blockquote>
```

### Code Blocks
```html
<pre><code>Your code or equations here</code></pre>
<p>Inline <code>code snippets</code> in text</p>
```

### Images
With actual image:
```html
<div class="article__image">
    <img src="path/to/image.jpg" alt="Description">
    <p class="article__image-caption">Caption text</p>
</div>
```

Placeholder (until you add real image):
```html
<div class="article__image">
    <div class="article__image-placeholder">
        Image description - placeholder
    </div>
    <p class="article__image-caption">Caption text</p>
</div>
```

### Info Boxes
```html
<div class="article__info-box">
    <p><strong>Label:</strong> Information</p>
    <p><strong>Another field:</strong> More info</p>
</div>
```

### Expandable Sections
```html
<details>
    <summary>Click to expand</summary>
    <p>Hidden content that shows when clicked</p>
</details>
```

### Section Dividers
```html
<hr>
```

### Resources Section (at end of article)
```html
<section class="article__resources">
    <h2>Resources</h2>
    <ul>
        <li>📄 <strong>Full Paper</strong> - <a href="#">Link</a></li>
        <li>💻 <strong>Code Repository</strong> - <a href="#">Link</a></li>
        <li>🔬 <strong>Related Work</strong> - <a href="#">Link</a></li>
    </ul>
</section>
```

## Metadata to Update

In the `<head>` section:

```html
<title>[Your Title] | Alexandre De Cuyper</title>
<meta name="description" content="[Short SEO description]">
<meta property="og:title" content="[Social media title]">
<meta property="og:description" content="[Social media description]">
```

## Publication Type Icons

Choose the appropriate icon for your article type:

**Book icon (thesis, papers):**
```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
</svg>
```

**Presentation icon:**
```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
</svg>
```

## Example Articles

- `polymer-wetting-dynamics.html` - Full example of a research article

## Tips

1. **Keep it readable**: Use plenty of white space and break up long paragraphs
2. **Use images**: Visual content makes articles more engaging
3. **Add context**: Explain why the work matters, not just what you did
4. **Tell a story**: Start with the big picture, then dive into details
5. **Include resources**: Link to related papers, code, or data
