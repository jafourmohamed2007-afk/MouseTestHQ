/* MouseTestHQ — Click Speed Test (CPS counter) */
(function () {
  'use strict';

  const BEST_KEY = 'mthq_cps_best';
  const STORAGE_VERSION = 'v1';

  const stage = document.getElementById('cps-stage');
  const countEl = document.getElementById('cps-count');
  const stateLabel = document.getElementById('cps-state-label');
  const timerEl = document.getElementById('cps-timer');
  const resultEl = document.getElementById('cps-result');
  const durationButtons = document.querySelectorAll('[data-duration]');
  const resetBtn = document.getElementById('cps-reset');
  const shareBtn = document.getElementById('cps-share');

  let duration = 1;
  let state = 'idle'; // idle | running | done
  let clicks = [];
  let timerHandle = null;
  let tickHandle = null;
  let startedAt = 0;

  function getBest() {
    try {
      const raw = localStorage.getItem(BEST_KEY);
      if (!raw) return 0;
      const data = JSON.parse(raw);
      return (data && data.version === STORAGE_VERSION) ? (data.best || 0) : 0;
    } catch (e) { return 0; }
  }

  function saveBest(score) {
    try {
      localStorage.setItem(BEST_KEY, JSON.stringify({ version: STORAGE_VERSION, best: score, at: Date.now() }));
    } catch (e) {}
  }

  function rankFor(avgCps) {
    if (avgCps >= 14) return 'Elite';
    if (avgCps >= 10) return 'Excellent';
    if (avgCps >= 8) return 'Good';
    if (avgCps >= 6) return 'Average';
    if (avgCps >= 4) return 'Beginner';
    return '—';
  }

  function setDuration(d) {
    duration = d;
    durationButtons.forEach(function (b) {
      b.classList.toggle('active', Number(b.getAttribute('data-duration')) === d);
    });
    reset();
  }

  function reset() {
    state = 'idle';
    clicks = [];
    if (timerHandle) clearTimeout(timerHandle);
    if (tickHandle) clearInterval(tickHandle);
    timerHandle = null;
    tickHandle = null;
    stage.classList.remove('active');
    stage.classList.add('idle');
    countEl.textContent = '0';
    stateLabel.textContent = 'CLICKS';
    timerEl.textContent = 'Click here to start';
    resultEl.style.display = 'none';
    shareBtn.disabled = true;
  }

  function startTest() {
    if (state === 'running') return;
    state = 'running';
    clicks = [];
    startedAt = performance.now();
    stage.classList.remove('idle');
    stage.classList.add('active');
    stateLabel.textContent = 'CLICKS';

    const endAt = startedAt + duration * 1000;
    timerHandle = setTimeout(finishTest, duration * 1000 + 50);
    tickHandle = setInterval(function () {
      const remaining = Math.max(0, (endAt - performance.now()) / 1000);
      timerEl.textContent = remaining.toFixed(1) + 's remaining';
      if (remaining <= 0) {
        clearInterval(tickHandle);
        tickHandle = null;
      }
    }, 50);
  }

  function finishTest() {
    if (state !== 'running') return;
    state = 'done';
    if (tickHandle) clearInterval(tickHandle);
    stage.classList.remove('active');
    stage.classList.add('idle');
    stateLabel.textContent = 'FINAL';
    timerEl.textContent = 'Click to restart';
    showResult();
  }

  function showResult() {
    const total = clicks.length;
    const elapsedSec = (clicks[clicks.length - 1] - clicks[0]) / 1000 || duration;
    const avg = total / duration;

    // Peak CPS over rolling 1s window
    let peak = 0;
    for (let i = 0; i < clicks.length; i++) {
      let j = i;
      while (j < clicks.length && clicks[j] - clicks[i] <= 1000) j++;
      const window = j - i;
      if (window > peak) peak = window;
    }

    const best = getBest();
    const newBest = Math.max(best, avg);
    if (newBest > best) saveBest(newBest);

    document.getElementById('cps-result-clicks').textContent = total;
    document.getElementById('cps-result-avg').textContent = avg.toFixed(2);
    document.getElementById('cps-result-peak').textContent = peak;
    document.getElementById('cps-result-duration').textContent = duration + 's (' + elapsedSec.toFixed(2) + 's active)';
    document.getElementById('cps-result-best').textContent = newBest.toFixed(2);
    document.getElementById('cps-result-rank').textContent = rankFor(avg);
    resultEl.style.display = 'block';
    shareBtn.disabled = false;

    // Store last result for share
    shareBtn.dataset.text = 'I scored ' + avg.toFixed(2) + ' CPS on MouseTestHQ (' + total + ' clicks in ' + duration + 's) — rank: ' + rankFor(avg);
  }

  function onStageClick(e) {
    if (e.button !== undefined && e.button !== 0) return; // ignore right/middle
    if (state === 'idle') {
      startTest();
      // Count this first click
      clicks.push(performance.now());
      countEl.textContent = '1';
      return;
    }
    if (state === 'running') {
      clicks.push(performance.now());
      countEl.textContent = String(clicks.length);
    }
  }

  function onStageContextMenu(e) { e.preventDefault(); }

  function shareResult() {
    const text = shareBtn.dataset.text || 'Check out MouseTestHQ!';
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: 'My CPS Score', text: text, url: url }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text + '\n' + url).then(function () {
        shareBtn.textContent = 'Copied!';
        setTimeout(function () { shareBtn.textContent = 'Share Score'; }, 1500);
      }).catch(function () {});
    } else {
      window.prompt('Copy your result:', text + '\n' + url);
    }
  }

  // ---- Wire up ----
  stage.addEventListener('mousedown', onStageClick);
  stage.addEventListener('contextmenu', onStageContextMenu);
  stage.addEventListener('touchstart', function (e) {
    e.preventDefault();
    if (state === 'idle') {
      startTest();
      clicks.push(performance.now());
      countEl.textContent = '1';
    } else if (state === 'running') {
      clicks.push(performance.now());
      countEl.textContent = String(clicks.length);
    }
  }, { passive: false });

  durationButtons.forEach(function (b) {
    b.addEventListener('click', function () { setDuration(Number(b.getAttribute('data-duration'))); });
  });
  resetBtn.addEventListener('click', reset);
  shareBtn.addEventListener('click', shareResult);

  // Display best on load
  reset();
  const initialBest = getBest();
  if (initialBest > 0) {
    timerEl.textContent = 'Click here to start — best: ' + initialBest.toFixed(2) + ' CPS';
  }
})();
