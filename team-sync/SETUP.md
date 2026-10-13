# Set up a shared team sheet (5 minutes, free)

By default, the tool saves meetings in one browser. Connect a Google Sheet so that:

- **everyone on the team sees the same meetings, people and follow-ups**, on any device
- the sheet keeps a readable **Action Items** tab you can sort, filter and print
- the **team lead gets an overdue digest by email every Monday**, automatically

You need a Google account. Nothing else to install, and it stays free for normal team use.

## 1. Make the sheet

Create a new Google Sheet, for example "Team action items". Leave it empty; the tabs are created for you.

## 2. Add the script

1. In the sheet, click **Extensions → Apps Script**.
2. Delete what's in the editor, then paste in everything from [`Code.gs`](Code.gs).
3. Near the top, change `PASSCODE = 'change-me'` to a passcode your team will use, for example `'pantry-2026'`.
4. Optionally set `TEAM_NAME` (used in the digest email subject).
5. Click the **Save** icon.

## 3. Deploy it as a web app

1. Click **Deploy → New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Set **Execute as: Me** and **Who has access: Anyone**.
4. Click **Deploy**, then **Authorize access** and approve with your Google account. Google warns that the app isn't verified because you wrote it yourself; click **Advanced → Go to (project name)**.
5. Copy the **Web app URL**. It ends in `/exec`.

"Anyone" means the link works without a Google login, which is what lets the tool reach it. The passcode is what keeps other people out, so pick one that isn't easy to guess, and share the passcode separately from the link.

## 4. Connect the tool

1. Open the tool and expand **Team & shared history**.
2. Paste the Web app URL and the passcode, then click **Connect team sheet**.
3. Click **Copy tailored link** and send it to your team. The link includes the sheet; each person enters the passcode once.

Any meetings already saved in your browser are uploaded to the sheet when you connect.

## 5. Turn on the Monday digest (optional)

1. In the tool, under **Team & shared history**, check **Team lead** next to whoever should get the digest, and make sure they have an email.
2. In the Apps Script editor, choose `installWeeklyDigest` from the function menu and click **Run**. Approve the email permission when asked.

From then on, every Monday around 8am (in the script's time zone, set under **Project Settings**) the team lead gets an email listing overdue items, items due that week, and anything blocked. To test it right away, run `sendWeeklyDigest`.

## Updating the script later

If you change `Code.gs`, use **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. This keeps the same URL, so nobody has to reconnect.

## What's stored

- **Meetings tab:** one row per meeting (summary, action items, decisions, follow-ups). Raw notes and recordings are never sent to the sheet.
- **People tab:** names, emails, preferred languages, and who is team lead.
- **Action Items tab:** a readable list of every task and its latest status, rewritten each time someone saves.

The data lives in your own Google Drive, under your organization's control. To stop sharing, delete the deployment or the sheet.
