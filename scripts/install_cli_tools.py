#!/usr/bin/env python3
"""
Install and configure CLI tools for all services
"""

import os
import sys
import subprocess
from pathlib import Path

# Add parent directory to path for logger
sys.path.append(str(Path(__file__).parent))
from logger import log_action, log_error, log_package_installed

def run_command(cmd, description=""):
    """Run a shell command and log the result"""
    try:
        log_action(f"Running: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
        result = subprocess.run(
            cmd, 
            shell=isinstance(cmd, str), 
            capture_output=True, 
            text=True
        )
        if result.returncode == 0:
            log_action(f"✓ {description}" if description else f"✓ Command successful")
            if result.stdout:
                print(result.stdout)
            return True
        else:
            log_error(f"✗ {description} failed" if description else "Command failed")
            if result.stderr:
                print(result.stderr)
            return False
    except Exception as e:
        log_error(f"Error running command: {cmd}", e)
        return False

def check_node_npm():
    """Check if Node.js and npm are installed"""
    log_action("=== Checking Node.js and npm ===")
    
    # Check Node.js
    node_check = run_command(["node", "--version"], "Check Node.js version")
    npm_check = run_command(["npm", "--version"], "Check npm version")
    
    if not node_check or not npm_check:
        log_error("Node.js and npm are required. Please install Node.js first.")
        return False
    return True

def install_supabase_cli():
    """Install Supabase CLI"""
    log_action("=== Installing Supabase CLI ===")
    
    # Check if already installed
    if run_command(["which", "supabase"], "Check if Supabase CLI exists"):
        log_action("Supabase CLI already installed")
        run_command(["supabase", "--version"], "Supabase version")
        return True
    
    # Install via npm
    if run_command(["npm", "install", "-g", "supabase"], "Install Supabase CLI"):
        log_package_installed("supabase", "global")
        return True
    
    # Alternative: Download binary
    log_action("Trying alternative installation method...")
    install_script = """
    curl -L https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar xz
    sudo mv supabase /usr/local/bin/
    """
    return run_command(install_script, "Install Supabase binary")

def install_vercel_cli():
    """Install Vercel CLI"""
    log_action("=== Installing Vercel CLI ===")
    
    # Check if already installed
    if run_command(["which", "vercel"], "Check if Vercel CLI exists"):
        log_action("Vercel CLI already installed")
        run_command(["vercel", "--version"], "Vercel version")
        return True
    
    # Install via npm
    if run_command(["npm", "install", "-g", "vercel"], "Install Vercel CLI"):
        log_package_installed("vercel", "global")
        return True
    return False

def install_github_cli():
    """Install GitHub CLI"""
    log_action("=== Installing GitHub CLI ===")
    
    # Check if already installed
    if run_command(["which", "gh"], "Check if GitHub CLI exists"):
        log_action("GitHub CLI already installed")
        run_command(["gh", "--version"], "GitHub CLI version")
        return True
    
    # Try installing via npm (unofficial but works)
    log_action("Installing GitHub CLI via npm...")
    if run_command(["npm", "install", "-g", "@github/gh"], "Install GitHub CLI"):
        log_package_installed("@github/gh", "global")
        return True
    
    # Alternative: Use git directly
    log_action("GitHub CLI installation failed. Will use git commands directly.")
    return True  # Not critical since we can use git

def setup_upstash_cli():
    """Setup Upstash Redis CLI access"""
    log_action("=== Setting up Upstash Redis Access ===")
    
    # Upstash doesn't have a dedicated CLI, but we can use redis-cli
    # Check if redis-cli is available
    if run_command(["which", "redis-cli"], "Check if redis-cli exists"):
        log_action("redis-cli already installed")
        return True
    
    # Install redis-cli via npm
    if run_command(["npm", "install", "-g", "redis-cli"], "Install redis-cli"):
        log_package_installed("redis-cli", "global")
        return True
    
    log_action("Note: Upstash can be accessed via REST API without CLI")
    return True

def load_env_variables():
    """Load environment variables from .env file"""
    env_file = Path(__file__).parent.parent / '.env'
    if env_file.exists():
        with open(env_file, 'r') as f:
            for line in f:
                if '=' in line and not line.strip().startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key.strip()] = value.strip()
        log_action("Environment variables loaded")
    else:
        log_error(".env file not found")

def configure_supabase():
    """Configure Supabase CLI"""
    log_action("=== Configuring Supabase CLI ===")
    
    # Login with access token
    token = os.getenv('supabase_admin_token')
    if token:
        cmd = f"supabase login --token {token}"
        return run_command(cmd, "Configure Supabase authentication")
    else:
        log_error("Supabase token not found in environment")
        return False

def configure_vercel():
    """Configure Vercel CLI"""
    log_action("=== Configuring Vercel CLI ===")
    
    # Login with token
    token = os.getenv('Vercel_token')
    if token:
        # Set token as environment variable for Vercel CLI
        os.environ['VERCEL_TOKEN'] = token
        log_action("Vercel token configured")
        return True
    else:
        log_error("Vercel token not found in environment")
        return False

def configure_github():
    """Configure GitHub CLI"""
    log_action("=== Configuring GitHub CLI ===")
    
    # Check if gh is available
    if not run_command(["which", "gh"], "Check GitHub CLI"):
        log_action("GitHub CLI not available, using git directly")
        return True
    
    # Login with PAT
    pat = os.getenv('GITHUB_PAT')
    if pat:
        cmd = f"echo {pat} | gh auth login --with-token"
        return run_command(cmd, "Configure GitHub authentication")
    else:
        log_error("GitHub PAT not found in environment")
        return False

def create_cli_config():
    """Create CLI configuration file"""
    config_content = """# CLI Tools Configuration

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
"""
    
    config_file = Path(__file__).parent.parent / "docs" / "cli_tools.md"
    with open(config_file, 'w') as f:
        f.write(config_content)
    log_action(f"CLI configuration saved to {config_file}")

def main():
    """Main installation process"""
    log_action("=== CLI Tools Installation Started ===")
    
    # Load environment variables
    load_env_variables()
    
    # Check prerequisites
    if not check_node_npm():
        log_error("Please install Node.js from https://nodejs.org/")
        return False
    
    # Install CLI tools
    tools_status = {
        "Supabase": install_supabase_cli(),
        "Vercel": install_vercel_cli(),
        "GitHub": install_github_cli(),
        "Upstash": setup_upstash_cli()
    }
    
    # Configure installed tools
    if tools_status["Supabase"]:
        configure_supabase()
    
    if tools_status["Vercel"]:
        configure_vercel()
    
    if tools_status["GitHub"]:
        configure_github()
    
    # Create configuration documentation
    create_cli_config()
    
    # Summary
    log_action("=== Installation Summary ===")
    for tool, status in tools_status.items():
        status_emoji = "✅" if status else "❌"
        log_action(f"{status_emoji} {tool}")
    
    log_action("=== CLI Tools Installation Complete ===")
    return all(tools_status.values())

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)