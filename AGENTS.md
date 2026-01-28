# AI AGENTS – ANTIGRAVITY SETUP

## 1. Frontend Agent
- Scope: frontend/**
- Stack: Next.js, Tailwind, UI logic
- Rules:
  - Do NOT touch backend
  - Consume APIs only
  - No database logic

## 2. Backend Agent
- Scope: backend/**
- Stack: Convex / Node / DB
- Rules:
  - No UI code
  - Security first
  - Validate inputs

## 3. Architect Agent
- Scope: whole repo (read-only)
- Role:
  - Review schemas
  - Enforce naming conventions
  - Warn about security & scaling issues
