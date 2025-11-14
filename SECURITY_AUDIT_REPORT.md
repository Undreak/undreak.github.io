# Security Audit Report
**Project:** undreak.github.io
**Date:** 2025-11-14
**Auditor:** Claude (Automated Security Analysis)
**Scope:** Full codebase security review

---

## Executive Summary

This report presents a comprehensive security audit of the undreak.github.io personal portfolio website. The audit examined HTML, JavaScript, CSS files, configuration files, and third-party integrations for common web vulnerabilities including XSS, CSRF, injection attacks, data exposure, and insecure configurations.

**Overall Security Rating: GOOD ✓**

The codebase demonstrates strong security awareness with multiple protective measures already in place. Several areas require attention, particularly around Content Security Policy configuration and input sanitization practices.

---

## 1. Vulnerabilities Found

### 1.1 HIGH SEVERITY

#### CSP-001: Content Security Policy Allows 'unsafe-inline'
**Location:** `index.html:13`, `projects.html:13`
**Severity:** HIGH
**Description:** The Content Security Policy includes `'unsafe-inline'` for both `script-src` and `style-src` directives.

```html
Content-Security-Policy: script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
```

**Risk:** This weakens XSS protection by allowing inline scripts and styles to execute, which is a primary attack vector for cross-site scripting.

**Recommendation:**
- Remove `'unsafe-inline'` from `script-src` and `style-src`
- Move all inline scripts to external `.js` files
- Move all inline styles to external `.css` files or use CSS classes
- Use nonces or hashes for any required inline scripts/styles

**References:**
- OWASP CSP Cheat Sheet: https://cheatsheetsecurity.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html

---

### 1.2 MEDIUM SEVERITY

#### XSS-001: Incomplete Input Sanitization in Form Handler
**Location:** `js/main.js:129-133`
**Severity:** MEDIUM
**Description:** The form handler uses basic HTML escaping but doesn't leverage DOMPurify which is already loaded.

```javascript
sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}
```

**Risk:** While the current implementation is safe for basic cases, it's inconsistent with the project's use of DOMPurify elsewhere and could be bypassed in edge cases.

**Recommendation:**
- Use DOMPurify consistently across all sanitization functions
- Replace manual sanitization with: `DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })`

---

#### API-001: GitHub API Rate Limiting Without Fallback
**Location:** `js/github.js:98-101`, `js/projects-page.js:106-108`
**Severity:** MEDIUM
**Description:** GitHub API calls handle 403 errors but don't provide meaningful user feedback or recovery options.

**Risk:** Users may experience degraded functionality when rate limits are hit, with no clear indication of when service will resume.

**Recommendation:**
- Display rate limit reset time to users
- Implement exponential backoff for retries
- Consider caching API responses with reasonable TTL
- Add a manual refresh button

---

#### STORAGE-001: Unprotected localStorage Usage
**Location:** `js/main.js:143,234`, `js/theme.js:12,44`
**Severity:** MEDIUM
**Description:** localStorage is used without data validation or integrity checks.

```javascript
const lastSubmit = localStorage.getItem('lastFormSubmit');
// No validation that this is a valid timestamp
```

**Risk:** Malicious scripts (if XSS occurs) or browser extensions could manipulate localStorage values to bypass rate limiting or cause unexpected behavior.

**Recommendation:**
- Validate and sanitize all data read from localStorage
- Add integrity checks (e.g., HMAC) for critical values like rate limit timestamps
- Use try-catch blocks around all localStorage operations
- Consider using sessionStorage for rate limiting instead

---

#### FORM-001: Contact Form Placeholder Configuration Exposed
**Location:** `index.html:562`, `js/main.js:158`
**Severity:** LOW-MEDIUM
**Description:** The contact form includes a placeholder action URL (`YOUR_FORM_ID`) which is correctly disabled, but still appears in the HTML.

**Risk:** Provides information about backend service selection to potential attackers. Low risk since form is properly disabled.

**Recommendation:**
- Remove the form entirely until configured, or
- Use a generic placeholder that doesn't reveal the backend service
- Consider implementing a server-side contact endpoint instead of third-party service

---

### 1.3 LOW SEVERITY

#### INFO-001: Email Address Exposed in Source Code
**Location:** `index.html:42,527,532`
**Severity:** LOW (Information Disclosure)
**Description:** Email address is visible in multiple locations including structured data and contact section.

```html
"email": "alexandre.decuyper@icloud.com"
```

**Risk:** Email address is publicly exposed and can be harvested by bots for spam. However, this is likely intentional for a public contact page.

**Recommendation:**
- Consider using email obfuscation techniques
- Implement contact form as primary contact method
- Add CAPTCHA protection when form is enabled
- Monitor for spam and have filtering in place

