/* MouseTestHQ — Mouse Button & Double Click Test
 * Detects every mouse button (left, middle, right, back, forward), the scroll
 * wheel, and flags "chatter": two presses of the same button closer together
 * than a human can physically click, which is the classic symptom of a worn
 * switch that double-clicks on its own.
 */
(function () {
  'use strict';

  var stage = document.getElementById('mb-stage');
  if (!stage) return;

  var BUTTONS = [
    { id: 0, key: 'left', name: 'Left' },
    { id: 1, key: 'middle', name: 'Middle (wheel)' },
    { id: 2, key: 'right', name: 'Right' },
    { id: 3, key: 'back', name: 'Back (side)' },
    { id: 4, key: 'forward', name: 'Forward (side)' }
  ];

  var thresholdSel = document.getElementById('mb-threshold');
  var logEl = document.getElementById('mb-log');
  var verdictEl = document.getElementById('mb-verdict');
  var resetBtn = document.getElementById('mb-reset');
  var wheelUpEl = document.getElementById('mb-wheel-up');
  var wheelDownEl = document.getElementById('mb-wheel-down');
  var wheelSvg = document.querySelector('[data-part="wheel"]');

  var state;

  function fresh() {
    var s = { buttons: {}, wheelUp: 0, wheelDown: 0, log: [] };
    BUTTONS.forEach(function (b) {
      s.buttons[b.id] = { presses: 0, chatter: 0, lastDown: 0, minGap: Infinity };
    });
    return s;
  }

  function threshold() { return Number(thresholdSel.value) || 80; }

  function part(id) {
    var b = BUTTONS[id];
    return b ? document.querySelectorAll('[data-part="' + b.key + '"]') : [];
  }

  function setPressed(id, on) {
    part(id).forEach(function (el) {
      el.classList.toggle('pressed', on);
      if (on) el.classList.add('tested');
    });
  }

  function addLog(text, bad) {
    state.log.unshift({ text: text, bad: !!bad });
    if (state.log.length > 30) state.log.pop();
    logEl.innerHTML = '';
    state.log.forEach(function (entry) {
      var li = document.createElement('li');
      li.textContent = entry.text;
      if (entry.bad) li.className = 'bad';
      logEl.appendChild(li);
    });
  }

  function render() {
    BUTTONS.forEach(function (b) {
      var d = state.buttons[b.id];
      document.getElementById('mb-' + b.key + '-presses').textContent = d.presses;
      document.getElementById('mb-' + b.key + '-chatter').textContent = d.chatter;
      var row = document.getElementById('mb-row-' + b.key);
      row.classList.toggle('bad', d.chatter > 0);
      row.classList.toggle('ok', d.presses > 0 && d.chatter === 0);
      document.getElementById('mb-' + b.key + '-gap').textContent =
        d.minGap === Infinity ? '—' : Math.round(d.minGap) + ' ms';
    });
    wheelUpEl.textContent = state.wheelUp;
    wheelDownEl.textContent = state.wheelDown;

    var faulty = BUTTONS.filter(function (b) { return state.buttons[b.id].chatter > 0; });
    var tested = BUTTONS.filter(function (b) { return state.buttons[b.id].presses > 0; });
    verdictEl.className = 'mb-verdict';
    if (faulty.length) {
      verdictEl.classList.add('bad');
      verdictEl.textContent = 'Possible double-click fault on: ' +
        faulty.map(function (b) { return b.name; }).join(', ') +
        '. Two presses arrived faster than ' + threshold() + ' ms apart. Repeat the test with slow single clicks to confirm.';
    } else if (tested.length) {
      verdictEl.classList.add('ok');
      verdictEl.textContent = 'No chatter detected on ' + tested.length + ' of 5 buttons so far. Click each button slowly 20-30 times for a reliable result.';
    } else {
      verdictEl.textContent = 'Click inside the box with each mouse button. Use slow, deliberate single clicks.';
    }
  }

  function onDown(e) {
    var id = e.button;
    if (!state.buttons[id]) return;
    e.preventDefault();
    stage.focus({ preventScroll: true });
    var now = performance.now();
    var d = state.buttons[id];
    var name = BUTTONS[id].name;
    var gap = d.lastDown ? now - d.lastDown : Infinity;
    d.presses++;
    d.lastDown = now;
    if (gap < d.minGap) d.minGap = gap;
    setPressed(id, true);
    if (gap < threshold()) {
      d.chatter++;
      addLog(name + ' pressed again after only ' + gap.toFixed(1) + ' ms — possible chatter', true);
    } else {
      addLog(name + ' pressed' + (gap === Infinity ? '' : ' (' + Math.round(gap) + ' ms since last)'));
    }
    render();
  }

  function onUp(e) {
    if (!state.buttons[e.button]) return;
    e.preventDefault();
    setPressed(e.button, false);
  }

  function onWheel(e) {
    e.preventDefault();
    if (e.deltaY === 0) return;
    var up = e.deltaY < 0;
    if (up) state.wheelUp++; else state.wheelDown++;
    if (wheelSvg) {
      wheelSvg.classList.add('tested', 'pressed');
      clearTimeout(onWheel.t);
      onWheel.t = setTimeout(function () { wheelSvg.classList.remove('pressed'); }, 120);
    }
    addLog('Scroll ' + (up ? 'up' : 'down'));
    render();
  }

  function reset() {
    state = fresh();
    document.querySelectorAll('.mb-mouse [data-part]').forEach(function (el) {
      el.classList.remove('pressed', 'tested');
    });
    logEl.innerHTML = '';
    render();
  }

  stage.addEventListener('mousedown', onDown);
  stage.addEventListener('mouseup', onUp);
  stage.addEventListener('auxclick', function (e) { e.preventDefault(); });
  stage.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  stage.addEventListener('wheel', onWheel, { passive: false });
  // Stop back/forward side buttons from navigating away while testing.
  window.addEventListener('mouseup', function (e) {
    if ((e.button === 3 || e.button === 4) && stage.contains(e.target)) e.preventDefault();
  });
  window.addEventListener('mouseleave', function () {
    BUTTONS.forEach(function (b) { part(b.id).forEach(function (el) { el.classList.remove('pressed'); }); });
  });
  thresholdSel.addEventListener('change', render);
  resetBtn.addEventListener('click', reset);

  reset();
})();
