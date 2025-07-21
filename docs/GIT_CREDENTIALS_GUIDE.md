# Git Push and Commit Guide Using .env Credentials

This guide explains how to use GitHub credentials stored in your `.env` file for pushing commits.

## Prerequisites

Your `.env` file should contain:
```env
GITHUB_USERNAME=your_github_username
GITHUB_PAT=your_github_personal_access_token
GITHUB_REPO=your_repository_name
```

## Step-by-Step Instructions

### 1. Configure Git User Information
```bash
git config user.name "$GITHUB_USERNAME"
git config user.email "${GITHUB_USERNAME}@users.noreply.github.com"
```

### 2. Stage and Commit Changes
```bash
# Stage all changes
git add -A

# Commit with a descriptive message
git commit -m "Your commit message here"
```

### 3. Push Using Personal Access Token (PAT)

#### Method 1: Direct Push with PAT in URL
```bash
# Load environment variables
source .env

# Push using PAT authentication
git push https://${GITHUB_USERNAME}:${GITHUB_PAT}@github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git main
```

#### Method 2: Create a Bash Function (Recommended)
Add this to your `.bashrc` or create a script:

```bash
#!/bin/bash
# Save as: git-push-env.sh

# Load environment variables
source .env

# Function to push with credentials from .env
git_push_env() {
    if [ -z "$GITHUB_USERNAME" ] || [ -z "$GITHUB_PAT" ] || [ -z "$GITHUB_REPO" ]; then
        echo "Error: Missing required environment variables"
        echo "Please ensure GITHUB_USERNAME, GITHUB_PAT, and GITHUB_REPO are set in .env"
        return 1
    fi
    
    echo "Pushing to GitHub as $GITHUB_USERNAME..."
    git push https://${GITHUB_USERNAME}:${GITHUB_PAT}@github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git ${1:-main}
}

# Execute the push
git_push_env $@
```

Make the script executable:
```bash
chmod +x git-push-env.sh
```

Use it:
```bash
./git-push-env.sh main
```

## Security Best Practices

1. **Never commit your `.env` file**
   - Ensure `.env` is in your `.gitignore`
   - Check: `grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore`

2. **Use GitHub Personal Access Tokens (PAT)**
   - Create tokens at: https://github.com/settings/tokens
   - Use minimal required permissions
   - Set expiration dates
   - Rotate tokens regularly

3. **Alternative: SSH Keys (More Secure)**
   ```bash
   # Generate SSH key
   ssh-keygen -t ed25519 -C "${GITHUB_USERNAME}@users.noreply.github.com"
   
   # Add to GitHub: https://github.com/settings/keys
   # Then use SSH URL instead:
   git remote set-url origin git@github.com:${GITHUB_USERNAME}/${GITHUB_REPO}.git
   ```

## Troubleshooting

### Authentication Failed
- Verify your PAT is valid and not expired
- Ensure PAT has `repo` scope permissions
- Check username and repository name are correct

### Command Not Found
If using the script method, ensure:
- Script has execute permissions: `chmod +x git-push-env.sh`
- You're in the correct directory
- The `.env` file exists and is readable

### Push Rejected
- Pull latest changes first: `git pull origin main`
- Resolve any merge conflicts
- Ensure you have write permissions to the repository

## Example Workflow

```bash
# 1. Make your changes
echo "Some changes" >> file.txt

# 2. Stage and commit
git add -A
git commit -m "Add new features

- Feature 1
- Feature 2

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 3. Load env and push
source .env
git push https://${GITHUB_USERNAME}:${GITHUB_PAT}@github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git main

# Or use the script
./git-push-env.sh main
```

## Notes

- Personal Access Tokens in URLs are visible in shell history
- Consider using `HISTIGNORE` to exclude git commands with tokens
- For production environments, use proper secret management tools
- Always verify your `.env` file is not tracked by git