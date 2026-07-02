# QA and Deployment Guide - Step by Step

This guide will help you set up QA and Production environments, run tests, and deploy your project like a real-world application.

## Table of Contents
1. [Understanding the Environments](#understanding-the-environments)
2. [What are GitHub Actions?](#what-are-github-actions)
3. [Step 1: Set Up QA Environment](#step-1-set-up-qa-environment)
4. [Step 2: Run Tests Locally](#step-2-run-tests-locally)
5. [Step 3: Deploy to QA](#step-3-deploy-to-qa)
6. [Step 4: QA Testing Process](#step-4-qa-testing-process)
7. [Step 5: Deploy to Production](#step-5-deploy-to-production)
8. [Step 6: Production Testing](#step-6-production-testing)
9. [Troubleshooting](#troubleshooting)

---

## Understanding the Environments

### Development Environment
- **Purpose**: For you to write and test code locally
- **URL**: `http://localhost:5174` (frontend), `http://localhost:4000` (backend)
- **Database**: Your local Supabase project
- **When to use**: While developing new features

### QA (Quality Assurance) Environment
- **Purpose**: For testing features before they go to production
- **URL**: `https://your-qa-app.vercel.app` (example)
- **Database**: Separate Supabase project for QA
- **When to use**: When you want to test features in a production-like environment

### Production Environment
- **Purpose**: The live application used by real users
- **URL**: `https://b2-a-learning-journal.vercel.app` (your current production)
- **Database**: Production Supabase project
- **When to use**: After QA approval, for real users

---

## What are GitHub Actions?

**GitHub Actions** is an automation tool built into GitHub that helps you:
- **Automatically test** your code when you push changes
- **Automatically deploy** your application to different environments
- **Run CI/CD pipelines** (Continuous Integration/Continuous Deployment)

### How it works:
1. You push code to GitHub
2. GitHub Actions triggers automatically based on your configuration
3. It runs tests, builds your app, and deploys it
4. You can see the results in the "Actions" tab in your GitHub repository

### Why use it:
- **No manual deployment** - Deploy automatically when you push code
- **Catch bugs early** - Tests run automatically before deployment
- **Consistent deployments** - Same process every time
- **Professional workflow** - Industry standard for software development

---

## Step 1: Set Up QA Environment

### 1.1 Create QA Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project called "b2a-learning-journal-qa"
3. Run all SQL migrations from `backend/supabase-migrations/`
4. Get your QA Supabase URL and keys

### 1.2 Configure Existing Auth0 for QA
1. Go to your existing Auth0 application at [auth0.com](https://auth0.com)
2. Go to Application Settings
3. Add QA callback URLs to "Allowed Callback URLs":
   - `https://your-qa-app.vercel.app`
   - `https://your-qa-app.vercel.app/journal`
4. Add QA logout URLs to "Allowed Logout URLs":
   - `https://your-qa-app.vercel.app`
5. Add QA URL to "Allowed Web Origins":
   - `https://your-qa-app.vercel.app`
6. Save changes
7. Use your existing Auth0 domain and client ID for QA

### 1.3 Create QA Backend on Render
1. Go to [render.com](https://render.com)
2. Create a new Web Service called "b2a-learning-journal-backend-qa"
3. Connect your GitHub repository
4. Configure:
   - **Branch**: `qa`
   - **Root Directory**: `backend`
   - **Environment Variables**:
     - `SUPABASE_URL`: Your QA Supabase URL
     - `SUPABASE_KEY`: Your QA Supabase service role key
5. Deploy and copy the backend URL

### 1.4 Create QA Frontend on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Create a new project called "b2a-learning-journal-qa"
3. Connect your GitHub repository
4. Configure:
   - **Branch**: `qa`
   - **Root Directory**: `frontend`
   - **Environment Variables**:
     - `VITE_SUPABASE_URL`: Your QA Supabase URL
     - `VITE_SUPABASE_PUBLISHABLE_KEY`: Your QA Supabase anon key
     - `VITE_AUTH0_DOMAIN`: Your QA Auth0 domain
     - `VITE_AUTH0_CLIENT_ID`: Your QA Auth0 client ID
     - `VITE_BACKEND_URL`: Your QA backend URL
5. Deploy and copy the frontend URL

### 1.5 Add GitHub Secrets for QA
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add these secrets:
   - `RENDER_QA_SERVICE_ID`: Get from Render QA backend service settings
   - `RENDER_API_KEY`: Get from Render account settings

---

## Step 2: Run Tests Locally

### 2.1 Run Unit Tests (Vitest)
```bash
cd frontend
npm run test:run
```

This runs unit tests for your React components.

### 2.2 Run Tests with UI
```bash
cd frontend
npm run test:ui
```

This opens a visual interface to run and debug tests.

### 2.3 Run E2E Tests (Playwright)
```bash
cd frontend
npm run test:e2e
```

This runs end-to-end tests that simulate real user interactions.

### 2.4 Run E2E Tests with UI
```bash
cd frontend
npm run test:e2e:ui
```

This opens Playwright's visual test runner.

---

## Step 3: Deploy to QA

### 3.1 Create and Switch to QA Branch
```bash
git checkout -b qa
```

### 3.2 Update Environment Files
Update `frontend/.env.qa` with your QA environment variables.

### 3.3 Push to GitHub
```bash
git add .
git commit -m "Prepare for QA deployment"
git push origin qa
```

### 3.4 Monitor GitHub Actions
1. Go to your GitHub repository
2. Click on the "Actions" tab
3. You'll see the "Deploy to QA" workflow running
4. Wait for it to complete (green checkmark = success)

### 3.5 Verify QA Deployment
1. Open your QA frontend URL (e.g., `https://your-qa-app.vercel.app`)
2. Test that the application loads
3. Check that you can login with Auth0
4. Verify that you can create notes

---

## Step 4: QA Testing Process

### 4.1 QA Checklist
Use this checklist to test your QA environment:

#### Authentication
- [ ] Can login with Google OAuth
- [ ] Can logout successfully
- [ ] User session persists after page refresh

#### Notes Management
- [ ] Can create a new note
- [ ] Can edit an existing note
- [ ] Can delete a note
- [ ] Notes persist after page refresh

#### Bookmarking
- [ ] Can bookmark individual topics
- [ ] Bookmarks appear in bookmark dialog
- [ ] Can remove bookmarks
- [ ] Bookmarks persist after page refresh

#### Search
- [ ] Search bar filters learning paths
- [ ] Search results update in real-time

#### Groups
- [ ] Can create a new group
- [ ] Can add members to group
- [ ] Can delete a group
- [ ] Group deletion persists

#### Responsive Design
- [ ] Application works on mobile
- [ ] Application works on tablet
- [ ] Application works on desktop

### 4.2 Document Issues
If you find any bugs:
1. Create a GitHub issue
2. Describe the bug
3. Steps to reproduce
4. Expected vs actual behavior
5. Screenshots if applicable

### 4.3 Fix Issues
1. Fix the bugs in your development environment
2. Run tests locally
3. Push fixes to `qa` branch
4. Re-deploy to QA
5. Retest

---

## Step 5: Deploy to Production

### 5.1 Merge QA to Main
Once QA is approved:
```bash
git checkout main
git merge qa
git push origin main
```

### 5.2 Monitor GitHub Actions
1. Go to GitHub repository → Actions tab
2. Watch the "Frontend CI" and "Backend CI" workflows run
3. Watch the "Deploy Frontend" and "Deploy Backend" workflows run
4. Wait for all to complete successfully

### 5.3 Verify Production Deployment
1. Open your production URL: `https://b2-a-learning-journal.vercel.app`
2. Test critical functionality:
   - Login
   - Create note
   - Bookmark topic
   - Search

---

## Step 6: Production Testing

### 6.1 Smoke Testing
Quick tests to ensure production is working:
- [ ] Homepage loads
- [ ] Can login
- [ ] Can create a note
- [ ] Can logout

### 6.2 Monitor for Issues
After production deployment:
1. Monitor application logs
2. Check for any error reports
3. Watch for user feedback
4. Be ready to rollback if critical issues found

### 6.3 Rollback Plan
If critical issues are found:
```bash
# Rollback to previous version
git revert <commit-hash>
git push origin main
```

---

## Troubleshooting

### GitHub Actions Failures

**Problem**: Tests fail in GitHub Actions but pass locally
**Solution**:
- Check environment variables in GitHub Secrets
- Ensure all dependencies are in package.json
- Check for platform-specific issues (Windows vs Linux)

**Problem**: Deployment fails
**Solution**:
- Check deployment logs in Actions tab
- Verify environment variables are set correctly
- Ensure API keys are valid

### Environment Issues

**Problem**: QA environment not working
**Solution**:
- Verify environment variables in `.env.qa`
- Check Supabase migrations ran successfully
- Verify Auth0 callback URLs are correct

**Problem**: Production deployment breaks features
**Solution**:
- Compare environment variables between QA and Production
- Check if database schema is different
- Rollback to previous version

### Test Failures

**Problem**: Tests fail locally
**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run test:run
```

**Problem**: E2E tests fail
**Solution**:
- Ensure dev server is running
- Check if baseURL in playwright.config.ts is correct
- Run with UI to see what's happening: `npm run test:e2e:ui`

---

## Summary Workflow

```
Development → Local Testing → Push to QA Branch → 
GitHub Actions (Test + Deploy to QA) → 
QA Testing → Merge to Main → 
GitHub Actions (Test + Deploy to Production) → 
Production Testing → Done!
```

---

## Quick Reference Commands

```bash
# Development
cd frontend && npm run dev
cd backend && npm run dev

# Testing
cd frontend && npm run test:run
cd frontend && npm run test:e2e

# Deploy to QA
git checkout qa
git add .
git commit -m "QA deployment"
git push origin qa

# Deploy to Production
git checkout main
git merge qa
git push origin main

# Check GitHub Actions
# Go to: https://github.com/yourusername/repo/actions
```

---

## Need Help?

If you get stuck:
1. Check the GitHub Actions logs for detailed error messages
2. Review the troubleshooting section above
3. Create a GitHub issue with details about the problem
4. Check the official documentation:
   - [GitHub Actions Docs](https://docs.github.com/en/actions)
   - [Vercel Docs](https://vercel.com/docs)
   - [Render Docs](https://render.com/docs)
