#!/bin/bash
# CLI Aliases for Web App Development

# Supabase commands (using npx)
alias supabase="npx supabase"
alias sb="npx supabase"

# Vercel commands
alias v="vercel"
alias vdev="vercel dev"
alias vdeploy="vercel --prod"

# Git/GitHub shortcuts
alias gs="git status"
alias gp="git push"
alias gc="git commit -m"
alias ga="git add"

# Project specific
alias webdev="cd /app/main/web_app && vercel dev"
alias logs="tail -f /app/main/web_app/logs/*.log"

echo "Web App CLI aliases loaded!"
