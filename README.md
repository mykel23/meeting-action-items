# Meeting Notes → Action Items

A small web tool that turns messy meeting notes into a clean list of **who is doing what, by when**, plus the decisions made and the questions still open. It checks what got done since the last meeting, flags overdue work, and sends each person their tasks. It uses Claude through the Anthropic API.

**Live demo: [mykel23.github.io/meeting-action-items](https://mykel23.github.io/meeting-action-items/)** (click "See demo result", no API key needed)

## Why I built this

I'm a project manager. After most meetings, the hardest part isn't the meeting itself. It's making sure every task has an owner and a deadline, that nothing said in passing gets lost, and that last week's commitments actually got done. Small teams and nonprofits often don't have a dedicated coordinator to do this, so I built a tool that does the first pass in seconds.

![Screenshot: the tool set up for a food pantry, showing follow-ups from last meeting, new action items, and send options](screenshot.png)

## What it does

- **Tailors itself to your organization.** A 30-second setup asks for your organization's name and type (food bank, housing, health clinic, youth program, legal aid, workforce, or general), the kind of meetings you run, and what to watch most closely. The page title, wording, sample notes and Claude's priorities all adjust to fit.
- **Pulls out every action item** with its owner, due date and priority, plus a short summary, decisions made and open questions. Tasks nobody claimed are marked **Unassigned** instead of guessing an owner.
- **Checks progress since the last meeting.** Results are saved in the browser, and at the next meeting Claude checks each earlier item against the new notes: done, in progress, blocked, or not mentioned. Anything past its due date and not done is flagged **Overdue**.
- **Emails each owner their own tasks.** One click opens a ready-to-send draft with that person's new tasks and anything still open from last time. There's also a full recap email for the whole team.
- **Sends tasks to the tools teams already use**, with no account connection:
  - **Google Sheets / Excel:** copy and paste straight into cells, or download a CSV
  - **Asana:** download a file formatted for Asana's CSV importer, with assignees and due dates
  - **Trello:** copy a list that Trello turns into one card per line

## Try it

1. Open the live demo, or download `index.html` and open it in any browser. No install needed.
2. Click **See demo result** to see sample output, including last meeting's follow-ups.
3. To run it on your own notes, paste a Claude API key (from [platform.claude.com](https://platform.claude.com)), pick the meeting date, paste your notes, and click **Extract action items**.

Your key stays in the browser tab and is never saved. Notes are sent directly to Anthropic's API and nowhere else.

## How it works

- A single HTML file with plain JavaScript, no frameworks, server or build step
- Calls the Claude Messages API with a system prompt that asks for structured JSON
- The prompt includes the meeting date, so Claude can turn "Thursday" or "the 30th" into a real calendar date
- When an earlier meeting is selected, its action items are numbered and sent along, and Claude reports a status for each one by number

## How the tailoring works

- Each organization type has its own guidance in Claude's instructions. For example, a food bank's fridge temperature problem is flagged high priority, and a legal aid clinic's filing deadline is never dropped.
- The areas a team checks in setup (deadlines, safety, client follow-ups, staffing, budget) tell Claude what it must not miss.
- **Copy tailored link** creates a link (for example `?type=legal&org=Houston+Legal+Aid`) that a whole team can open to skip setup.
- For organizations that handle sensitive client information, the page reminds staff to use initials instead of full names or health details.

## Design choices

- **No guessing owners.** A wrong owner is worse than a blank one, because the task looks handled when it isn't. Unclaimed tasks also appear under open questions.
- **Overdue is calculated, not guessed.** Claude reports what the notes say about each item; the page decides "overdue" with a plain date comparison, so it's predictable and checkable.
- **No raw notes are stored.** Only the extracted results are saved, in the user's own browser, and they can be cleared with one click.
- **No integrations to set up.** Email uses the user's own mail app, and exports use formats Asana, Trello and Sheets already accept, so a nonprofit can use it the day they find it.
- **Bring your own key.** Anyone can run it for a cent or two per meeting.

## Ideas for next steps

- Record or upload meeting audio and transcribe it, so no one has to take notes
- A shared team history (instead of one browser) so everyone sees the same follow-ups
- A weekly "what's overdue" digest emailed to the team lead
- Calendar invites (.ics) for tasks with due dates
- Translate each person's task email into their preferred language
