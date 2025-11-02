# .cursor Directory

This directory contains configuration and planning files for Cursor AI Assistant.

## Files

### `.cursorrules`
**Purpose:** Main configuration file for Cursor AI  
**Location:** Also at project root (symlink or duplicate)  
**Contains:**
- Code style preferences
- Project structure
- Common task workflows
- Safety checks
- Network configurations

### `project_plan.md`
**Purpose:** Complete project roadmap and implementation plan  
**Contains:**
- All 6 project phases with detailed subtasks
- Timeline and milestones
- Risk assessment
- Success metrics
- Change log

**Phases:**
1. Phase 0: Testing Infrastructure (Current)
2. Phase 1: Vanity Address & Deployment
3. Phase 2: Holder Migration & Airdrop
4. Phase 3: Liquidity Pool & Oracle Setup
5. Phase 4: Manual Testing & QA Process

### `tasks.md`
**Purpose:** Quick task reference with immediate next steps  
**Contains:**
- Current focus area
- Immediate next tasks with steps
- Task estimates and priorities
- Quick commands
- Daily standup template

## How to Use

### For Developers
1. Read `project_plan.md` to understand overall roadmap
2. Check `tasks.md` for immediate next steps
3. Review `.cursorrules` for coding standards

### For Cursor AI
1. `.cursorrules` is automatically loaded
2. Reference `project_plan.md` when asked about "the plan"
3. Reference `tasks.md` when asked "what's next"
4. Update task status as work is completed

### Updating Files

When completing tasks:
```bash
# Mark task complete in project_plan.md
# Change [ ] to [x]

# Update status sections
# Change "Not started" to "In Progress" or "Complete"

# Update change log
# Add entry with date and description
```

When priorities change:
```bash
# Update project_plan.md with new priorities
# Update tasks.md with new immediate tasks
# Update .cursorrules if workflow changes
# Commit all changes together
```

## File Relationships

```
.cursorrules          # How to work
    ↓
project_plan.md       # What to build (big picture)
    ↓
tasks.md              # What to do next (immediate)
```

## Quick Reference

### View Current Phase
```bash
grep -A 5 "Current Focus" .cursor/tasks.md
```

### View All Incomplete Tasks
```bash
grep "\[ \]" .cursor/project_plan.md | head -20
```

### View Specific Phase
```bash
sed -n '/### Phase 1:/,/^---/p' .cursor/project_plan.md
```

### Update Task Status
```bash
# Manually edit files and change [ ] to [x]
code .cursor/project_plan.md
```

## Maintenance

- **Review:** Weekly or upon phase completion
- **Update:** As tasks are completed or priorities change
- **Backup:** Committed to git, history preserved
- **Version:** Increment in change log when major updates

## Integration

These files integrate with:
- Cursor AI assistant (automatic)
- GitHub Copilot (manual reference)
- Project management (task tracking)
- Documentation (linked from README)

## Best Practices

1. **Keep files in sync** - When updating one, check others
2. **Be specific** - Detailed tasks are easier to execute
3. **Mark complete** - Update status as you go
4. **Document decisions** - Add notes about why choices were made
5. **Review regularly** - Plans change, files should reflect reality

## Questions?

If you're unsure about:
- **What to work on** → Check `tasks.md`
- **Overall goal** → Read `project_plan.md`
- **How to code** → Follow `.cursorrules`
- **Project structure** → See root `.cursorrules`

---

**Created:** 2025-11-02  
**Last Updated:** 2025-11-02  
**Maintainer:** @Kingkill666
