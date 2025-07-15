#!/usr/bin/env python3
"""
Install all required dependencies for the TikTok video scroller
"""

import subprocess
import sys
from pathlib import Path

# Add parent directory to path for logger
sys.path.append(str(Path(__file__).parent))
from logger import log_action, log_error, log_package_installed

def run_npm_install(packages, dev=False):
    """Install npm packages"""
    cmd = ["npm", "install"]
    if dev:
        cmd.append("--save-dev")
    cmd.extend(packages)
    
    log_action(f"Installing: {' '.join(packages)}")
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        for package in packages:
            log_package_installed(package, "dev" if dev else "prod")
        return True
    else:
        log_error(f"Failed to install packages: {result.stderr}")
        return False

def main():
    """Install all dependencies"""
    log_action("=== Installing Project Dependencies ===")
    
    # Production dependencies
    prod_deps = [
        # Supabase
        "@supabase/supabase-js",
        "@supabase/auth-helpers-nextjs",
        "@supabase/auth-helpers-react",
        
        # Video player
        "hls.js",
        "video.js",
        
        # Gestures
        "@use-gesture/react",
        
        # Animation
        "framer-motion",
        
        # State management
        "zustand",
        
        # Utilities
        "clsx",
        "tailwind-merge",
        
        # Icons
        "lucide-react",
        
        # Forms
        "react-hook-form",
        "@hookform/resolvers",
        "zod",
        
        # Date handling
        "date-fns",
        
        # HTTP client
        "axios",
        
        # Redis client
        "@upstash/redis",
        "@upstash/ratelimit",
    ]
    
    # Development dependencies
    dev_deps = [
        # Types
        "@types/video.js",
        
        # Testing
        "@testing-library/react",
        "@testing-library/jest-dom",
        "jest",
        "jest-environment-jsdom",
        
        # Linting
        "eslint-plugin-tailwindcss",
    ]
    
    # Install production dependencies
    if not run_npm_install(prod_deps):
        log_error("Failed to install production dependencies")
        return False
    
    # Install development dependencies
    if not run_npm_install(dev_deps, dev=True):
        log_error("Failed to install development dependencies")
        return False
    
    log_action("=== All Dependencies Installed Successfully ===")
    
    # Create types directory
    types_dir = Path(__file__).parent.parent / "src" / "types"
    types_dir.mkdir(exist_ok=True)
    
    # Create initial type definitions
    supabase_types = """// Supabase type definitions will be generated here
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string
          title: string
          description: string | null
          video_url: string
          thumbnail_url: string | null
          duration: number | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          video_url: string
          thumbnail_url?: string | null
          duration?: number | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          video_url?: string
          thumbnail_url?: string | null
          duration?: number | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
"""
    
    with open(types_dir / "supabase.ts", "w") as f:
        f.write(supabase_types)
    
    log_action("Created initial TypeScript type definitions")
    
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)