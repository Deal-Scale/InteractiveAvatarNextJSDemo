# JWT Security Analysis: Language-Agnostic Grep Checks

**Purpose:**
Detect insecure JWT handling patterns in any codebase using grep/ripgrep, before production deployment. This is a language-agnostic approach for CI/CD pipelines.

---

## 1. **Why JWT Checks Matter**
- JWTs are often mishandled, leading to critical security bugs (e.g., skipping verification, using weak secrets, accepting unsigned tokens).
- Automated static analysis tools may miss custom or edge-case insecure patterns.
- Grep-based checks provide a lightweight, universal safety net.

---

## 2. **Common Insecure JWT Patterns**
- Decoding JWTs without verifying signatures
- Explicitly setting `verify=False` or equivalent
- Accepting the `none` algorithm
- Hardcoding secrets/keys
- Ignoring expiration (`ignoreExpiration: true`)
- Missing required claims (e.g., `exp`, `aud`, `iss`)

---

## 3. **Custom Grep/Ripgrep Commands**

### **Python: Detecting decode with verify=False**
```sh
grep -rniE 'jwt\.decode\s*\(.*verify\s*=\s*False' .
```

### **General: Detecting verify=False/True**
```sh
grep -rniE 'verify\s*=\s*False' .
grep -rniE 'verify_signature\s*=\s*False' .
```

### **Detecting decode/verify without explicit verification**
```sh
grep -rniE 'jwt\.decode\s*\(' .
# Review all matches for missing verify argument (Python, JS, etc)
```

### **Detecting 'none' Algorithm**
```sh
grep -rniE '(algorithms?\s*[:=]\s*[\[\(]?(["'\'`])none(["'\'`])' .
```

### **Detecting Hardcoded Secrets**
```sh
grep -rniE '(secret|key)\s*[:=]\s*["'\'`][^"'\'`]{8,}["'\'`]' .
```

### **Detecting Ignored Expiration**
```sh
grep -rni 'ignoreExpiration\s*[:=]\s*true' .
```

---

## 4. **How to Use in CI/CD**
- Run these commands in a CI/CD job before deploy.
- Review all matches; refactor any insecure code.
- Make this a required pre-deploy step for prod readiness.

---

## 5. **Best Practices**
- Always verify JWT signatures and algorithms.
- Never use `verify=False` or accept the `none` algorithm.
- Never hardcode secrets; use environment variables.
- Always validate required claims (`exp`, `aud`, `iss`, etc.).
- Never set `ignoreExpiration: true`.

---

## 6. **References**
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [JWT Security Best Practices (Auth0)](https://auth0.com/blog/jwt-best-practices/)

---

*Combine these grep checks with SAST, code review, and regular dependency scanning for maximum JWT security.*
