# Supabase Connection Troubleshooting Guide

## Problem
```
Network error: Unable to connect to Supabase. 
Verify your internet connection and that the Supabase project is online.
```

## Your Credentials (Verified ✅)
```
URL:  https://dczhfpcfqlygpbqjctwf.supabase.co
KEY:  sb_publishable_YFgfiGPizdbN-jtd9suIJw__NVqsltC
```

---

## Quick Diagnostic (5 min)

### Step 1: Open Browser Console
1. Open your app at `http://localhost:3000`
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Copy and paste this code:

```javascript
const url = 'https://dczhfpcfqlygpbqjctwf.supabase.co';
const key = 'sb_publishable_YFgfiGPizdbN-jtd9suIJw__NVqsltC';

fetch(`${url}/rest/v1/profiles?limit=1`, {
  headers: {
    'apikey': key,
    'Content-Type': 'application/json',
  }
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(d => console.log('Response:', d))
.catch(e => console.error('Error:', e.message));
```

5. Press **Enter** and wait 2-3 seconds
6. Check what message appears below

### Step 2: Check Network Tab
1. Still in F12, go to **Network** tab
2. Refresh the page (F5)
3. Look for requests to `dczhfpcfqlygpbqjctwf.supabase.co`
4. Check the response status:
   - **200** = OK ✅
   - **401/403** = Authentication error
   - **0 or failed** = Network blocked
   - **CORS error** = CORS issue

---

## Diagnosis by Error Type

### ❌ "TypeError: Failed to Fetch" + Network Error

**Possible Causes:**
1. ⚠️ Supabase project is **suspended** or **offline**
2. ⚠️ API key is **invalid** or **revoked**
3. ⚠️ **Firewall/VPN** blocking the request
4. ⚠️ **DNS** not resolving Supabase domain
5. ⚠️ Supabase **status page** shows outage

**Solutions in Order:**
```
1. Check: https://status.supabase.com
   - Green = Online ✅
   - Red = Outage ❌ (wait for fix)

2. Verify project is ACTIVE:
   - Go to https://app.supabase.com
   - Select your project
   - Check top-right: should say "Active" not "Paused"

3. Check API key:
   - Settings → API
   - Verify "sb_publishable_..." matches your key
   - If different, update in .env.local

4. Try direct URL test:
   - In browser, paste: https://dczhfpcfqlygpbqjctwf.supabase.co
   - Should show Supabase error page (not blank or timeout)

5. Check if project needs re-enabling:
   - Settings → Billing
   - Ensure subscription is active or free tier is valid
```

---

### ✅ Status 200 but "CORS Error"

**This means:** Supabase is working, but browser is blocking the request

**Solution:**
This is a **frontend** issue, not Supabase. The request is being made properly but browser security is blocking the response.

Check:
1. Verify CORS is enabled in Supabase
   - Settings → CORS
   - Should include `http://localhost:3000`

If not set up:
```sql
-- Run in Supabase SQL Editor to allow localhost
-- This should be pre-configured, but if not:
-- Contact Supabase support - CORS managed by dashboard
```

---

### ✅ Status 401/403 Authentication Error

**This means:** API key is recognized but not authorized

**Solutions:**
1. Check API key in Supabase:
   - Settings → API
   - Copy the exact "Publishable key (anon.public)"
   - Update `.env.local` with EXACT value (no extra spaces)

2. Verify .env.local (no typos):
   ```
   REACT_APP_SUPABASE_URL=https://dczhfpcfqlygpbqjctwf.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=sb_publishable_YFgfiGPizdbN-jtd9suIJw__NVqsltC
   ```

3. Restart React dev server:
   ```bash
   Ctrl+C
   npm.cmd start
   ```

---

### ✅ Status 404 NOT FOUND

**This means:** Your Supabase project doesn't exist or URL is wrong

**Solutions:**
1. Verify URL is correct:
   - Go to https://app.supabase.com
   - Select project
   - Settings → General
   - Copy exact project URL
   - Should end in `.supabase.co`

2. Check if project is deleted:
   - If you don't see it in project list, it's deleted
   - Create new project or restore from backup

---

## Nuclear Option: Test with cURL

If browser console doesn't work, test with PowerShell:

```powershell
# In PowerShell:
$headers = @{
    'apikey' = 'sb_publishable_YFgfiGPizdbN-jtd9suIJw__NVqsltC'
    'Content-Type' = 'application/json'
}

$url = 'https://dczhfpcfqlygpbqjctwf.supabase.co/rest/v1/profiles?limit=1'

try {
    $response = Invoke-WebRequest -Uri $url -Headers $headers -Method GET
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.Value)" -ErrorAction SilentlyContinue
}
```

---

## Full Verification Checklist

- [ ] Device has internet connection (test: ping google.com)
- [ ] Supabase status page shows green (https://status.supabase.com)
- [ ] Supabase **project is ACTIVE** (not Paused)
- [ ] `.env.local` has correct credentials with NO spaces/typos
- [ ] React dev server was **restarted** after .env.local created
- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] Tried incognito/private window
- [ ] No VPN/proxy intercepting requests
- [ ] Firewall not blocking supabase.co domain
- [ ] API key matches exactly (copy-paste from Settings → API)

---

## If Still Not Working

Provide this info:

1. **Error message in browser console** (F12 → Console tab)
2. **Network response** (F12 → Network tab → click dczhfpcfqlygpbqjctwf.supabase.co request → Response)
3. **HTTP Status code** (200, 401, 403, 404, 0, etc.)
4. **Output from PowerShell cURL test** (above)
5. **Screenshot of Supabase Settings → API** (with key hidden)

---

## Quick Debug Commands

### Test environment variables loaded:
```bash
# In VS Code terminal:
node -e "console.log(process.env.REACT_APP_SUPABASE_URL)"
```

### Check if .env.local exists:
```bash
Test-Path .env.local
```

### Verify React sees the variables:
In browser console (F12):
```javascript
console.log(process.env.REACT_APP_SUPABASE_URL);
console.log(process.env.REACT_APP_SUPABASE_ANON_KEY);
```

---

## Files for Reference

- 📄 `.env.local` - Your environment variables (created ✅)
- 📄 `SUPABASE_DIAGNOSTIC.js` - Test script (use in browser console)
- 🔗 `https://app.supabase.com` - Supabase dashboard
- 🔗 `https://status.supabase.com` - Status page

---

**Next Step**: Run the diagnostic test and share the exact error/response you get.
