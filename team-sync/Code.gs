/**
 * Team sync for "Meeting Notes → Action Items"
 *
 * Paste this whole file into Extensions → Apps Script in a Google Sheet,
 * set a PASSCODE below, and deploy it as a web app (see SETUP.md).
 *
 * It stores your team's meetings and people in this sheet, keeps a readable
 * "Action Items" tab up to date, and can email the team lead a digest of
 * overdue items every Monday morning.
 */

// Choose a passcode and share it only with your team. Everyone enters it once in the tool.
const PASSCODE = 'change-me';

// Name shown in the Monday digest email subject.
const TEAM_NAME = 'Our team';

// Optional: the address of your tool, linked in the digest email.
const TOOL_URL = 'https://mykel23.github.io/meeting-action-items/';

/* ------------------------------------------------------------------ */

const MEETINGS = 'Meetings';
const PEOPLE = 'People';
const TRACKER = 'Action Items';

function doGet(e) {
  return respond(() => {
    checkCode(e.parameter.code);
    return { ok: true, meetings: readMeetings(), people: readPeople() };
  });
}

function doPost(e) {
  return respond(() => {
    const req = JSON.parse(e.postData.contents);
    checkCode(req.code);
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      if (req.action === 'saveMeetings') {
        (req.meetings || []).forEach(saveMeeting);
        if (Array.isArray(req.tracker)) writeTracker(req.tracker);
      } else if (req.action === 'savePeople') {
        writePeople(req.people || []);
      } else {
        throw new Error('Unknown action.');
      }
    } finally {
      lock.releaseLock();
    }
    return { ok: true };
  });
}

/* ---------- Helpers ---------- */

function respond(fn) {
  let out;
  try { out = fn(); } catch (err) { out = { ok: false, error: String(err.message || err) }; }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function checkCode(code) {
  if (PASSCODE === 'change-me') throw new Error('Set a PASSCODE in the script first (see the setup guide).');
  if (String(code || '') !== PASSCODE) throw new Error('Wrong team passcode.');
}

function sheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

/* ---------- Meetings: one row per meeting, full record as JSON ---------- */

function meetingsSheet() { return sheet(MEETINGS, ['id', 'meeting_date', 'saved_at', 'summary', 'json']); }

function readMeetings() {
  const sh = meetingsSheet();
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, 5).getValues()
    .map(r => { try { return JSON.parse(r[4]); } catch (e) { return null; } })
    .filter(Boolean);
}

function saveMeeting(m) {
  const sh = meetingsSheet();
  const row = [String(m.id), m.meetingDate || '', m.savedAt || '', m.summary || '', JSON.stringify(m)];
  const n = sh.getLastRow() - 1;
  if (n > 0) {
    const ids = sh.getRange(2, 1, n, 1).getValues().map(r => String(r[0]));
    const i = ids.indexOf(String(m.id));
    if (i >= 0) { sh.getRange(i + 2, 1, 1, 5).setValues([row]); return; }
  }
  sh.appendRow(row);
}

/* ---------- People ---------- */

function peopleSheet() { return sheet(PEOPLE, ['name', 'email', 'language', 'team_lead']); }

function readPeople() {
  const sh = peopleSheet();
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, 4).getValues()
    .filter(r => String(r[0]).trim())
    .map(r => ({ name: String(r[0]).trim(), email: String(r[1]).trim(), language: String(r[2] || 'English'), lead: r[3] === true || String(r[3]).toUpperCase() === 'TRUE' }));
}

function writePeople(people) {
  const sh = peopleSheet();
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 4).clearContent();
  if (!people.length) return;
  sh.getRange(2, 1, people.length, 4).setValues(people.map(p => [p.name || '', p.email || '', p.language || 'English', !!p.lead]));
}

/* ---------- Readable tracker tab (rewritten on every save) ---------- */

const TRACKER_HEADERS = ['Meeting date', 'Task', 'Owner', 'Due (as said)', 'Due date', 'Priority', 'Status', 'Overdue', 'Note', 'item_id'];

function writeTracker(rows) {
  const sh = sheet(TRACKER, TRACKER_HEADERS);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, TRACKER_HEADERS.length).clearContent();
  if (!rows.length) return;
  sh.getRange(2, 1, rows.length, TRACKER_HEADERS.length).setValues(rows.map(r =>
    [r.meeting_date, r.task, r.owner, r.due, r.due_date, r.priority, r.status, r.overdue, r.note, r.item_id]));
}

/* ---------- Monday digest (optional) ---------- */

/**
 * Run this ONCE from the Apps Script editor (select it, click Run) to email
 * the team lead every Monday around 8am. Run it again any time; it won't duplicate.
 */
function installWeeklyDigest() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'sendWeeklyDigest')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sendWeeklyDigest').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(8).create();
}

/** Builds the digest from the "Action Items" tab and emails every person marked team lead. */
function sendWeeklyDigest() {
  const leads = readPeople().filter(p => p.lead && p.email);
  if (!leads.length) return;

  const tz = Session.getScriptTimeZone();
  const today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  const weekEnd = Utilities.formatDate(new Date(Date.now() + 7 * 864e5), tz, 'yyyy-MM-dd');

  const sh = sheet(TRACKER, TRACKER_HEADERS);
  const n = sh.getLastRow() - 1;
  const rows = n > 0 ? sh.getRange(2, 1, n, TRACKER_HEADERS.length).getValues() : [];
  const asIso = v => v instanceof Date ? Utilities.formatDate(v, tz, 'yyyy-MM-dd') : String(v || '');
  const items = rows.map(r => ({ from: asIso(r[0]), task: r[1], owner: r[2] || 'Unassigned', due: r[3], dueDate: asIso(r[4]), status: r[6], note: r[8] }))
    .filter(it => it.status !== 'Done' && it.status !== 'No longer needed');

  const overdue = items.filter(it => it.dueDate && it.dueDate < today).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const soon = items.filter(it => it.dueDate && it.dueDate >= today && it.dueDate <= weekEnd).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const blocked = items.filter(it => it.status === 'Blocked' && !overdue.includes(it));

  const line = it => `- ${it.task} — ${it.owner} (due ${it.dueDate || it.due || 'no date'}; assigned ${it.from})${it.note ? ' — ' + it.note : ''}`;
  const body = [
    `Weekly action item digest — ${today}`, '',
    `${overdue.length} overdue · ${soon.length} due this week · ${blocked.length} blocked · ${items.length} open in total`
  ];
  if (overdue.length) { body.push('', 'OVERDUE'); overdue.forEach(it => body.push(line(it))); }
  if (soon.length) { body.push('', 'DUE IN THE NEXT 7 DAYS'); soon.forEach(it => body.push(line(it))); }
  if (blocked.length) { body.push('', 'BLOCKED'); blocked.forEach(it => body.push(line(it))); }
  if (!overdue.length && !soon.length && !blocked.length) body.push('', 'Nothing overdue, blocked or due this week.');
  if (TOOL_URL) body.push('', `Open the tracker: ${TOOL_URL}`);

  MailApp.sendEmail({
    to: leads.map(p => p.email).join(','),
    subject: `${TEAM_NAME}: ${overdue.length} overdue action item${overdue.length === 1 ? '' : 's'} this week`,
    body: body.join('\n')
  });
}
