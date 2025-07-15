# CLI Tools Configuration

## Installed Tools

### Supabase CLI
- Status: Installed
- Usage: `supabase init`, `supabase start`, `supabase db push`

### Vercel CLI  
- Status: Installed
- Usage: `vercel`, `vercel dev`, `vercel deploy`

### GitHub CLI (or git)
- Status: Configured
- Usage: `gh repo view`, `git push`, `git pull`

### Redis CLI (for Upstash)
- Status: Available
- Usage: `redis-cli -u $REDIS_URL`

## Quick Commands

```bash
# Start local development
vercel dev

# Deploy to Vercel
vercel --prod

# Push to GitHub
git push origin main

# Supabase migrations
supabase db diff
supabase db push

# Connect to Redis
redis-cli -u "$Redis_TCP_Endpoint"
```
