# Ascend — iPhone setup and updates

## First time

1. netlify.com/drop, sign in (free).
2. Drag this folder onto the drop zone. You get an https link.
3. Open that link **in Safari on your iPhone** (only Safari can install to the Home Screen).
4. Share button → Add to Home Screen → Add.

## Updating it later — read this

**Do not use netlify.com/drop again.** Dropping a folder there creates a brand
new site at a brand new address every time. Your Home Screen icon still points
at the old address, so nothing appears to change — and because progress is
stored per web address, a new address starts you back at Day 1.

Deploy over the top of the existing site instead:

1. Netlify dashboard → click your existing site (the one your icon points to).
2. **Deploys** tab.
3. Drag this folder onto the drop zone on that page.

That replaces the files at the same address, so your Home Screen icon and all
your progress carry across.

### Making the phone pick it up

The app caches itself so it works offline, so a new version lands on the
**second** launch after a deploy. To force it now:

1. Swipe up from the App Switcher to fully close Ascend (not just background it).
2. Open it again. It may still show the old build.
3. Close and open once more. The new build is live.

Check Profile → Program → **Build**. That number changes with every deploy, so
you can tell instantly whether the update landed.

## Moving your progress between addresses

If you already have progress on an old link and want it on a new one:

1. Open the **old** app → Profile → Program → **Backup and restore** → Copy.
2. Open the **new** app → Profile → Program → **Backup and restore**.
3. Select everything in the box, paste your backup over it, tap **Restore**.

Everything transfers except your profile photo, which you can re-upload.

## Where your data lives

On the phone, under that site's storage. Nothing is uploaded anywhere.

These wipe it:
- Deleting the Home Screen icon.
- Settings → Safari → Clear History and Website Data.

Take a backup now and then and keep it in a note.

## A real App Store build

Wrap this folder with Capacitor (`npm i @capacitor/core @capacitor/ios`,
`npx cap add ios`, `npx cap open ios`). Needs a Mac with Xcode. Free Apple ID
signing expires every 7 days; the App Store needs the Developer Program at
99 USD a year. It is also the only route to real scheduled notifications.
