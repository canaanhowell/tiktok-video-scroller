#!/usr/bin/env python3
"""
Web App Logger Module
Provides logging functionality for web app development and operations
"""

import os
import sys
from datetime import datetime
from pathlib import Path

# Ensure logs directory exists
LOG_DIR = Path(__file__).parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

# Current date for log file naming
CURRENT_DATE = datetime.now().strftime("%m%d%Y")
LOG_FILE = LOG_DIR / f"{CURRENT_DATE}.log"

# Progress tracking file
PROGRESS_FILE = LOG_DIR / "progress.md"

def _write_log(message: str, level: str = "INFO"):
    """Internal function to write to log file"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"{timestamp} - {level} - {message}\n"
    
    try:
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(log_entry)
        
        # Also print to console
        print(log_entry.strip())
    except Exception as e:
        print(f"Failed to write log: {e}")

def _update_progress(message: str, category: str = "GENERAL"):
    """Update progress markdown file"""
    try:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Read existing content
        content = ""
        if PROGRESS_FILE.exists():
            with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
                content = f.read()
        
        # Add new entry at the top
        new_entry = f"### {timestamp} - {category}\n{message}\n\n---\n\n"
        
        with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
            f.write(new_entry + content)
            
    except Exception as e:
        _write_log(f"Failed to update progress: {e}", "ERROR")

def log_action(message: str):
    """Log a general action"""
    _write_log(message, "INFO")

def log_component_created(component_name: str, path: str):
    """Log when a new component is created"""
    _write_log(f"Component created: {component_name} at {path}", "INFO")
    _update_progress(f"Created component: {component_name}", "COMPONENT")

def log_api_endpoint_created(endpoint: str, method: str):
    """Log when a new API endpoint is created"""
    _write_log(f"API endpoint created: {method} {endpoint}", "INFO")
    _update_progress(f"Created API endpoint: {method} {endpoint}", "API")

def log_hook_created(hook_name: str, purpose: str):
    """Log when a new React hook is created"""
    _write_log(f"Hook created: {hook_name} - {purpose}", "INFO")
    _update_progress(f"Created hook: {hook_name} - {purpose}", "HOOK")

def log_config_update(config_type: str, details: str):
    """Log configuration updates"""
    _write_log(f"Config updated: {config_type} - {details}", "INFO")
    _update_progress(f"Updated {config_type} configuration: {details}", "CONFIG")

def log_responsive_breakpoint_added(breakpoint: str, pixels: str):
    """Log when responsive breakpoints are configured"""
    _write_log(f"Responsive breakpoint added: {breakpoint} at {pixels}", "INFO")
    _update_progress(f"Added breakpoint: {breakpoint} ({pixels})", "RESPONSIVE")

def log_gesture_handler_created(gesture_type: str, platform: str):
    """Log gesture handler implementation"""
    _write_log(f"Gesture handler created: {gesture_type} for {platform}", "INFO")
    _update_progress(f"Implemented {gesture_type} gesture for {platform}", "GESTURE")

def log_performance_optimization(optimization: str, impact: str):
    """Log performance optimizations"""
    _write_log(f"Performance optimization: {optimization} - Impact: {impact}", "INFO")
    _update_progress(f"Optimization: {optimization} - {impact}", "PERFORMANCE")

def log_test_created(test_name: str, test_type: str):
    """Log test file creation"""
    _write_log(f"Test created: {test_name} ({test_type})", "INFO")
    _update_progress(f"Created {test_type} test: {test_name}", "TEST")

def log_error(message: str, exception: Exception = None):
    """Log error messages"""
    error_msg = message
    if exception:
        error_msg += f" - Exception: {str(exception)}"
    _write_log(error_msg, "ERROR")
    _update_progress(f"ERROR: {error_msg}", "ERROR")

def log_file_operation(operation: str, file_path: str, success: bool = True):
    """Log file operations"""
    status = "SUCCESS" if success else "FAILED"
    _write_log(f"File {operation}: {file_path} - {status}", "INFO" if success else "ERROR")

def log_package_installed(package_name: str, version: str = ""):
    """Log npm package installations"""
    version_str = f"@{version}" if version else ""
    _write_log(f"Package installed: {package_name}{version_str}", "INFO")
    _update_progress(f"Installed: {package_name}{version_str}", "DEPENDENCY")

def log_build_status(status: str, details: str = ""):
    """Log build status"""
    _write_log(f"Build {status}: {details}", "INFO" if status == "SUCCESS" else "ERROR")
    _update_progress(f"Build {status}: {details}", "BUILD")

def log_deployment_step(step: str, status: str):
    """Log deployment steps"""
    _write_log(f"Deployment - {step}: {status}", "INFO")
    _update_progress(f"Deployment {step}: {status}", "DEPLOY")

def log_device_test_result(device: str, test: str, result: str):
    """Log cross-platform testing results"""
    _write_log(f"Device test - {device}: {test} - {result}", "INFO")
    _update_progress(f"Tested on {device}: {test} - {result}", "TESTING")

def get_logger():
    """Get logger instance (for compatibility)"""
    return sys.modules[__name__]

# Initialize log files
def initialize_logs():
    """Initialize log files with headers"""
    if not LOG_FILE.exists():
        _write_log("Web App Logger initialized", "INFO")
        _write_log(f"Log directory: {LOG_DIR}", "INFO")
    
    if not PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
            f.write(f"# Web App Development Progress\n\n")
            f.write(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write("---\n\n")

# Auto-initialize when module is imported
initialize_logs()

if __name__ == "__main__":
    # Log the message passed as command line argument
    import sys
    if len(sys.argv) > 1:
        message = ' '.join(sys.argv[1:])
        log_action(message)
    else:
        log_action("Logger module test successful")