#!/usr/bin/env python3
"""
Set up GitHub repository for the web app
"""

import os
import sys
import json
import subprocess
from pathlib import Path
import urllib.request
import urllib.error

# Add parent directory to path for logger
sys.path.append(str(Path(__file__).parent))
from logger import log_action, log_error, log_file_operation

def create_github_repo():
    """Create a new GitHub repository using the API"""
    # Get credentials from environment
    github_token = os.getenv('GITHUB_PAT')
    github_username = os.getenv('GITHUB_USERNAME')
    
    if not github_token or not github_username:
        log_error("GitHub credentials not found in environment")
        return False
    
    # Repository details
    repo_data = {
        "name": "tiktok-video-scroller",
        "description": "Cross-platform responsive TikTok-style vertical video scroller",
        "private": False,
        "auto_init": False,
        "has_issues": True,
        "has_projects": True,
        "has_wiki": False
    }
    
    # Create request
    url = "https://api.github.com/user/repos"
    headers = {
        "Authorization": f"token {github_token}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Python-urllib"
    }
    
    data = json.dumps(repo_data).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers)
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            log_action(f"GitHub repository created: {result['html_url']}")
            return result
    except urllib.error.HTTPError as e:
        if e.code == 422:
            log_error("Repository already exists or name is taken")
        else:
            error_msg = e.read().decode()
            log_error(f"Failed to create repository: {error_msg}")
        return None
    except Exception as e:
        log_error(f"Error creating repository", e)
        return None

def setup_git_remote(repo_info):
    """Set up git remote for the repository"""
    if not repo_info:
        return False
    
    try:
        # Add remote origin
        remote_url = repo_info['ssh_url']
        subprocess.run(['git', 'remote', 'add', 'origin', remote_url], check=True)
        log_action(f"Added git remote: {remote_url}")
        
        # Set up user
        github_username = os.getenv('GITHUB_USERNAME')
        subprocess.run(['git', 'config', 'user.name', github_username], check=True)
        subprocess.run(['git', 'config', 'user.email', f'{github_username}@users.noreply.github.com'], check=True)
        log_action("Configured git user")
        
        return True
    except subprocess.CalledProcessError as e:
        log_error(f"Failed to set up git remote: {e}")
        return False

def create_initial_commit():
    """Create initial commit with current files"""
    try:
        # Add all files
        subprocess.run(['git', 'add', '.'], check=True)
        log_action("Added files to git")
        
        # Create commit
        subprocess.run(['git', 'commit', '-m', 'Initial commit: Project structure and documentation'], check=True)
        log_action("Created initial commit")
        
        return True
    except subprocess.CalledProcessError as e:
        log_error(f"Failed to create commit: {e}")
        return False

def main():
    """Main setup function"""
    log_action("=== GitHub Repository Setup Started ===")
    
    # Load environment variables from .env file
    env_file = Path(__file__).parent.parent / '.env'
    if env_file.exists():
        with open(env_file, 'r') as f:
            for line in f:
                if '=' in line and not line.strip().startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key.strip()] = value.strip()
    
    # Create repository
    repo_info = create_github_repo()
    if repo_info:
        log_action(f"Repository URL: {repo_info['html_url']}")
        log_action(f"Clone URL: {repo_info['clone_url']}")
        
        # Set up git remote
        if setup_git_remote(repo_info):
            # Create initial commit
            if create_initial_commit():
                log_action("Ready to push! Run: git push -u origin main")
                log_action("=== GitHub Repository Setup Complete ===")
                return True
    
    return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)