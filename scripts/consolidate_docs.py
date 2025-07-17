#!/usr/bin/env python3
"""
Script to consolidate documentation in main/web_app/docs
"""
import os
import shutil
from datetime import datetime
from pathlib import Path
import json

# Add parent directory to path
import sys
sys.path.append(str(Path(__file__).parent.parent))
from scripts.logger import log_action

# Document categories based on analysis
DOC_CATEGORIES = {
    "implementation": {
        "title": "Implementation & Planning",
        "description": "Project implementation guides and plans",
        "files": [
            "implementation_guide.md",
            "implementation_plan.md",
            "video-algorithm-prompt.md",
            "IMPLEMENTATION_STATUS.md"
        ]
    },
    "algorithms": {
        "title": "Algorithms & Technical Specs",
        "description": "Video feed algorithms and technical specifications",
        "files": [
            "VIDEO_FEED_ALGORITHM.md",
            "VIDEO_SCORING_ALGORITHM.md",
            "FEED_GENERATION_API.md",
            "USER_PREFERENCE_LEARNING.md"
        ]
    },
    "deployment": {
        "title": "Deployment & Infrastructure",
        "description": "Deployment guides and infrastructure configuration",
        "files": [
            "DEPLOYMENT_GUIDE.md",
            "deployment_config.md",
            "services_status.md",
            "verified-service-connections.md",
            "available_services.md"
        ]
    },
    "cloud_services": {
        "title": "Cloud Services & CLI",
        "description": "Google Cloud, Firebase, and CLI documentation",
        "files": [
            "firebase_admin_summary.md",
            "gcloud_cli_troubleshooting_summary.md",
            "cli_summary.md",
            "cli_tools.md"
        ]
    },
    "configuration": {
        "title": "Configuration & Credentials",
        "description": "Configuration files and credential management",
        "files": [
            "credentials_checklist.md",
            "credentials_checklist_updated.md",
            "current_tech_stack.md",
            "service-test-results.json"
        ]
    },
    "troubleshooting": {
        "title": "Troubleshooting & Fixes",
        "description": "Solutions to common issues and fixes",
        "files": [
            "bunny-cdn-issue-fix.md",
            "improve-video-quality.md",
            "phase1_summary.md"
        ]
    }
}

def backup_docs():
    """Create backup of existing docs"""
    backup_dir = Path("/app/main/web_app/docs/backup")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = backup_dir / f"docs_backup_{timestamp}"
    
    log_action(f"Creating backup at {backup_path}")
    
    # Create backup directory
    backup_path.mkdir(parents=True, exist_ok=True)
    
    # Copy all current docs
    docs_dir = Path("/app/main/web_app/docs")
    for file in docs_dir.iterdir():
        if file.is_file() and file.name not in ['backup']:
            shutil.copy2(file, backup_path / file.name)
            log_action(f"Backed up {file.name}")
    
    return backup_path

def create_master_index():
    """Create master index file"""
    content = """# Web App Documentation Index

This is the consolidated documentation for the Wedding Vendor Discovery Platform.

## Document Categories

"""
    
    for category_id, category in DOC_CATEGORIES.items():
        content += f"### {category['title']}\n"
        content += f"{category['description']}\n\n"
        
        for file in category['files']:
            # Check if file exists
            file_path = Path(f"/app/main/web_app/docs/{file}")
            if file_path.exists():
                content += f"- [{file}](./{file})\n"
            else:
                content += f"- {file} (missing)\n"
        content += "\n"
    
    # Add metadata
    content += f"""## Documentation Metadata

- **Last Updated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- **Total Documents**: {sum(len(cat['files']) for cat in DOC_CATEGORIES.values())}
- **Categories**: {len(DOC_CATEGORIES)}

## Quick Links

### Project Overview
- [Implementation Guide](./implementation_guide.md) - Complete implementation roadmap
- [Video Algorithm Prompt](./video-algorithm-prompt.md) - Firebase-based implementation details
- [Current Tech Stack](./current_tech_stack.md) - Technology stack overview

### For Developers
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - How to deploy the application
- [Video Feed Algorithm](./VIDEO_FEED_ALGORITHM.md) - Core algorithm documentation
- [Firebase Admin Summary](./firebase_admin_summary.md) - Firebase capabilities

### Troubleshooting
- [Bunny CDN Fix](./bunny-cdn-issue-fix.md) - CDN issue resolution
- [GCloud CLI Troubleshooting](./gcloud_cli_troubleshooting_summary.md) - CLI fixes
"""
    
    # Write master index
    index_path = Path("/app/main/web_app/docs/README.md")
    index_path.write_text(content)
    log_action("Created master index at README.md")
    
    return index_path

