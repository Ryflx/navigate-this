# SKYNET PROTOCOL - Genesis Code Challenge

A Terminator 2: Genisys themed countdown and code submission challenge with real-time leaderboard.

## Features

- **Countdown Timer**: Automatically counts down to November 5th, 2025 at 12:30 PM UK time
- **Multi-Code System**: Teams can submit multiple Genesis codes
- **Real-time Leaderboard**: All submissions stored in PostgreSQL database
- **Admin Controls**: Hidden admin mode for managing the leaderboard
- **Terminator Theme**: Red/orange color scheme with terminal aesthetics

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Hosting**: Render.com

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up local PostgreSQL** (optional for local testing):
   ```bash
   # Create a local database
   createdb navigate_this
   
   # Set environment variable
   export DATABASE_URL="postgresql://localhost/navigate_this"
   ```

3. **Run the server**:
   ```bash
   npm start
   ```

4. **Open in browser**:
   ```
   http://localhost:3000
   ```

## Deployment to Render

### Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `navigate-this-db`
   - **Database**: `navigate_this`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your users
   - **Plan**: Free tier is fine for this use case
4. Click **"Create Database"**
5. **Copy the Internal Database URL** (starts with `postgresql://`)

### Step 2: Deploy Web Service

1. Push your code to GitHub (if not already done)
2. Go to Render Dashboard → **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `navigate-this`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free tier

### Step 3: Set Environment Variables

In your Render Web Service settings, add these environment variables:

```
DATABASE_URL = [paste the Internal Database URL from Step 1]
ADMIN_PASSWORD = SKYNET2029
NODE_ENV = production
```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically deploy your app
3. Once deployed, you'll get a URL like: `https://navigate-this.onrender.com`

## Configuration

### Genesis Codes

Edit the codes in `app.js` (lines 4-6):

```javascript
genesisCodes: {
  "GENESIS-BLACK-001": "Document Code",
  "GENESIS-AI-002": "AI Hidden Code"
}
```

### Countdown Deadline

Edit the deadline in `app.js` (line 20):

```javascript
deadline: new Date('2025-11-05T12:30:00+00:00')
```

### Admin Password

Set via environment variable `ADMIN_PASSWORD` or edit in `app.js` (line 11):

```javascript
adminPassword: "SKYNET2029"
```

## Admin Controls

### Access Admin Mode

1. Press `Ctrl + Shift + A` (or `Cmd + Shift + A` on Mac)
2. Enter admin password when prompted
3. The "PURGE DATA" button will appear on the leaderboard

### Reset Leaderboard

1. Enable admin mode (see above)
2. View the leaderboard
3. Click "PURGE DATA" button
4. Confirm the action

## API Endpoints

- `GET /api/leaderboard` - Get all leaderboard entries
- `POST /api/submit` - Submit a Genesis code
  ```json
  {
    "teamName": "Team Alpha",
    "code": "GENESIS-BLACK-001"
  }
  ```
- `POST /api/admin/reset` - Reset leaderboard (requires admin password)
  ```json
  {
    "password": "SKYNET2029"
  }
  ```

## Troubleshooting

### Database Connection Issues

- Make sure `DATABASE_URL` environment variable is set correctly
- Check that the PostgreSQL database is running on Render
- Verify the database URL includes `?ssl=true` for production

### Leaderboard Not Updating

- Check browser console for errors
- Verify API endpoints are accessible
- Ensure database table was created (check Render logs)

### Countdown Not Working

- Verify the deadline date format is correct
- Check browser timezone settings
- Ensure JavaScript is enabled

## License

MIT

