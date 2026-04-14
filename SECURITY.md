# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in the Coway Malaysia Order System, please report it responsibly.

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please send an email to:

📧 **[security@cowayagent.com](mailto:security@cowayagent.com)**

Please include the following information in your report:

- Type of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Response Timeline

| Timeframe | Action |
|:---|:---|
| Within 48 hours | Acknowledgment of receipt |
| Within 7 days | Initial assessment and confirmation |
| Within 30 days | Patch released (depending on severity) |

## Supported Versions

| Version | Supported |
|:---|:---:|
| Latest (main branch) | ✅ |
| Older versions | ❌ |

## Security Best Practices

This project implements the following security measures:

- Admin panel protected by 2-factor authentication (password + 6-digit PIN)
- Image uploads processed through secure Cloudflare Workers
- GitHub API tokens stored as environment variables (never exposed in frontend)
- HTTPS enforced on all connections
- Content Security Policy (CSP) headers configured

## Known Vulnerabilities

There are currently **no known vulnerabilities**.

## Bug Bounty

At this time, we do not offer a paid bug bounty program. However, we greatly appreciate responsible disclosure and will publicly acknowledge your contribution (if desired).

---

Thank you for helping keep Coway Malaysia Order System secure!
