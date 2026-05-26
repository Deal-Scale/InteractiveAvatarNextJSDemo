# 🚀 Deployment Guide - Multi-Platform

This guide covers deploying DealScale to various hosting platforms including Cloudflare, Hetzner, Vercel, and self-hosted options.

## 📋 Available Platforms

| Platform | Type | Best For | Difficulty |
|----------|------|----------|------------|
| **Cloudflare Pages** | CDN/Edge | Global performance, static sites | 🟢 Easy |
| **Cloudflare Workers** | Serverless | API routes, dynamic content | 🟡 Medium |
| **Hetzner Cloud** | VPS/Cloud | Full control, Docker, databases | 🔴 Advanced |
| **Vercel** | Platform | Next.js optimized, easy scaling | 🟢 Easy |
| **Self-Hosted** | Custom | Complete control, any stack | 🔴 Advanced |

## 🗂️ Quick Start by Platform

### Cloudflare Pages (Recommended for Static Site)
```bash
# 1. Install Wrangler CLI
npm i -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Deploy
wrangler pages deploy out/ --compatibility-date=2024-01-01
```

### Hetzner Cloud (Recommended for Full-Stack)
```bash
# 1. Create Hetzner account and server
# 2. Setup Docker and Docker Compose
# 3. Deploy with docker-compose.yml
docker-compose up -d
```

---

## 📁 Platform-Specific Guides

- [Cloudflare Deployment](./cloudflare/)
- [Hetzner Deployment](./hetzner/)
- [Vercel Deployment](./vercel/)
- [Self-Hosted Deployment](./self-hosted/)

## 🔧 Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database setup (if needed)
- [ ] Content folder excluded from deployment
- [ ] Build process tested locally
- [ ] Health check endpoint working

## 🚨 Important Notes

- **Content Folder**: Always exclude `content/` and `strapi-export/` from deployments
- **Environment Variables**: Never commit `.env` files to git
- **Build Output**: Use appropriate output directory (`out/`, `dist/`, etc.)
- **Database**: For production, use managed databases (Supabase, MongoDB Atlas, etc.)

## 🆘 Troubleshooting

### Build Errors
- Check Node.js version (use 20.x)
- Verify all dependencies installed
- Check for missing environment variables

### Deployment Errors
- Verify ignore files are correct
- Check platform-specific limits (file size, etc.)
- Ensure build output exists

---

*Last updated: $(date)*
*For platform-specific issues, see individual deployment guides.*
