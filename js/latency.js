/* MouseTestHQ — Click Latency / Reaction Time Test */
(function () {
  'use strict';

  const stage = document.getElementById('latency-stage');
  const msg = document.getElementById('latency-msg');
  const bestEl = document.getElementById('lat-best');
  const avgEl = document.getElementById('lat-avg');
  const medianEl = document.getElementById('lat-median');
  const worstEl = document.getElementById('lat-worst');
  const stdEl = document.getElementById('lat-std');
  const progressEl = document.getElementById('lat-progress');
  const histogramEl = document.getElementById('latency-histogram');
  const resetBtn = document.getElementById('lat-reset');
  const roundsButtons = document.querySelectorAll('[data-rounds]');

  let totalRounds = 10;
  let state = 'idle'; // idle | waiting | ready | done
  let results = [];
  let currentRound = 0;
  let readyAt = 0;
  let waitTimer = null;

  function median(arr) {
    if (arr.length === 0) return 0;
    const sorted = arr.slice().sort(function (a, b) { return a - b; });
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  function stddev(arr) {
    if (arr.length === 0) return 0;
    const avg = arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
    const v = arr.reduce(function (acc, v) { return acc + Math.pow(v - avg, 2); }, 0) / arr.length;
    return Math.sqrt(v);
  }

  function updateStats() {
    if (results.length === 0) {
      bestEl.textContent = '—';
      avgEl.textContent = '—';
      medianEl.textContent = '—';
      worstEl.textContent = '—';
      stdEl.textContent = '—';
      histogramEl.innerHTML = '';
      return;
    }
    const min = Math.min.apply(null, results);
    const max = Math.max.apply(null, results);
    const avg = results.reduce(function (a, b) { return a + b; }, 0) / results.length;
    bestEl.textContent = min;
    avgEl.textContent = avg.toFixed(0);
    medianEl.textContent = median(results).toFixed(0);
    worstEl.textContent = max;
    stdEl.textContent = stddev(results).toFixed(0);

    // Histogram with 10 buckets
    histogramEl.innerHTML = '';
    const buckets = 10;
    const range = max - min || 1;
    const counts = new Array(buckets).fill(0);
    results.forEach(function (v) {
      const idx = Math.min(buckets - 1, Math.floor((v - min) / range * buckets));
      counts[idx]++;
    });
    const peak = Math.max.apply(null, counts);
    counts.forEach(function (count, i) {
      const bar = document.createElement('div');
      bar.className = 'bar';
      const heightPct = peak > 0 ? (count / peak) * 100 : 0;
      bar.style.height = heightPct + '%';
      bar.title = (min + i * (range / buckets)).toFixed(0) + '–' + (min + (i + 1) * (range / buckets)).toFixed(0) + ' ms (' + count + ')';
      histogramEl.appendChild(bar);
    });
  }

  function updateProgress() {
    progressEl.textContent = results.length + ' / ' + totalRounds;
  }

  function setStage(stateName, message) {
    state = stateName;
    stage.classList.remove('waiting', 'go', 'tooSoon');
    if (stateName === 'waiting') stage.classList.add('waiting');
    else if (stateName === 'ready') stage.classList.add('go');
    else if (stateName === 'tooSoon') stage.classList.add('tooSoon');
    if (message) msg.textContent = message;
  }

  function startNextRound() {
    if (currentRound >= totalRounds) {
      finishTest();
      return;
    }
    currentRound++;
    updateProgress();
    setStage('waiting', 'Wait for green... round ' + currentRound + ' / ' + totalRounds);
    // Random delay 1.5–4s
    const delay = 1500 + Math.random() * 2500;
    waitTimer = setTimeout(function () {
      readyAt = performance.now();
      setStage('ready', 'CLICK NOW!');
    }, delay);
  }

  function handleClick(e) {
    if (e && e.button !== undefined && e.button !== 0) return;

    if (state === 'idle' || state === 'done') {
      currentRound = 0;
      results = [];
      updateStats();
      updateProgress();
      startNextRound();
      return;
    }

    if (state === 'waiting') {
      // False start
      clearTimeout(waitTimer);
      setStage('tooSoon', 'Too soon! Click to retry this round.');
      return;
    }

    if (state === 'tooSoon') {
      startNextRound();
      return;
    }

    if (state === 'ready') {
      const reaction = performance.now() - readyAt;
      results.push(Math.round(reaction));
      updateStats();
      updateProgress();
      // Brief feedback before next round
      setStage('waiting', reaction + ' ms — round ' + currentRound + ' done');
      setTimeout(function () {
        if (currentRound < totalRounds) {
          startNextRound();
        } else {
          finishTest();
        }
      }, 700);
    }
  }

  function finishTest() {
    const avg = results.reduce(function (a, b) { return a + b; }, 0) / results.length;
    setStage('done', 'Test complete — average ' + avg.toFixed(0) + ' ms. Click to restart.');
  }

  function reset() {
    currentRound = 0;
    results = [];
    if (waitTimer) clearTimeout(waitTimer);
    setStage('idle', 'Click to start — round 1 / ' + totalRounds);
    updateStats();
    updateProgress();
  }

  function setRounds(n) {
    totalRounds = n;
    roundsButtons.forEach(function (b) {
      b.classList.toggle('active', Number(b.getAttribute('data-rounds')) === n);
    });
    reset();
  }

  // ---- Wire up ----
  stage.addEventListener('mousedown', handleClick);
  stage.addEventListener('touchstart', function (e) { e.preventDefault(); handleClick({ button: 0 }); }, { passive: false });
  resetBtn.addEventListener('click', reset);
  roundsButtons.forEach(function (b) {
    b.addEventListener('click', function () { setRounds(Number(b.getAttribute('data-rounds'))); });
  });

  reset();
})();
