# Meeting Notes → Action Items

A web tool that turns a meeting, typed or recorded, into a clear list of **who is doing what, by when**. It checks what got done since earlier meetings, flags overdue work, emails each person their tasks in their own language, and sends the team lead a weekly overdue digest. It uses Claude through the Anthropic API.

**Live demo: [mykel23.github.io/meeting-action-items](https://mykel23.github.io/meeting-action-items/)** (click "See demo result", no API key needed)

## Why I built this

I'm a project manager. After most meetings, the hardest part isn't the meeting itself. It's making sure every task has an owner and a deadline, that nothing said in passing gets lost, and that last week's commitments actually got done. Small teams and nonprofits often don't have a dedicated coordinator to do this, and many of their volunteers speak a language other than English. I built a tool that handles the follow-through so the team can focus on the work.

![Screenshot: the tool set up for a food pantry, showing follow-ups, editable action items, send options and the weekly overdue digest](screenshot.png)

## What it does

**Capture the meeting**
- **Type notes, record the meeting, or both.** "Record the meeting" turns speech into text live in the browser, in English, Spanish, Vietnamese, Mandarin and more. The transcript is editable, and Claude reads it together with any typed notes.
- **Tailored to your organization.** A 30-second setup (food bank, housing, health clinic, youth program, legal aid, workforce, or general) adjusts the page wording, sample notes and how Claude prioritizes. A food bank's fridge problem is flagged urgent; a legal clinic's filing deadline is never dropped.

**Turn it into action**
- Pulls out every action item with an **owner**, **due date** (converted to a real calendar date) and **priority** (urgent, high, medium, low), plus a summary, decisions and open questions.
- **Edit anything that's off.** Change a priority or reassign an owner and the list re-sorts, and emails, exports and saved history all update.
- **Follow-up across meetings.** Every open item from earlier meetings is checked against the new one: done, in progress, blocked, or not mentioned. Anything past due is flagged **Overdue**, and statuses can be changed by hand.

**Get it to people**
- **Email each owner their tasks**, translated by Claude into each person's preferred language, as a ready-to-send draft in your own email app.
- **Weekly overdue digest** for the team lead: what's overdue, due this week, or blocked. Send it in one click, add a Monday calendar reminder, or let the team sheet email it automatically every Monday.
- **Send to task tools** with no account connection: paste into Google Sheets or Excel, import into Asana, or paste into Trello as cards.

**Work as a team**
- A **team roster** stores names, emails, languages and who the team lead is.
- **Shared team history:** connect a free Google Sheet ([5-minute setup](team-sync/SETUP.md)) so everyone sees the same meetings and follow-ups on any device. The sheet also keeps a readable Action Items tab.
- Teams without Google can move history between devices with a backup file.

## Try it

1. Open the live demo and click **See demo result**. The demo shows follow-ups, editable priorities, send options and the digest.
2. To use it for real, paste a Claude API key (from [platform.claude.com](https://platform.claude.com)), type notes or record, and click **Extract action items**.
3. Optional: set up a [shared team sheet](team-sync/SETUP.md) and share your tailored link with the team.

Your key stays in the browser tab and is never saved.

## How it works

- **One HTML file** with plain JavaScript and no framework, server or build step. It runs on free GitHub Pages hosting.
- **Claude** (Messages API) turns notes and transcripts into structured JSON, checks earlier items by number, and translates task emails.
- **Speech-to-text** uses the browser's built-in speech recognition, so there's no extra service or cost. It restarts automatically through pauses and keeps a phone's screen awake while recording.
- **Team sheet:** a short Google Apps Script ([`team-sync/Code.gs`](team-sync/Code.gs)) acts as a free, passcode-protected backend and runs the Monday digest on a timer.

## Design choices

- **Never guess an owner.** A wrong owner is worse than a blank one, because the task looks handled when it isn't. For recordings, which have no speaker labels, Claude only assigns an owner when a name is said with the task.
- **Overdue is calculated, not guessed.** Claude reports what the meeting said about each item; the page decides "overdue" with a plain date comparison, so it's predictable and checkable.
- **Silence doesn't undo progress.** If an item was "in progress" last week and isn't mentioned this week, it stays in progress.
- **Raw notes and recordings are never stored.** Only the extracted results are saved, in the user's browser or their own team sheet. Organizations handling client information are reminded to use initials.
- **No integrations to set up.** Email uses the user's own mail app, and exports use formats Asana, Trello and Sheets already accept, so a nonprofit can use it the day they find it.

## Limits

- Voice recording works in Chrome, Edge and Safari. Firefox doesn't support browser speech recognition, so Firefox users can type notes.
- The browser's speech service (Google in Chrome, Apple in Safari) processes the audio while recording.
- Without a team sheet, the Monday digest is one click plus a calendar reminder, not fully automatic.

## Ideas for next steps

- Upload a recording after the meeting instead of recording live
- Speaker identification, so owners can be matched to voices
- A board- or funder-ready monthly progress report built from the meeting history
- SMS reminders for volunteers who don't use email