def create_category_indexes():
    """Create index files for each category"""
    docs_dir = Path("/app/main/web_app/docs")
    
    for category_id, category in DOC_CATEGORIES.items():
        category_content = f"""# {category['title']}

{category['description']}

## Documents in this category:

"""
        
        for file in category['files']:
            file_path = docs_dir / file
            if file_path.exists():
                # Read first few lines as summary
                with open(file_path, 'r') as f:
                    lines = f.readlines()[:5]
                    summary = ""
                    for line in lines:
                        if line.strip() and not line.startswith("#"):
                            summary = line.strip()
                            break
                
                category_content += f"### [{file}](./{file})\n"
                if summary:
                    category_content += f"{summary}\n\n"
                else:
                    category_content += "\n"
        
        # Write category index
        category_path = docs_dir / f"_{category_id}_index.md"
        category_path.write_text(category_content)
        log_action(f"Created category index for {category['title']}")

def consolidate_related_docs():
    """Consolidate related documents into single comprehensive files"""
    docs_dir = Path("/app/main/web_app/docs")
    
    # Consolidate implementation plans
    implementation_files = [
        "implementation_guide.md",
        "implementation_plan.md", 
        "video-algorithm-prompt.md"
    ]
    
    consolidated_content = """# Consolidated Implementation Guide

This document consolidates all implementation-related documentation for the Wedding Vendor Discovery Platform.

"""
    
    for file in implementation_files:
        file_path = docs_dir / file
        if file_path.exists():
            consolidated_content += f"\n## From {file}\n\n"
            with open(file_path, 'r') as f:
                consolidated_content += f.read()
            consolidated_content += "\n\n---\n\n"
    
    # Write consolidated file
    consolidated_path = docs_dir / "CONSOLIDATED_IMPLEMENTATION.md"
    consolidated_path.write_text(consolidated_content)
    log_action("Created CONSOLIDATED_IMPLEMENTATION.md")

def create_documentation_summary():
    """Create a summary of all documentation"""
    summary = {
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "total_files": 0,
            "categories": {}
        },
        "files": {}
    }
    
    docs_dir = Path("/app/main/web_app/docs")
    
    for category_id, category in DOC_CATEGORIES.items():
        category_summary = {
            "title": category["title"],
            "description": category["description"],
            "files": [],
            "missing_files": []
        }
        
        for file in category["files"]:
            file_path = docs_dir / file
            if file_path.exists():
                file_stat = file_path.stat()
                category_summary["files"].append({
                    "name": file,
                    "size": file_stat.st_size,
                    "modified": datetime.fromtimestamp(file_stat.st_mtime).isoformat()
                })
                summary["metadata"]["total_files"] += 1
            else:
                category_summary["missing_files"].append(file)
        
        summary["metadata"]["categories"][category_id] = category_summary
    
    # Write summary
    summary_path = docs_dir / "documentation_summary.json"
    with open(summary_path, 'w') as f:
        json.dump(summary, f, indent=2)
    
    log_action("Created documentation_summary.json")
    
    return summary

def main():
    """Main consolidation function"""
    log_action("Starting documentation consolidation")
    
    # Step 1: Backup existing docs
    backup_path = backup_docs()
    log_action(f"Backup completed at {backup_path}")
    
    # Step 2: Create master index
    index_path = create_master_index()
    log_action(f"Master index created at {index_path}")
    
    # Step 3: Create category indexes
    create_category_indexes()
    log_action("Category indexes created")
    
    # Step 4: Consolidate related docs
    consolidate_related_docs()
    log_action("Related documents consolidated")
    
    # Step 5: Create documentation summary
    summary = create_documentation_summary()
    log_action(f"Documentation summary created with {summary['metadata']['total_files']} files")
    
    log_action("Documentation consolidation completed successfully!")
    
    # Print summary
    print("\nDocumentation Consolidation Summary:")
    print("=" * 50)
    print(f"Total files processed: {summary['metadata']['total_files']}")
    print(f"Categories created: {len(DOC_CATEGORIES)}")
    print(f"Backup location: {backup_path}")
    print("\nNew files created:")
    print("- README.md (master index)")
    print("- CONSOLIDATED_IMPLEMENTATION.md")
    print("- documentation_summary.json")
    for category_id in DOC_CATEGORIES:
        print(f"- _{category_id}_index.md")

if __name__ == "__main__":
    main()