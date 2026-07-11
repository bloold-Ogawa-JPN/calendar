document.addEventListener("DOMContentLoaded", () => {
  // DOM要素の取得
  const themeToggle = document.getElementById("themetoggle");
  const todayBtn = document.getElementById("todaybtn");
  const prevMonthBtn = document.getElementById("prevmonth");
  const nextMonthBtn = document.getElementById("nextmonth");
  const monthTitle = document.getElementById("monthtitle");
  const calendarBody = document.getElementById("calendarbody");
  const clockEl = document.getElementById("clock");

  // アプリの状態
  let currentDate = new Date();

  // 1. ダークモード切り替え
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");
  });

  // 2. 時計機能
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}:${seconds}`;
  }
  setInterval(updateClock, 1000);
  updateClock();

  // 3. カレンダー描画ロジック
  function renderCalendar(date) {
    calendarBody.innerHTML = "";
    
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11

    // タイトル更新 (例: 2026年7月)
    monthTitle.textContent = `${year}年${month + 1}月`;

    // 月の初日の曜日 (0:日 ~ 6:土)
    const firstDayIndex = new Date(year, month, 1).getDay();

    // 月の最終日（←あなたのコードの唯一のバグを修正）
    const lastDay = new Date(year, month + 1, 0).getDate();

    let dateCounter = 1;
    const today = new Date();

    // 最大6行分のループ
    for (let i = 0; i < 6; i++) {
      const row = document.createElement("tr");
      let hasCells = false;

      for (let j = 0; j < 7; j++) {
        const cell = document.createElement("td");

        if (i === 0 && j < firstDayIndex) {
          // 初日の前は空セル
          cell.classList.add("day-cell", "empty");
        } else if (dateCounter > lastDay) {
          // 月末以降は空セル
          cell.classList.add("day-cell", "empty");
        } else {
          hasCells = true;
          const currentLoopDate = new Date(year, month, dateCounter);
          cell.classList.add("day-cell");
          
          // 日付のテキスト追加
          const dateText = document.createElement("span");
          dateText.textContent = dateCounter;
          cell.appendChild(dateText);

          // 曜日クラス付与
          if (j === 0) cell.classList.add("sunday");
          if (j === 6) cell.classList.add("saturday");

          // 今日判定
          if (
            year === today.getFullYear() &&
            month === today.getMonth() &&
            dateCounter === today.getDate()
          ) {
            cell.classList.add("today");
          }

          // 祝日判定
          if (typeof window.JapaneseHolidays !== "undefined") {
            const holidayName = window.JapaneseHolidays.isHoliday(currentLoopDate);

            // holidayName は「海の日」「山の日」などの文字列
            if (holidayName) {
              cell.classList.add("holiday");

              // 祝日名を小さく表示
              const label = document.createElement("span");
              label.classList.add("holiday-name");
              label.textContent = holidayName;
              cell.appendChild(label);
            }
          }

          dateCounter++;
        }

        row.appendChild(cell);
      }

      // 中身が空の行は追加しない
      if (!hasCells && i > 0) break;
      calendarBody.appendChild(row);
    }
  }

  // 4. イベントリスナー
  prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
  });

  nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
  });

  todayBtn.addEventListener("click", () => {
    currentDate = new Date();
    renderCalendar(currentDate);
  });

  // 初回実行
  renderCalendar(currentDate);
});
