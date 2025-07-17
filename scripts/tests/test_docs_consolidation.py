#!/usr/bin/env python3
"""
Test script for documentation consolidation
"""
import os
import json
from pathlib import Path
from datetime import datetime

def test_doc_structure():
    """Test if documentation structure is valid"""
    docs_dir = Path("/app/main/web_app/docs")
    
    print("Testing Documentation Structure")
    print("=" * 50)
    
    # Check if docs directory exists
    if not docs_dir.exists():
        print("❌ Docs directory not found!")
        return False
    
    print("✅ Docs directory exists")
    
    # Count existing files
    doc_files = list(docs_dir.glob("*.md"))
    json_files = list(docs_dir.glob("*.json"))
    
    print(f"\nCurrent documentation:")
    print(f"- Markdown files: {len(doc_files)}")
    print(f"- JSON files: {len(json_files)}")
    
    # Check for important files
    important_files = [
        "implementation_guide.md",
        "video-algorithm-prompt.md",
        "firebase_admin_summary.md",
        "gcloud_cli_troubleshooting_summary.md"
    ]
    
    print("\nChecking important files:")
    for file in important_files:
        file_path = docs_dir / file
        if file_path.exists():
            size = file_path.stat().st_size
            print(f"✅ {file} ({size:,} bytes)")
        else:
            print(f"❌ {file} (missing)")
    
    return True

def verify_consolidation():
    """Verify consolidation will work properly"""
    print("\n\nVerifying Consolidation Requirements")
    print("=" * 50)
    
    # Check if we can import logger
    try:
        import sys
        sys.path.append("/app/main/web_app")
        from scripts.logger import log_action
        print("✅ Logger module available")
    except ImportError:
        print("❌ Logger module not available")
        return False
    
    # Check write permissions
    test_file = Path("/app/main/web_app/docs/.test_write")
    try:
        test_file.write_text("test")
        test_file.unlink()
        print("✅ Write permissions confirmed")
    except Exception as e:
        print(f"❌ Write permissions issue: {e}")
        return False
    
    # Check backup directory
    backup_dir = Path("/app/main/web_app/docs/backup")
    if backup_dir.exists():
        backup_count = len(list(backup_dir.iterdir()))
        print(f"✅ Backup directory exists ({backup_count} existing backups)")
    else:
        print("✅ Backup directory will be created")
    
    return True

def preview_consolidation():
    """Preview what consolidation will do"""
    print("\n\nConsolidation Preview")
    print("=" * 50)
    
    # Import doc categories
    from consolidate_docs import DOC_CATEGORIES
    
    print("Document categories to be created:")
    for category_id, category in DOC_CATEGORIES.items():
        print(f"\n📁 {category['title']}")
        print(f"   {category['description']}")
        print(f"   Files: {len(category['files'])}")
    
    # Calculate new files
    new_files = [
        "README.md",
        "CONSOLIDATED_IMPLEMENTATION.md",
        "documentation_summary.json"
    ]
    new_files.extend([f"_{cat}_index.md" for cat in DOC_CATEGORIES.keys()])
    
    print(f"\n\nNew files to be created: {len(new_files)}")
    for file in new_files:
        print(f"  📄 {file}")
    
    return True

def main():
    """Run all tests"""
    print("Documentation Consolidation Test")
    print("================================\n")
    
    tests = [
        ("Documentation Structure", test_doc_structure),
        ("Consolidation Requirements", verify_consolidation),
        ("Consolidation Preview", preview_consolidation)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n❌ Error in {test_name}: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n\nTest Summary")
    print("=" * 50)
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✅ All tests passed! Ready to consolidate documentation.")
    else:
        print("\n❌ Some tests failed. Please fix issues before consolidating.")
    
    return passed == total

if __name__ == "__main__":
    # Add parent to path for imports
    import sys
    sys.path.append("/app/main/web_app/scripts")
    
    success = main()
    exit(0 if success else 1)