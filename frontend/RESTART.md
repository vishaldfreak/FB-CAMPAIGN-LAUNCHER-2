# How to Restart the Frontend Server

## Quick Restart

1. **Stop the current server:**
   - Press `Ctrl+C` in the terminal where the dev server is running

2. **Clear Vite cache (if you had optimization errors):**
   ```bash
   rm -rf node_modules/.vite
   ```

3. **Start the server again:**
   ```bash
   npm run dev
   ```

## Full Clean Restart

If you're still having issues:

```bash
# 1. Stop the server (Ctrl+C)

# 2. Clear all caches
rm -rf node_modules/.vite
rm -rf dist

# 3. Restart
npm run dev
```

## Force Re-optimization

If you need to force Vite to re-optimize dependencies:

1. Edit `vite.config.js` and temporarily set:
   ```js
   optimizeDeps: {
     force: true
   }
   ```

2. Restart the server

3. After it works, you can set `force: false` again
