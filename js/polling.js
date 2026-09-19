/* MouseTestHQ — Mouse Polling Rate Checker */
(function () {
  'use strict';

  const WINDOW_MS = 1000;
  const HISTORY_SIZE = 120; // 2 minutes at 1Hz updates
  const CHART_POINTS = 60;

  const stage = document.getElementById('poll-stage');
  const currentEl = document.getElementById('poll-current');
  const currentStatEl = document.getElementById('poll-current-stat');
  const avgEl = document.getElementById('poll-avg');
  const minEl = document.getElementById('poll-min');
  const maxEl = document.getElementById('poll-max');
  const stabilityEl = document.getElementById('poll-stability');
  const statusEl = document.getElementById('poll-status');
  const canvas = document.getElementById('pollChart');
  const resetBtn = document.getElementById('poll-reset');

  const ctx = canvas.getContext('2d');
  let samples = []; // {t, count, hz}
  let eventTimes = [];
  let intervalHandle = null;
  let firstMoveAt = 0;

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(300, rect.width * dpr);
    canvas.height = Math.max(200, rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawChart();
  }

  function computeStability(values) {
    if (values.length < 2) return 0;
    const avg = values.reduce(function (a, b) { return a + b; }, 0) / values.length;
    if (avg === 0) return 0;
    const variance = values.reduce(function (acc, v) { return acc + Math.pow(v - avg, 2); }, 0) / values.length;
    const std = Math.sqrt(variance);
    const cv = std / avg; // coefficient of variation
    return Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
  }

  function drawChart() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    // Background grid
    ctx.strokeStyle = 'rgba(127,127,127,0.15)';
    ctx.lineWidth = 1;
    const rows = 4;
    for (let i = 1; i < rows; i++) {
      const y = (h / rows) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (samples.length < 2) {
      ctx.fillStyle = '#6b7280';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Move your mouse in the box above to see the chart', w / 2, h / 2);
      return;
    }

    // Pick y-axis: max of (max sample, 1100) so 1000Hz line is visible
    const yMax = Math.max(1100, Math.max.apply(null, samples.map(function (s) { return s.hz; })) * 1.1);
    const yMin = 0;
    const stepX = w / Math.max(1, samples.length - 1);

    // Reference lines for common rates
    const refs = [
      { hz: 125, label: '125', color: 'rgba(127,127,127,0.4)' },
      { hz: 500, label: '500', color: 'rgba(127,127,127,0.4)' },
      { hz: 1000, label: '1000', color: 'rgba(59,130,246,0.3)' },
      { hz: 4000, label: '4000', color: 'rgba(127,127,127,0.3)' },
      { hz: 8000, label: '8000', color: 'rgba(127,127,127,0.3)' }
    ];
    refs.forEach(function (r) {
      if (r.hz > yMax) return;
      const y = h - ((r.hz - yMin) / (yMax - yMin)) * h;
      ctx.strokeStyle = r.color;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText(r.label, 4, y - 2);
    });

    // Area path
    ctx.beginPath();
    samples.forEach(function (s, i) {
      const x = i * stepX;
      const y = h - ((s.hz - yMin) / (yMax - yMin)) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    // Fill under the line
    const lastX = (samples.length - 1) * stepX;
    ctx.lineTo(lastX, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(59,130,246,0.45)');
    grad.addColorStop(1, 'rgba(59,130,246,0.02)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Stroke the line on top
    ctx.beginPath();
    samples.forEach(function (s, i) {
      const x = i * stepX;
      const y = h - ((s.hz - yMin) / (yMax - yMin)) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function updateStats() {
    if (samples.length === 0) {
      currentEl.textContent = '0';
      currentStatEl.textContent = '0';
      avgEl.textContent = '0';
      minEl.textContent = '0';
      maxEl.textContent = '0';
      stabilityEl.textContent = '0%';
      return;
    }
    const values = samples.map(function (s) { return s.hz; });
    const last = values[values.length - 1];
    const sum = values.reduce(function (a, b) { return a + b; }, 0);
    const avg = sum / values.length;
    const min = Math.min.apply(null, values);
    const max = Math.max.apply(null, values);
    const stab = computeStability(values);
    currentEl.textContent = Math.round(last);
    currentStatEl.textContent = Math.round(last);
    avgEl.textContent = Math.round(avg);
    minEl.textContent = Math.round(min);
    maxEl.textContent = Math.round(max);
    stabilityEl.textContent = stab + '%';
  }

  function tick() {
    const now = performance.now();
    // Drop events older than WINDOW_MS
    while (eventTimes.length && now - eventTimes[0] > WINDOW_MS) {
      eventTimes.shift();
    }
    const hz = eventTimes.length; // events in last 1s = Hz
    samples.push({ t: now, count: eventTimes.length, hz: hz });
    while (samples.length > CHART_POINTS) samples.shift();

    updateStats();
    drawChart();
  }

  function onMove(e) {
    if (firstMoveAt === 0) firstMoveAt = performance.now();
    eventTimes.push(performance.now());
    if (!intervalHandle) {
      statusEl.textContent = 'Measuring... keep moving';
      stage.classList.remove('idle');
      stage.classList.add('active');
      intervalHandle = setInterval(tick, 250);
    }
  }

  function reset() {
    samples = [];
    eventTimes = [];
    firstMoveAt = 0;
    if (intervalHandle) clearInterval(intervalHandle);
    intervalHandle = null;
    stage.classList.remove('active');
    stage.classList.add('idle');
    statusEl.textContent = 'Move your mouse inside this box to start';
    updateStats();
    drawChart();
  }

  stage.addEventListener('mousemove', onMove);
  resetBtn.addEventListener('click', reset);
  window.addEventListener('resize', resizeCanvas);

  resizeCanvas();
  reset();
})();
