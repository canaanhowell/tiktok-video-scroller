#!/usr/bin/env python3
"""
Progress Tracker for Web App Implementation
Updates the implementation plan with checkmarks as tasks are completed
"""

import os
import sys
import re
from pathlib import Path
from datetime import datetime

# Add parent directory to path for logger
sys.path.append(str(Path(__file__).parent))
from logger import log_action, log_error

class ProgressTracker:
    def __init__(self):
        self.plan_file = Path(__file__).parent.parent / "docs" / "implementation_plan.md"
        self.backup_dir = Path(__file__).parent.parent / "docs" / "backup"
        self.backup_dir.mkdir(exist_ok=True)
        
    def backup_plan(self):
        """Create a backup of the current plan"""
        if self.plan_file.exists():
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = self.backup_dir / f"implementation_plan_{timestamp}.md"
            with open(self.plan_file, 'r') as src, open(backup_file, 'w') as dst:
                dst.write(src.read())
            log_action(f"Created backup: {backup_file.name}")
    
    def mark_task_complete(self, task_description):
        """Mark a specific task as complete"""
        try:
            self.backup_plan()
            
            with open(self.plan_file, 'r') as f:
                content = f.read()
            
            # Find the task and mark it complete
            pattern = r'- \[ \] ' + re.escape(task_description)
            replacement = r'- [x] ' + task_description
            
            new_content = re.sub(pattern, replacement, content)
            
            if new_content != content:
                with open(self.plan_file, 'w') as f:
                    f.write(new_content)
                log_action(f"Marked complete: {task_description}")
                return True
            else:
                log_error(f"Task not found: {task_description}")
                return False
                
        except Exception as e:
            log_error(f"Failed to update progress", e)
            return False
    
    def mark_phase_complete(self, phase_number):
        """Mark an entire phase as complete"""
        try:
            self.backup_plan()
            
            with open(self.plan_file, 'r') as f:
                content = f.read()
            
            # Find the phase header and change emoji
            pattern = rf'### Phase {phase_number}: (.+) [🏗️✅📜🎥👆🎨📱💻⚡🔌🧪🚀]'
            replacement = rf'### Phase {phase_number}: \1 ✅'
            
            new_content = re.sub(pattern, replacement, content)
            
            if new_content != content:
                with open(self.plan_file, 'w') as f:
                    f.write(new_content)
                log_action(f"Marked Phase {phase_number} as complete")
                return True
            else:
                log_error(f"Phase {phase_number} not found or already complete")
                return False
                
        except Exception as e:
            log_error(f"Failed to update phase", e)
            return False
    
    def get_progress_summary(self):
        """Get a summary of current progress"""
        try:
            with open(self.plan_file, 'r') as f:
                content = f.read()
            
            # Count completed vs total tasks
            total_tasks = len(re.findall(r'- \[[ x]\]', content))
            completed_tasks = len(re.findall(r'- \[x\]', content))
            
            # Count completed phases
            phase_pattern = r'### Phase \d+:.+✅'
            completed_phases = len(re.findall(phase_pattern, content))
            total_phases = 11  # We have 11 phases
            
            summary = {
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'completion_percentage': round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0,
                'completed_phases': completed_phases,
                'total_phases': total_phases,
                'phase_percentage': round((completed_phases / total_phases * 100), 1)
            }
            
            log_action(f"Progress: {summary['completed_tasks']}/{summary['total_tasks']} tasks ({summary['completion_percentage']}%), {summary['completed_phases']}/{summary['total_phases']} phases")
            
            return summary
            
        except Exception as e:
            log_error(f"Failed to get progress summary", e)
            return None
    
    def list_pending_tasks(self, phase_number=None):
        """List all pending tasks, optionally filtered by phase"""
        try:
            with open(self.plan_file, 'r') as f:
                lines = f.readlines()
            
            pending_tasks = []
            current_phase = 0
            
            for line in lines:
                # Track current phase
                phase_match = re.match(r'### Phase (\d+):', line)
                if phase_match:
                    current_phase = int(phase_match.group(1))
                
                # Find uncompleted tasks
                task_match = re.match(r'- \[ \] (.+)', line)
                if task_match:
                    task = task_match.group(1)
                    if phase_number is None or current_phase == phase_number:
                        pending_tasks.append({
                            'phase': current_phase,
                            'task': task
                        })
            
            return pending_tasks
            
        except Exception as e:
            log_error(f"Failed to list pending tasks", e)
            return []

def main():
    """Example usage"""
    tracker = ProgressTracker()
    
    # Get current progress
    tracker.get_progress_summary()
    
    # Example: Mark directory structure as complete
    tracker.mark_task_complete("Create directory structure")
    
    # Example: Mark logging system as complete
    tracker.mark_task_complete("Set up logging system")
    
    # Get updated progress
    tracker.get_progress_summary()

if __name__ == "__main__":
    main()