---

#### SEC-001: Missing Security Headers (Server-Side)
**Location:** N/A (GitHub Pages configuration)
**Severity:** LOW
**Description:** Security headers are implemented via meta tags, but server-side headers would be more robust.

**Current Implementation:**
```html
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
```

**Risk:** Meta tag security headers can be removed or modified by client-side attacks, though they're better than nothing.

**Recommendation:**
- Request GitHub Pages support for custom headers via `_headers` file (if supported)
- Document that meta tags are used due to platform limitations
- Consider adding:
  - `X-XSS-Protection: 1; mode=block`
  - `Permissions-Policy` header
  - `Strict-Transport-Security` (must be server-side only)

---

#### DEPS-001: External CDN Dependency Without Fallback
**Location:** `index.html:600`, `projects.html:168`
**Severity:** LOW
**Description:** DOMPurify is loaded from CDN without a local fallback.

**Risk:** If cdn.jsdelivr.net is down or blocked, sanitization will fail causing features to break.

**Recommendation:**
```html
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.8/dist/purify.min.js"
        integrity="sha384-..." crossorigin="anonymous"
        onerror="this.onerror=null; this.src='/js/vendor/purify.min.js'">
</script>
```

---

#### REGEX-001: Weak Email Validation Pattern
**Location:** `js/main.js:137`
**Severity:** LOW
**Description:** Email validation regex is basic and may allow some invalid emails.

```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

**Risk:** May accept malformed email addresses. However, backend validation (Formspree) will likely reject them anyway.

**Recommendation:**
- Use a more robust email validation pattern
- Or rely on HTML5 input type="email" validation
- Add note that final validation happens server-side

---

## 2. Security Strengths

### 2.1 Excellent XSS Protection Measures

✓ **DOMPurify Integration**
The project correctly uses DOMPurify (v3.0.8) with SRI integrity checking:
```html
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.8/dist/purify.min.js"
        integrity="sha384-sGXNIHpdJSEfTkXLnvHLLQNgJVCBh+FvzGmIHKHPD+lVELKZjVKkPvGHxVz0kVhk"
        crossorigin="anonymous">
</script>
```

✓ **URL Validation**
`js/github.js:24-36`, `js/projects-page.js:31-43`
```javascript
isValidURL(url) {
    if (!url) return null;
    try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return null;
        }
        return parsed.href;
    } catch {
        return null;
    }
}
```

✓ **Text Sanitization**
Multiple sanitization points using DOMPurify with `ALLOWED_TAGS: []` configuration.

---

### 2.2 Content Security Policy Implementation

✓ **CSP Headers Present**
Both pages include CSP directives covering:
- `default-src 'self'` - Restricts default loading
- `frame-ancestors 'none'` - Prevents clickjacking
- `base-uri 'self'` - Prevents base tag injection
- `form-action 'self'` - Restricts form submissions

✓ **Comprehensive Directives**
```
connect-src 'self' https://api.github.com https://gitlab.com https://formspree.io
```
Properly whitelists necessary API endpoints.

---

### 2.3 Secure Coding Practices

✓ **No SQL Injection Risk** - Static site, no database queries

✓ **Safe Link Attributes**
All external links include:
```html
target="_blank" rel="noopener noreferrer"
```
Prevents tab nabbing and information leakage.

✓ **ARIA Attributes**
Proper accessibility attributes reduce social engineering attack surface:
```html
<button class="nav__toggle" aria-label="Toggle menu" aria-expanded="false">
```

✓ **Rate Limiting**
Form submission includes client-side rate limiting:
```javascript
const timeSinceLastSubmit = Date.now() - parseInt(lastSubmit);
const ONE_MINUTE = 60000;
if (timeSinceLastSubmit < ONE_MINUTE) {
    return false;
}
```

✓ **Timeout Protection**
API requests include abort controllers with timeouts:
```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);
signal: AbortSignal.timeout(15000)
```

✓ **Honeypot Field**
Contact form includes anti-bot honeypot field:
```html
<input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off">
```

✓ **.gitignore Configuration**
Properly excludes sensitive files:
```
.env
.env.local
.env.*.local
```

---

### 2.4 Third-Party Integration Security

✓ **Subresource Integrity (SRI)**
DOMPurify loaded with integrity hash verification

✓ **Preconnect Optimization with Security**
```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

✓ **No Hardcoded Secrets**
No API keys, tokens, or credentials found in codebase

---

## 3. Compliance & Best Practices

### 3.1 OWASP Top 10 (2021) Analysis

