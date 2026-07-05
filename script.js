// ===== DOM =====
const calendarBody = document.getElementById('calendarBody');
const monthTitle = document.getElementById('monthTitle');
const themeToggle = document.getElementById('themeToggle');
const todayBtn = document.getElementById('todayBtn');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const clockEl = document.getElementById('clock');

let currentDate = new Date();

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

    td.appendChild(dayDiv);
    row.appendChild(td);

    if (weekday === 6) {
      calendarBody.appendChild(row);
      row = document.createElement('tr');
    }
  }

  if (row.children.length > 0) {
    while (row.children.length < 7) {
      row.appendChild(document.createElement('td'));
    }
    calendarBody.appendChild(row);
  }
//ログ
  console.log(dateKey, JapaneseHolidays.isHoliday(date));
//ログ
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
});

nextMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(true);
});

todayBtn.addEventListener('click', () => {
  currentDate = new Date();
  renderCalendar(true);
});

// 初期化
window.onload = () => {
  renderCalendar();
};
