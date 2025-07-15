#!/usr/bin/env python3
"""
Configure all CLI tools with credentials
"""

import os
import sys
import subprocess
from pathlib import Path

# Add parent directory to path for logger
sys.path.append(str(Path(__file__).parent))
from logger import log_action, log_error, log_config_update

def load_env():
    """Load environment variables"""
    env_file = Path(__file__).parent.parent / '.env'
    if env_file.exists():
        with open(env_file, 'r') as f:
            for line in f:
                if '=' in line and not line.strip().startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key.strip()] = value.strip()

def configure_github():
    """Configure GitHub CLI"""
    log_action("=== Configuring GitHub CLI ===")
    
    pat = os.getenv('GITHUB_PAT')
    if not pat:
        log_error("GitHub PAT not found")
        return False
    
    # Configure git
    subprocess.run(['git', 'config', '--global', 'user.name', 'canaanhowell'], capture_output=True)
    subprocess.run(['git', 'config', '--global', 'user.email', 'canaanhowell@users.noreply.github.com'], capture_output=True)
    
    # Login to GitHub CLI
    process = subprocess.Popen(['gh', 'auth', 'login', '--with-token'], 
                              stdin=subprocess.PIPE, 
                              stdout=subprocess.PIPE, 
                              stderr=subprocess.PIPE)
    stdout, stderr = process.communicate(input=pat.encode())
    
    if process.returncode == 0:
        log_action("✅ GitHub CLI configured")
        log_config_update("GitHub CLI", "Authenticated successfully")
        
        # Test the authentication
        result = subprocess.run(['gh', 'auth', 'status'], capture_output=True, text=True)
        print(result.stdout)
        return True
    else:
        log_error(f"GitHub CLI configuration failed: {stderr.decode()}")
        return False

def configure_vercel():
    """Configure Vercel CLI"""
    log_action("=== Configuring Vercel CLI ===")
    
    token = os.getenv('Vercel_token')
    if not token:
        log_error("Vercel token not found")
        return False
    
    # Set environment variable for Vercel
    os.environ['VERCEL_TOKEN'] = token
    
    # Test Vercel CLI with token
    result = subprocess.run(['vercel', 'whoami', '--token', token], capture_output=True, text=True)
    if result.returncode == 0:
        user = result.stdout.strip()
        log_action(f"✅ Vercel CLI configured - Logged in as: {user}")
        log_config_update("Vercel CLI", f"Authenticated as {user}")
        return True
    else:
        log_error(f"Vercel CLI configuration failed: {result.stderr}")
        return False

def test_supabase():
    """Test Supabase access"""
    log_action("=== Testing Supabase Access ===")
    
    # We'll use npx for Supabase commands
    result = subprocess.run(['npx', 'supabase', '--version'], capture_output=True, text=True)
    if result.returncode == 0:
        log_action(f"✅ Supabase CLI available via npx - Version: {result.stdout.strip()}")
        log_config_update("Supabase CLI", "Available via npx")
        return True
    else:
        log_error("Supabase CLI not available")
        return False

def test_redis():
    """Test Redis CLI"""
    log_action("=== Testing Redis CLI ===")
    
    # Check if redis-cli is available
    try:
        result = subprocess.run(['redis-cli', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            log_action(f"✅ Redis CLI available - {result.stdout.strip()}")
            
            # Create Redis connection script
            redis_url = os.getenv('Redis_TCP_Endpoint')
            if redis_url:
                script_content = f"""#!/bin/bash
# Connect to Upstash Redis
redis-cli -u "{redis_url}"
"""
                script_path = Path(__file__).parent / 'connect_redis.sh'
                with open(script_path, 'w') as f:
                    f.write(script_content)
                os.chmod(script_path, 0o755)
                log_action(f"Created Redis connection script: {script_path}")
            
            return True
        else:
            log_error("Redis CLI not available")
            return False
    except FileNotFoundError:
        log_action("Redis CLI not installed - Upstash can be accessed via REST API")
        log_config_update("Redis", "Will use Upstash REST API instead of CLI")
        return True

def create_cli_aliases():
    """Create helpful CLI aliases"""
    aliases_content = """#!/bin/bash
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
"""
    
    aliases_file = Path(__file__).parent / 'cli_aliases.sh'
    with open(aliases_file, 'w') as f:
        f.write(aliases_content)
    
    log_action(f"Created CLI aliases file: {aliases_file}")
    log_action("Run 'source scripts/cli_aliases.sh' to use aliases")

def main():
    """Main configuration"""
    log_action("=== CLI Tools Configuration Started ===")
    
    # Load environment
    load_env()
    
    # Configure tools
    results = {
        "GitHub": configure_github(),
        "Vercel": configure_vercel(),
        "Supabase": test_supabase(),
        "Redis": test_redis()
    }
    
    # Create aliases
    create_cli_aliases()
    
    # Summary
    log_action("=== Configuration Summary ===")
    for tool, success in results.items():
        status = "✅" if success else "❌"
        log_action(f"{status} {tool}")
    
    # Quick start guide
    log_action("\n=== Quick Start Commands ===")
    log_action("1. Source aliases: source scripts/cli_aliases.sh")
    log_action("2. Start dev server: vercel dev")
    log_action("3. Deploy to Vercel: vercel --prod")
    log_action("4. Push to GitHub: git push origin main")
    log_action("5. Supabase commands: npx supabase [command]")
    
    return all(results.values())

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)