| Risk | Status | Notes |
|------|--------|-------|
| A01: Broken Access Control | ✓ N/A | Static site, no authentication |
| A02: Cryptographic Failures | ✓ PASS | No sensitive data storage |
| A03: Injection | ⚠ PARTIAL | XSS mitigations in place, CSP needs improvement |
| A04: Insecure Design | ✓ PASS | Good security architecture |
| A05: Security Misconfiguration | ⚠ NEEDS WORK | CSP unsafe-inline, missing some headers |
| A06: Vulnerable Components | ✓ PASS | Using latest DOMPurify, no npm packages |
| A07: Authentication Failures | ✓ N/A | No authentication system |
| A08: Data Integrity Failures | ⚠ PARTIAL | No integrity checks on localStorage |
| A09: Logging Failures | ✓ N/A | Static site |
| A10: SSRF | ✓ N/A | No server-side requests |

---

### 3.2 Privacy Considerations

✓ **No Analytics/Tracking**
No Google Analytics, tracking pixels, or third-party analytics detected.

✓ **No Cookies**
Site doesn't use cookies - uses localStorage only for theme and rate limiting.

⚠ **Third-Party Connections**
- Google Fonts (fonts.googleapis.com, fonts.gstatic.com)
- jsDelivr CDN (cdn.jsdelivr.net)
- GitHub API (api.github.com)
- GitLab API (gitlab.com)

**Recommendation:** Add privacy policy if collecting any user data through contact form.

---

### 3.3 Accessibility Security

✓ **Keyboard Navigation**
Focus trap in mobile menu prevents keyboard confusion attacks:
```javascript
// Trap focus
if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
    }
}
```

✓ **Screen Reader Support**
Proper ARIA labels reduce phishing risk for visually impaired users.

---

## 4. Attack Surface Analysis

### 4.1 Client-Side Attack Vectors

**Input Points:**
1. Contact form (currently disabled) - SECURED with validation
2. Search box in projects page - SECURED with sanitization
3. URL parameters - NOT USED (no query param handling)
4. localStorage - PARTIAL (no integrity checks)

**Output Points:**
1. Dynamic HTML generation (project cards) - SECURED with DOMPurify
2. Error messages - SECURED with sanitization
3. Form status messages - SECURED

---

### 4.2 External Dependencies

| Dependency | Version | Integrity | Risk Level |
|------------|---------|-----------|------------|
| DOMPurify | 3.0.8 | ✓ SRI | LOW |
| Google Fonts | Dynamic | ✗ No SRI | LOW |
| GitHub API | v3 | N/A (runtime) | MEDIUM |
| GitLab API | v4 | N/A (runtime) | MEDIUM |
| Formspree | N/A | Not configured | LOW |

---

## 5. Recommendations Summary

### 5.1 Critical (Fix Immediately)

1. **Remove CSP 'unsafe-inline'**
   - Refactor inline scripts to external files
   - Use CSP nonces or hashes if inline code is unavoidable
   - Target: `index.html:13`, `projects.html:13`

2. **Standardize Input Sanitization**
   - Replace manual sanitization with DOMPurify everywhere
   - Target: `js/main.js:129-133`

---

### 5.2 High Priority (Fix Within 1 Month)

3. **Implement localStorage Integrity Checks**
   - Add validation for stored timestamps
   - Consider signing critical values
   - Target: `js/main.js:143,234`, `js/theme.js`

4. **Improve API Error Handling**
   - Display rate limit reset times
   - Implement caching layer
   - Add retry logic with exponential backoff
   - Target: `js/github.js`, `js/projects-page.js`

5. **Add Security Headers**
   - Implement server-side headers if possible
   - Add Permissions-Policy
   - Consider adding report-uri to CSP for monitoring

---

### 5.3 Medium Priority (Fix Within 3 Months)

6. **CDN Fallback Strategy**
   - Add local fallback for DOMPurify
   - Consider self-hosting critical dependencies

7. **Enhanced Email Protection**
   - Implement email obfuscation
   - Add CAPTCHA when contact form is enabled

8. **Privacy Policy**
   - Add privacy policy page
   - Document third-party connections
   - Explain data handling practices

---

### 5.4 Low Priority (Nice to Have)

9. **Monitoring and Logging**
   - Add CSP violation reporting
   - Monitor API rate limit hits
   - Track client-side errors

10. **Security Headers Enhancement**
    - Add Expect-CT header
    - Implement HSTS (server-side only)
    - Add X-XSS-Protection header

---

## 6. Security Testing Recommendations

### 6.1 Recommended Tests

1. **Manual Security Testing**
   - [ ] Test XSS payloads in search box
   - [ ] Test XSS payloads in contact form (when enabled)
   - [ ] Verify CSP violations in browser console
   - [ ] Test rate limiting bypass attempts
   - [ ] Verify localStorage tampering doesn't break functionality

