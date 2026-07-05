// ===== DOM =====
const calendarBody = document.getElementById('calendarBody');
const monthTitle = document.getElementById('monthTitle');
const themeToggle = document.getElementById('themeToggle');
const todayBtn = document.getElementById('todayBtn');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const clockEl = document.getElementById('clock');

let currentDate = new Date();
let eventsByDate = {}; // 'YYYY-MM-DD' → true

// ===== Utility =====
function formatDateKey(date) {
  const y = date.getFullYear();
  const m = ('0' + (date.getMonth() + 1)).slice(-2);
  const d = ('0' + date.getDate()).slice(-2);
  return `${y}-${m}-${d}`;
}

// 日本の祝日ライブラリ版
function isJapaneseHoliday(date) {
  return JapaneseHolidays.isHoliday(date) !== null;
}

// ===== Calendar Rendering =====
function renderCalendar(withAnim = false) {
  calendarBody.innerHTML = '';

  if (withAnim) {
    calendarBody.classList.remove('calendar-body-anim');
    void calendarBody.offsetWidth;
    calendarBody.classList.add('calendar-body-anim');
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  monthTitle.textContent = `${year}年 ${month + 1}月`;

  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let row = document.createElement('tr');

  for (let i = 0; i < startWeekday; i++) {
    row.appendChild(document.createElement('td'));
  }

  const todayKey = formatDateKey(new Date());

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const weekday = date.getDay();
    const dateKey = formatDateKey(date);

    const td = document.createElement('td');
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('day');

    if (weekday === 0) dayDiv.classList.add('sun');
    else if (weekday === 6) dayDiv.classList.add('sat');
    else dayDiv.classList.add('weekday');

    if (isJapaneseHoliday(date)) dayDiv.classList.add('holiday');

    if (dateKey === todayKey) dayDiv.classList.add('today');

    dayDiv.textContent = day;

    if (eventsByDate[dateKey]) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      dayDiv.appendChild(dot);
    }

    td.appendChild(dayDiv);
    row.appendChild(td);

    if (weekday === 6) {
      calendarBody.appendChild(row);
      row = document.createElement('tr');
    }

console.log(dateKey, {
  weekday,
  isHoliday: isJapaneseHoliday(date),
  holidayObj: JapaneseHolidays.isHoliday(date)
});  }

  if (row.children.length > 0) {
    while (row.children.length < 7) {
      row.appendChild(document.createElement('td'));
    }
    calendarBody.appendChild(row);
  }
}

// ===== Clock =====
function updateClock() {
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
setInterval(updateClock, 1000);
updateClock();

// ===== Theme Toggle =====
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  document.body.classList.toggle('dark');
});

// ===== Month Navigation =====
prevMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(true);
  loadEventsForCurrentMonth();
});

nextMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(true);
  loadEventsForCurrentMonth();
});

todayBtn.addEventListener('click', () => {
  currentDate = new Date();
  renderCalendar(true);
  loadEventsForCurrentMonth();
});

// ===== Google Calendar =====
const googleAuthBtn = document.getElementById('googleAuthBtn');
const reloadEventsBtn = document.getElementById('reloadEventsBtn');

const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
const API_KEY = 'YOUR_API_KEY';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

let gapiInited = false;
let isSignedIn = false;

function gapiLoaded() {
  gapi.load('client:auth2', initClient);
}

function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES,
  }).then(() => {
    gapiInited = true;
    const auth = gapi.auth2.getAuthInstance();
    isSignedIn = auth.isSignedIn.get();

    auth.isSignedIn.listen((signedIn) => {
      isSignedIn = signedIn;
      if (signedIn) loadEventsForCurrentMonth();
    });

    if (isSignedIn) loadEventsForCurrentMonth();
  });
}

googleAuthBtn.addEventListener('click', () => {
  if (!gapiInited) return;
  const auth = gapi.auth2.getAuthInstance();

  if (!auth.isSignedIn.get()) {
    auth.signIn();
  } else {
    auth.signOut();
    eventsByDate = {};
    renderCalendar();
  }
});

reloadEventsBtn.addEventListener('click', () => {
  if (isSignedIn) loadEventsForCurrentMonth();
});

function loadEventsForCurrentMonth() {
  if (!gapiInited || !isSignedIn) return;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  const timeMin = start.toISOString();
  const timeMax = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1).toISOString();

  gapi.client.calendar.events.list({
    calendarId: 'primary',
    timeMin,
    timeMax,
    showDeleted: false,
    singleEvents: true,
    orderBy: 'startTime',
  }).then(response => {
    eventsByDate = {};
    const events = response.result.items || [];

    events.forEach(ev => {
      let dateStr = ev.start.date || ev.start.dateTime?.substring(0, 10);
      if (dateStr) eventsByDate[dateStr] = true;
    });

    renderCalendar();
  });
}

// 初期化
window.onload = () => {
  renderCalendar();
  gapiLoaded();
};
