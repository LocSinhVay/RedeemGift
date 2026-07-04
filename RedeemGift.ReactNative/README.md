RedeemGift - Mobile (Expo)

Quick start

1. Install dependencies:

```bash
cd mobile
npm install
```

2. Configure API URL:

```bash
$env:EXPO_PUBLIC_API_URL="http://your-api-host"
```

3. Run the app:

```bash
npm run start
```

Current mobile coverage

- Login with `/login/Login` and persist auth in AsyncStorage.
- Home screen renders available menus from the authenticated user.
- Read-only paged list screens are wired for dashboard, project, gift, prizes, redeem spin, history spin, users, roles, menu, QR, and email config.
- Search, refresh, pull-to-refresh, and previous/next pagination are available on list screens.

Notes

- The default API URL is `http://localhost:5000` when `EXPO_PUBLIC_API_URL` is not set.
- On a physical device, `localhost` points to the device itself. Use your machine LAN IP or deployed API URL.
- Create/update/delete forms are still web-only and should be ported screen by screen.
