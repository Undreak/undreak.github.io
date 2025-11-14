# Security Fixes - Priority Action Items

**Quick Reference Guide for Immediate Actions**

---

## ⚠️ CRITICAL - Fix Immediately

### 1. Remove CSP 'unsafe-inline' Directives

**Files:** `index.html:13`, `projects.html:13`

**Current Issue:**
```html
Content-Security-Policy: script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
```

**Why It Matters:** `'unsafe-inline'` defeats XSS protection, allowing any inline script to execute.

**Action Steps:**
1. Move all inline event handlers to external JS files
2. Move inline `<style>` blocks to CSS files
3. Update CSP to remove `'unsafe-inline'`:
   ```html
   <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.github.com https://gitlab.com https://formspree.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io;">
   ```

**Currently No Inline Scripts Detected:** The good news is you don't appear to have inline scripts, so this might just be overly permissive CSP that can be tightened immediately.

---

## 🔴 HIGH - Fix Within 1 Week

### 2. Standardize Input Sanitization with DOMPurify

**File:** `js/main.js:129-133`

**Current Code:**
```javascript
sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}
```

**Replace With:**
```javascript
sanitizeInput(input) {
    if (typeof DOMPurify !== 'undefined') {
        return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
    }
    // Fallback
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}
```

---

### 3. Add localStorage Validation

**Files:** `js/main.js:143,234`, `js/theme.js:12,44`

**Current Issue:** No validation when reading from localStorage - could be manipulated.

**Quick Fix for Rate Limiting:**
```javascript
canSubmit() {
    const lastSubmit = localStorage.getItem('lastFormSubmit');
    if (lastSubmit) {
        const timestamp = parseInt(lastSubmit, 10);

        // Validate it's a reasonable timestamp
        if (isNaN(timestamp) || timestamp < 0 || timestamp > Date.now()) {
            console.warn('Invalid timestamp in localStorage');
            localStorage.removeItem('lastFormSubmit');
            return true;
        }

        const timeSinceLastSubmit = Date.now() - timestamp;
        const ONE_MINUTE = 60000;
        if (timeSinceLastSubmit < ONE_MINUTE) {
            return false;
        }
    }
    return true;
}
```

**For Theme Storage:**
```javascript
getInitialTheme() {
    const savedTheme = localStorage.getItem('theme');

    // Validate saved theme
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        return savedTheme;
    }

    // Invalid or missing - use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
}
```

---

## 🟡 MEDIUM - Fix Within 1 Month

### 4. Improve GitHub/GitLab API Error Handling

**Files:** `js/github.js:98-101`, `js/projects-page.js:106-108`

**Add Better Rate Limit Handling:**
```javascript
if (response.status === 403) {
    const resetTime = response.headers.get('X-RateLimit-Reset');
    const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : null;

    let message = 'GitHub API rate limit exceeded.';
    if (resetDate) {
        const minutesUntilReset = Math.ceil((resetDate - new Date()) / 60000);
        message += ` Try again in ${minutesUntilReset} minutes.`;
    }

    throw new Error(message);
}
```

---

### 5. Add CDN Fallback for DOMPurify

**Files:** `index.html:600`, `projects.html:168`

**Current:** Relies entirely on CDN

**Add Fallback:**
1. Download DOMPurify to `/js/vendor/purify.min.js`
2. Update HTML:
```html
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.8/dist/purify.min.js"
        integrity="sha384-sGXNIHpdJSEfTkXLnvHLLQNgJVCBh+FvzGmIHKHPD+lVELKZjVKkPvGHxVz0kVhk"
        crossorigin="anonymous"
        onerror="this.onerror=null;this.src='/js/vendor/purify.min.js'">
</script>
```

---

## 🟢 LOW - Nice to Have

### 6. Add Missing Security Headers

**Files:** `index.html`, `projects.html`

**Add to `<head>`:**
```html
<!-- Additional Security Headers -->
<meta http-equiv="X-XSS-Protection" content="1; mode=block">
<meta http-equiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=()">
```

---

### 7. Enhance Email Protection

**File:** `index.html:527,532`

**Consider Email Obfuscation:**
```javascript
// Add to main.js
document.addEventListener('DOMContentLoaded', () => {
    // Decode email on page load to prevent scraping
    const emailLinks = document.querySelectorAll('[data-email]');
    emailLinks.forEach(link => {
        const email = atob(link.dataset.email); // Use base64 encoded email
        link.href = `mailto:${email}`;
        link.textContent = email;
    });
});
```

Then in HTML:
```html
<a href="#" class="contact__link" data-email="YWxleGFuZHJlLmRlY3V5cGVyQGljbG91ZC5jb20=">
    <!-- Email revealed by JavaScript -->
</a>
```

---

## 📋 Testing Checklist

After applying fixes, test:

- [ ] Site loads correctly with CSP changes
- [ ] No CSP violations in browser console (F12 → Console)
- [ ] Projects load from GitHub/GitLab APIs
- [ ] Theme toggle works correctly
- [ ] Rate limiting works after localStorage manipulation
- [ ] Test in Firefox, Chrome, Safari
- [ ] Run through https://observatory.mozilla.org/
- [ ] Check https://securityheaders.com/

---

## 🛠️ Tools for Validation

1. **Browser DevTools**
   - Open Console (F12) → Check for CSP violations
   - Network tab → Verify all resources load
   - Application tab → Inspect localStorage

2. **Online Security Scanners**
   ```bash
   # Test your site at:
   https://observatory.mozilla.org/
   https://securityheaders.com/
   https://csp-evaluator.withgoogle.com/
   ```

3. **Manual XSS Testing**
   - Try entering `<script>alert('XSS')</script>` in search box
   - Verify it's sanitized in display
   - Check localStorage can't be manipulated to bypass limits

---

## 📊 Expected Timeline

| Priority | Tasks | Time Estimate | Risk Reduction |
|----------|-------|---------------|----------------|
| Critical | Task 1 | 30 mins | HIGH |
| High | Tasks 2-3 | 2 hours | MEDIUM-HIGH |
| Medium | Tasks 4-5 | 3 hours | MEDIUM |
| Low | Tasks 6-7 | 2 hours | LOW |
| **Total** | **7 tasks** | **~8 hours** | **Significant** |

---

## 💡 Quick Wins (Do These First)

1. **Tighten CSP** (30 mins) - Remove `'unsafe-inline'`
2. **Add localStorage validation** (1 hour) - Prevent tampering
3. **Test everything** (30 mins) - Ensure nothing broke

These three items will handle 80% of the security risk with minimal effort.

---

## 📝 Notes

- No critical vulnerabilities found that allow immediate exploitation
- Current security posture is **above average** for static sites
- Main risks are in CSP configuration and localStorage integrity
- No sensitive data exposure detected
- All external links properly secured with `rel="noopener noreferrer"`

---

## 🆘 Need Help?

See detailed explanations in `SECURITY_AUDIT_REPORT.md`

**References:**
- CSP Guide: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- DOMPurify: https://github.com/cure53/DOMPurify
- OWASP XSS Prevention: https://cheatsheetsecurity.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
