# Putting the game online with Cloudflare (free)

The game is a plain website: everything it needs is in the `public` folder.
There is nothing to "build". Cloudflare just serves those files.

## One-time setup (about 5 minutes)

1. Go to https://dash.cloudflare.com/sign-up and create a free account (or log in).
2. In the left menu, open **Compute (Workers)** → **Workers & Pages**
   (it may just be called **Workers & Pages**).
3. Click **Create** (or **Create application**), then pick the **Pages** tab and
   **Import an existing Git repository** (sometimes labelled **Connect to Git**).
4. Click **Connect GitHub**. GitHub opens and asks which repositories Cloudflare may see:
   choose **Only select repositories** → **e-reader-worm** → **Install & Authorize**.
5. Back in Cloudflare, pick **e-reader-worm** and click **Begin setup**. Fill in:
   - **Project name:** `e-reader-worm` (this becomes the web address)
   - **Production branch:** `main`
   - **Framework preset:** `None`
   - **Build command:** leave empty
   - **Build output directory:** `public`
6. Click **Save and Deploy**. After about a minute you get a link like
   **https://e-reader-worm.pages.dev**. Send that to your friends.

From then on, every time a change is pushed to `main`, Cloudflare updates the site
automatically within a minute or two.

### If Cloudflare only offers "Workers" (no Pages tab)
Cloudflare sometimes changes its menus. If you only see a Worker option, choose
**Import a repository**, pick **e-reader-worm**, keep the suggested deploy command
(`npx wrangler deploy`) and click **Deploy**. The `wrangler.jsonc` file in this repo
already tells it to serve the `public` folder. Your link will end in `.workers.dev`.

## Tips for playing with friends
- On a phone, open the link, then use **Add to Home Screen** (iPhone: Share button;
  Android: ⋮ menu). It then opens full screen like an app.
- Scores are saved on each person's own phone. A shared leaderboard can come later.

## Optional: your own web address
In the Cloudflare project, open **Custom domains** → **Set up a custom domain**.
You can buy a domain through Cloudflare (from about £8 a year) and it links up automatically.
