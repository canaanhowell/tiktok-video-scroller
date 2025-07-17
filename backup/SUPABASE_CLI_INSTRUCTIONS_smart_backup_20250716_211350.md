# Supabase CLI Deployment Instructions

## ✅ What's Ready

1. **Supabase CLI installed**: Version 2.31.4
2. **Project linked**: aanszwtmjvfskdettlxm 
3. **Migration created**: `supabase/migrations/20250716142325_video_feed_algorithm.sql`
4. **Access token configured**: In `.supabase-access-token`

## 🚀 To Deploy Using CLI

### Option 1: If You Have Database Password

```bash
# Set access token
export SUPABASE_ACCESS_TOKEN=$(cat .supabase-access-token)

# Push migration to remote database
npx supabase db push --password YOUR_DATABASE_PASSWORD
```

### Option 2: Reset Database Password

1. Go to: https://supabase.com/dashboard/project/aanszwtmjvfskdettlxm/settings/database
2. Click "Reset Database Password"
3. Save the new password
4. Run:
   ```bash
   export SUPABASE_ACCESS_TOKEN=$(cat .supabase-access-token)
   npx supabase db push --password NEW_PASSWORD
   ```

### Option 3: Use Dashboard (Easiest)

1. Go to SQL Editor: https://supabase.com/dashboard/project/aanszwtmjvfskdettlxm/sql/new
2. Copy contents of: `/app/main/web_app/scripts/database/complete_migration.sql`
3. Paste and click "Run"

## 📋 What Gets Deployed

The migration creates:
- 9 tables for video feed algorithm
- Indexes for performance
- Row Level Security policies
- Update timestamp triggers
- 13 sample categories (including Romance)

## 🔍 Verify Deployment

After deployment, check:

```bash
# List remote tables
export SUPABASE_ACCESS_TOKEN=$(cat .supabase-access-token)
npx supabase db remote status

# Or check in dashboard
# https://supabase.com/dashboard/project/aanszwtmjvfskdettlxm/editor
```

## 🎯 Next Steps

1. Deploy the app: `npm run deploy:prod`
2. Test analytics: `python scripts/test_analytics.py`
3. Monitor cron jobs in Vercel dashboard

## 🆘 Troubleshooting

**"Invalid access token" error**
- Token is in `.supabase-access-token`
- Make sure to export it: `export SUPABASE_ACCESS_TOKEN=$(cat .supabase-access-token)`

**"failed SASL auth" error**
- This means wrong database password
- Reset it in dashboard settings

**"relation does not exist" errors**
- Tables weren't created yet
- Use the complete migration file that creates tables first

The migration is idempotent (safe to run multiple times) with `IF NOT EXISTS` clauses.