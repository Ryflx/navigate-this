# Quick Deployment Guide for Render

## What You Have

✅ **Backend API** (`server.js`) - Node.js + Express + PostgreSQL
✅ **Frontend** (`index.html`, `app.js`, `styles.css`) - Terminator themed UI
✅ **Database Schema** - Automatically created on first run
✅ **Real-time Updates** - Leaderboard refreshes every 10 seconds

## Deploy to Render (5 Minutes)

### Option A: Using render.yaml (Easiest)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Go to https://dashboard.render.com/
   - Click "New +" → "Blueprint"
   - Connect your GitHub repo
   - Render will automatically detect `render.yaml` and create:
     - PostgreSQL database
     - Web service
     - Environment variables
   - Click "Apply"

3. **Done!** Your app will be live at `https://navigate-this.onrender.com`

### Option B: Manual Setup

1. **Create Database**:
   - New + → PostgreSQL
   - Name: `navigate-this-db`
   - Click Create
   - Copy the **Internal Database URL**

2. **Create Web Service**:
   - New + → Web Service
   - Connect GitHub repo
   - Settings:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
   - Environment Variables:
     - `DATABASE_URL`: [paste Internal Database URL]
     - `ADMIN_PASSWORD`: `SKYNET2029`
     - `NODE_ENV`: `production`
   - Click Create

3. **Wait for deployment** (~2 minutes)

## After Deployment

### Test It Works

1. Visit your Render URL
2. You should see the countdown timer
3. Try submitting a code:
   - Team Name: `Test Team`
   - Code: `GENESIS-BLACK-001`
4. Check the leaderboard appears

### Update Genesis Codes

Before your event, edit `app.js` lines 4-6 with your real codes:

```javascript
genesisCodes: {
  "YOUR-REAL-CODE-1": "Document Code",
  "YOUR-REAL-CODE-2": "AI Hidden Code"
}
```

Then push to GitHub - Render will auto-deploy.

### Admin Access

- Press `Ctrl + Shift + A` (Mac: `Cmd + Shift + A`)
- Enter password: `SKYNET2029`
- "PURGE DATA" button appears on leaderboard

## Important Notes

### Free Tier Limitations

- **Database**: 1GB storage, 97 hours/month uptime
- **Web Service**: Spins down after 15 min inactivity
- **First request after spin-down**: ~30 seconds to wake up

### For Your Event (Nov 5th)

- Deploy at least 1 day before
- Test thoroughly
- Keep the page open in a browser tab to prevent spin-down
- Or upgrade to paid tier ($7/month) for always-on

### Monitoring

Check Render logs:
- Dashboard → Your Service → Logs
- Watch for database connection errors
- Monitor API requests

## Troubleshooting

**Database won't connect?**
- Check `DATABASE_URL` is set correctly
- Verify database is running (not paused)
- Look for SSL errors in logs

**Leaderboard not updating?**
- Open browser console (F12)
- Check for API errors
- Verify `/api/leaderboard` endpoint works

**Countdown shows wrong time?**
- Verify deadline in `app.js` line 20
- Format: `YYYY-MM-DDTHH:MM:SS+00:00`

## Support

If you get stuck:
1. Check Render logs
2. Check browser console
3. Verify environment variables are set
4. Test API endpoints directly

## Cost Estimate

- **Free tier**: $0/month (perfect for one-time event)
- **Paid tier**: $7/month web service + $7/month database = $14/month
  - Recommended if you need 100% uptime
  - Can cancel after event

Good luck with your Terminator challenge! 🤖🔴

