#!/usr/bin/env python3
"""
Initialize Next.js in a clean way
"""

import os
import shutil
import subprocess
from pathlib import Path
import json

# Add parent directory to path for logger
import sys
sys.path.append(str(Path(__file__).parent))
from logger import log_action, log_error, log_file_operation

def init_nextjs():
    """Initialize Next.js by creating files manually"""
    base_dir = Path(__file__).parent.parent
    
    log_action("Creating Next.js project structure manually")
    
    # Create package.json
    package_json = {
        "name": "tiktok-video-scroller",
        "version": "0.1.0",
        "private": True,
        "scripts": {
            "dev": "next dev",
            "build": "next build",
            "start": "next start",
            "lint": "next lint",
            "type-check": "tsc --noEmit",
            "format": "prettier --write .",
            "format:check": "prettier --check ."
        },
        "dependencies": {
            "@types/node": "22.10.5",
            "@types/react": "19.0.5",
            "@types/react-dom": "19.0.3",
            "autoprefixer": "^10.4.21",
            "eslint": "^9.18.0",
            "eslint-config-next": "15.4.1",
            "next": "15.4.1",
            "postcss": "^8.5.2",
            "react": "^19.0.0",
            "react-dom": "^19.0.0",
            "tailwindcss": "^3.4.17",
            "typescript": "^5.7.3"
        },
        "devDependencies": {
            "@typescript-eslint/eslint-plugin": "^8.20.0",
            "@typescript-eslint/parser": "^8.20.0",
            "eslint-config-prettier": "^10.0.1",
            "eslint-plugin-react": "^7.37.5",
            "eslint-plugin-react-hooks": "^5.1.0",
            "prettier": "^3.4.2",
            "prettier-plugin-tailwindcss": "^0.6.10"
        }
    }
    
    with open(base_dir / "package.json", "w") as f:
        json.dump(package_json, f, indent=2)
    log_file_operation("create", "package.json", True)
    
    # Create tsconfig.json
    tsconfig = {
        "compilerOptions": {
            "target": "ES2017",
            "lib": ["dom", "dom.iterable", "esnext"],
            "allowJs": True,
            "skipLibCheck": True,
            "strict": True,
            "forceConsistentCasingInFileNames": True,
            "noEmit": True,
            "esModuleInterop": True,
            "module": "esnext",
            "moduleResolution": "bundler",
            "resolveJsonModule": True,
            "isolatedModules": True,
            "jsx": "preserve",
            "incremental": True,
            "plugins": [
                {
                    "name": "next"
                }
            ],
            "paths": {
                "@/*": ["./src/*"]
            }
        },
        "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        "exclude": ["node_modules"]
    }
    
    with open(base_dir / "tsconfig.json", "w") as f:
        json.dump(tsconfig, f, indent=2)
    log_file_operation("create", "tsconfig.json", True)
    
    # Create next.config.js
    next_config = """/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['vz-97606b97-31d.b-cdn.net', 'media.synthetikmedia.ai'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
"""
    
    with open(base_dir / "next.config.js", "w") as f:
        f.write(next_config)
    log_file_operation("create", "next.config.js", True)
    
    # Create tailwind.config.ts
    tailwind_config = """import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        '3xl': '1920px',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
}
export default config
"""
    
    with open(base_dir / "tailwind.config.ts", "w") as f:
        f.write(tailwind_config)
    log_file_operation("create", "tailwind.config.ts", True)
    
    # Create postcss.config.js
    postcss_config = """module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"""
    
    with open(base_dir / "postcss.config.js", "w") as f:
        f.write(postcss_config)
    log_file_operation("create", "postcss.config.js", True)
    
    # Create .eslintrc.json
    eslint_config = {
        "extends": ["next/core-web-vitals", "prettier"],
        "parser": "@typescript-eslint/parser",
        "plugins": ["@typescript-eslint"],
        "rules": {
            "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
            "react-hooks/exhaustive-deps": "warn",
            "react/display-name": "off"
        }
    }
    
    with open(base_dir / ".eslintrc.json", "w") as f:
        json.dump(eslint_config, f, indent=2)
    log_file_operation("create", ".eslintrc.json", True)
    
    # Create .prettierrc
    prettier_config = {
        "semi": False,
        "trailingComma": "es5",
        "singleQuote": True,
        "tabWidth": 2,
        "useTabs": False,
        "plugins": ["prettier-plugin-tailwindcss"]
    }
    
    with open(base_dir / ".prettierrc", "w") as f:
        json.dump(prettier_config, f, indent=2)
    log_file_operation("create", ".prettierrc", True)
    
    # Create src directory structure
    src_dir = base_dir / "src"
    src_dir.mkdir(exist_ok=True)
    
    # Create app directory
    app_dir = src_dir / "app"
    app_dir.mkdir(exist_ok=True)
    
    # Create layout.tsx
    layout_content = """import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TikTok Video Scroller',
  description: 'Cross-platform responsive vertical video scroller',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
"""
    
    with open(app_dir / "layout.tsx", "w") as f:
        f.write(layout_content)
    log_file_operation("create", "src/app/layout.tsx", True)
    
    # Create page.tsx
    page_content = """export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">TikTok Video Scroller</h1>
      <p className="mt-4 text-lg text-gray-600">🚀 Ready to build!</p>
    </main>
  )
}
"""
    
    with open(app_dir / "page.tsx", "w") as f:
        f.write(page_content)
    log_file_operation("create", "src/app/page.tsx", True)
    
    # Create globals.css
    globals_css = """@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 255, 255, 255;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
"""
    
    with open(app_dir / "globals.css", "w") as f:
        f.write(globals_css)
    log_file_operation("create", "src/app/globals.css", True)
    
    # Create components directory
    components_dir = src_dir / "components"
    components_dir.mkdir(exist_ok=True)
    
    # Create hooks directory
    hooks_dir = src_dir / "hooks"
    hooks_dir.mkdir(exist_ok=True)
    
    # Create utils directory
    utils_dir = src_dir / "utils"
    utils_dir.mkdir(exist_ok=True)
    
    # Create public directory
    public_dir = base_dir / "public"
    public_dir.mkdir(exist_ok=True)
    
    # Create .env from .env
    env_file = base_dir / ".env"
    env_local = base_dir / ".env"
    if env_file.exists():
        shutil.copy2(env_file, env_local)
        log_file_operation("create", ".env", True)
    
    log_action("Next.js project structure created successfully")
    return True

def main():
    """Main initialization"""
    log_action("=== Manual Next.js Project Setup ===")
    
    if init_nextjs():
        log_action("=== Setup Complete ===")
        log_action("Next steps:")
        log_action("1. Run: npm install")
        log_action("2. Run: npm run dev")
        return True
    else:
        log_error("Setup failed")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)