2. **Automated Scanning**
   - [ ] Run OWASP ZAP scan
   - [ ] Use Mozilla Observatory: https://observatory.mozilla.org/
   - [ ] SecurityHeaders.com check: https://securityheaders.com/
   - [ ] Use Snyk for dependency scanning (if adding npm packages)

3. **Browser Testing**
   - [ ] Test in browsers with strict CSP enforcement
   - [ ] Verify behavior with JavaScript disabled
   - [ ] Test with browser security extensions enabled

---

## 7. Incident Response

### 7.1 If Vulnerability Discovered

1. **Assessment:** Determine scope and severity
2. **Remediation:** Apply fix immediately for HIGH/CRITICAL
3. **Testing:** Verify fix doesn't break functionality
4. **Deployment:** Push to GitHub Pages
5. **Monitoring:** Watch for exploitation attempts
6. **Disclosure:** Consider responsible disclosure if affecting others

### 7.2 Security Contacts

- Repository: https://github.com/Undreak/undreak.github.io
- Contact: alexandre.decuyper@icloud.com

---

## 8. Compliance Checklist

- [x] No hardcoded secrets or credentials
- [x] All external links use rel="noopener noreferrer"
- [x] Content Security Policy implemented
- [x] XSS protection measures in place
- [x] Input validation on all user inputs
- [x] Output encoding/sanitization
- [x] HTTPS enforced (via GitHub Pages)
- [x] Secure headers implemented (meta tags)
- [ ] Subresource Integrity on all external scripts (only DOMPurify)
- [ ] No unsafe-inline in CSP
- [x] No sensitive data in client-side code
- [x] No SQL injection vectors (static site)
- [x] CSRF protection (no state-changing operations)

---

## 9. Long-Term Security Roadmap

### Phase 1 (Month 1-2)
- Fix CSP unsafe-inline
- Implement localStorage integrity
- Enhance API error handling

### Phase 2 (Month 3-4)
- Add server-side contact form endpoint
- Implement comprehensive monitoring
- Add automated security testing to CI/CD

### Phase 3 (Month 5-6)
- Security audit review
- Penetration testing
- Privacy policy implementation

---

## 10. Conclusion

The undreak.github.io project demonstrates **strong security fundamentals** with thoughtful implementation of XSS protections, URL validation, and secure coding practices. The primary areas for improvement are:

1. Removing CSP `unsafe-inline` directives
2. Enhancing localStorage security
3. Improving API error handling

**Risk Assessment:**
- **Current Risk Level:** LOW-MEDIUM
- **Post-Remediation Risk Level:** LOW

The codebase is significantly more secure than typical personal portfolio sites, showing clear security awareness in its design. With the recommended changes, this project would represent a security best practice example for static sites.

---

## Appendix A: Security Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- CSP Guide: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- DOMPurify Documentation: https://github.com/cure53/DOMPurify
- GitHub Pages Security: https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
- Web Security Testing Guide: https://owasp.org/www-project-web-security-testing-guide/

---

## Appendix B: Code Examples for Fixes

### B.1 Refactored CSP (Remove unsafe-inline)

**Current:**
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; ...">
```

**Recommended:**
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' https://fonts.googleapis.com; ...">
```

Move all inline scripts to `js/inline.js` and inline styles to CSS files.

---

### B.2 Enhanced localStorage Validation

```javascript
class SecureStorage {
    static get(key, validator) {
        try {
            const value = localStorage.getItem(key);
            if (!value) return null;

            const parsed = JSON.parse(value);

            // Validate structure
            if (!validator(parsed)) {
                console.warn(`Invalid data for key: ${key}`);
                this.remove(key);
                return null;
            }

            return parsed;
        } catch (e) {
            console.error('Storage read error:', e);
            return null;
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage write error:', e);
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Storage remove error:', e);
        }
    }
}

// Usage
const lastSubmit = SecureStorage.get('lastFormSubmit', (val) => {
    return typeof val === 'number' && val > 0 && val <= Date.now();
});
```

---

### B.3 CDN Fallback Pattern

```html
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.8/dist/purify.min.js"
        integrity="sha384-sGXNIHpdJSEfTkXLnvHLLQNgJVCBh+FvzGmIHKHPD+lVELKZjVKkPvGHxVz0kVhk"
        crossorigin="anonymous"
        onerror="loadDOMPurifyFallback()">
</script>
<script>
function loadDOMPurifyFallback() {
    console.warn('CDN failed, loading local DOMPurify');
    const script = document.createElement('script');
    script.src = '/js/vendor/purify.min.js';
    script.integrity = 'sha384-sGXNIHpdJSEfTkXLnvHLLQNgJVCBh+FvzGmIHKHPD+lVELKZjVKkPvGHxVz0kVhk';
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
}
</script>
```

---

**End of Security Audit Report**
