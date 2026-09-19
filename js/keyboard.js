/* MouseTestHQ — Keyboard Tester with anti-ghosting detection */
(function () {
  'use strict';

  // US ANSI 104-key layout (using event.code labels)
  const LAYOUT = [
    { row: 'row-function', keys: [
      { code: 'Escape', label: 'Esc', w: 'wide' },
      { spacer: 1 }, { code: 'F1', label: 'F1' }, { code: 'F2', label: 'F2' }, { code: 'F3', label: 'F3' }, { code: 'F4', label: 'F4' },
      { spacer: 0.5 }, { code: 'F5', label: 'F5' }, { code: 'F6', label: 'F6' }, { code: 'F7', label: 'F7' }, { code: 'F8', label: 'F8' },
      { spacer: 0.5 }, { code: 'F9', label: 'F9' }, { code: 'F10', label: 'F10' }, { code: 'F11', label: 'F11' }, { code: 'F12', label: 'F12' },
      { spacer: 0.5 }, { code: 'PrintScreen', label: 'PrtSc' }, { code: 'ScrollLock', label: 'ScrLk' }, { code: 'Pause', label: 'Pause' }
    ]},
    { row: 'row-numbers', keys: [
      { code: 'Backquote', label: '`' }, { code: 'Digit1', label: '1' }, { code: 'Digit2', label: '2' }, { code: 'Digit3', label: '3' },
      { code: 'Digit4', label: '4' }, { code: 'Digit5', label: '5' }, { code: 'Digit6', label: '6' }, { code: 'Digit7', label: '7' },
      { code: 'Digit8', label: '8' }, { code: 'Digit9', label: '9' }, { code: 'Digit0', label: '0' },
      { code: 'Minus', label: '-' }, { code: 'Equal', label: '=' },
      { code: 'Backspace', label: 'Backspace', w: 'xwide' },
      { spacer: 0.5 }, { code: 'Insert', label: 'Ins' }, { code: 'Home', label: 'Home' }, { code: 'PageUp', label: 'PgUp' }
    ]},
    { row: 'row-qwerty', keys: [
      { code: 'Tab', label: 'Tab', w: 'wide' },
      { code: 'KeyQ', label: 'Q' }, { code: 'KeyW', label: 'W' }, { code: 'KeyE', label: 'E' }, { code: 'KeyR', label: 'R' },
      { code: 'KeyT', label: 'T' }, { code: 'KeyY', label: 'Y' }, { code: 'KeyU', label: 'U' }, { code: 'KeyI', label: 'I' },
      { code: 'KeyO', label: 'O' }, { code: 'KeyP', label: 'P' }, { code: 'BracketLeft', label: '[' }, { code: 'BracketRight', label: ']' },
      { code: 'Backslash', label: '\\', w: 'wide' },
      { spacer: 0.5 }, { code: 'Delete', label: 'Del' }, { code: 'End', label: 'End' }, { code: 'PageDown', label: 'PgDn' }
    ]},
    { row: 'row-asdf', keys: [
      { code: 'CapsLock', label: 'Caps', w: 'wide' },
      { code: 'KeyA', label: 'A' }, { code: 'KeyS', label: 'S' }, { code: 'KeyD', label: 'D' }, { code: 'KeyF', label: 'F' },
      { code: 'KeyG', label: 'G' }, { code: 'KeyH', label: 'H' }, { code: 'KeyJ', label: 'J' }, { code: 'KeyK', label: 'K' },
      { code: 'KeyL', label: 'L' }, { code: 'Semicolon', label: ';' }, { code: 'Quote', label: '\'' },
      { code: 'Enter', label: 'Enter', w: 'xwide' }
    ]},
    { row: 'row-zxcv', keys: [
      { code: 'ShiftLeft', label: 'Shift', w: 'xwide' },
      { code: 'KeyZ', label: 'Z' }, { code: 'KeyX', label: 'X' }, { code: 'KeyC', label: 'C' }, { code: 'KeyV', label: 'V' },
      { code: 'KeyB', label: 'B' }, { code: 'KeyN', label: 'N' }, { code: 'KeyM', label: 'M' },
      { code: 'Comma', label: ',' }, { code: 'Period', label: '.' }, { code: 'Slash', label: '/' },
      { code: 'ShiftRight', label: 'Shift', w: 'xwide' },
      { spacer: 0.5 }, { code: 'ArrowUp', label: '↑' },
      { spacer: 0.5 }
    ]},
    { row: 'row-bottom', keys: [
      { code: 'ControlLeft', label: 'Ctrl', w: 'wide' },
      { code: 'MetaLeft', label: 'Win', w: 'wide' },
      { code: 'AltLeft', label: 'Alt', w: 'wide' },
      { code: 'Space', label: '', w: 'xxwide' },
      { code: 'AltRight', label: 'Alt', w: 'wide' },
      { code: 'MetaRight', label: 'Win', w: 'wide' },
      { code: 'ContextMenu', label: 'Menu', w: 'wide' },
      { code: 'ControlRight', label: 'Ctrl', w: 'wide' },
      { spacer: 0.5 }, { code: 'ArrowLeft', label: '←' }, { code: 'ArrowDown', label: '↓' }, { code: 'ArrowRight', label: '→' }
    ]},
    { row: 'row-nav', keys: [
      { code: 'NumLock', label: 'Num' }, { code: 'NumpadDivide', label: '/' }, { code: 'NumpadMultiply', label: '*' }, { code: 'NumpadSubtract', label: '-' }
    ]},
    { row: 'row-numpad-top', keys: [
      { code: 'Numpad7', label: '7' }, { code: 'Numpad8', label: '8' }, { code: 'Numpad9', label: '9' }, { code: 'NumpadAdd', label: '+' }
    ]},
    { row: 'row-numpad-mid', keys: [
      { code: 'Numpad4', label: '4' }, { code: 'Numpad5', label: '5' }, { code: 'Numpad6', label: '6' }
    ]},
    { row: 'row-numpad-bot', keys: [
      { code: 'Numpad1', label: '1' }, { code: 'Numpad2', label: '2' }, { code: 'Numpad3', label: '3' }, { code: 'NumpadEnter', label: '↵' },
      { spacer: 1 },
      { code: 'Numpad0', label: '0', w: 'xwide' }, { code: 'NumpadDecimal', label: '.' }
    ]}
  ];

  const heldKeys = new Set();
  const logEntries = [];
  const ghostCombos = [
    ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'],
    ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft'],
    ['ShiftLeft', 'ControlLeft', 'AltLeft'],
    ['ShiftLeft', 'ControlLeft', 'AltLeft', 'KeyZ'],
    ['KeyQ', 'KeyW', 'KeyE', 'KeyR'],
    ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG'],
    ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'],
    ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB'],
    ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'],
    ['ControlLeft', 'ShiftLeft', 'KeyA', 'KeyQ']
  ];

  let ghostIndex = 0;
  let ghostScore = 0;
  let ghostAttempts = 0;

  function buildKeyboard() {
    LAYOUT.forEach(function (layout) {
      const rowEl = document.getElementById(layout.row);
      if (!rowEl) return;
      rowEl.innerHTML = '';
      layout.keys.forEach(function (k) {
        if (k.spacer) {
          const spacer = document.createElement('span');
          spacer.style.display = 'inline-block';
          spacer.style.width = (k.spacer * 38) + 'px';
          rowEl.appendChild(spacer);
          return;
        }
        const keyEl = document.createElement('span');
        keyEl.className = 'kbd-key' + (k.w ? ' ' + k.w : '');
        keyEl.dataset.code = k.code;
        keyEl.textContent = k.label || k.code;
        keyEl.id = 'key-' + k.code;
        rowEl.appendChild(keyEl);
      });
    });
  }

  function updateKeyVisual(code, isDown) {
    const el = document.getElementById('key-' + code);
    if (!el) return;
    el.classList.toggle('active', isDown);
  }

  function updateModifiers() {
    const mods = ['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight'];
    mods.forEach(function (m) {
      const el = document.getElementById('key-' + m);
      if (!el) return;
      el.classList.toggle('mod-active', heldKeys.has(m));
    });
  }

  function pushLog(entry) {
    logEntries.unshift(entry);
    while (logEntries.length > 6) logEntries.pop();
    const logEl = document.getElementById('kbd-log');
    if (logEl) logEl.textContent = logEntries.join('  ·  ') || 'Press any key to begin.';
  }

  function handleDown(e) {
    // Avoid interfering with form inputs (we don't have any, but defensive)
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    e.preventDefault();
    if (e.repeat) return;
    heldKeys.add(e.code);
    updateKeyVisual(e.code, true);
    updateModifiers();
    pushLog(e.code + (heldKeys.size > 1 ? ' (+' + (heldKeys.size - 1) + ' held)' : ''));
    checkGhostCombo();
  }

  function handleUp(e) {
    heldKeys.delete(e.code);
    updateKeyVisual(e.code, false);
    updateModifiers();
  }

  function checkGhostCombo() {
    const target = ghostCombos[ghostIndex];
    if (!target) return;
    const allHeld = target.every(function (c) { return heldKeys.has(c); });
    if (!allHeld) return;
    // All target keys are held — evaluate
    ghostAttempts++;
    const targetEl = document.getElementById('ghost-keys');
    let allGreen = true;
    target.forEach(function (c) {
      const el = targetEl.querySelector('[data-ghost-code="' + c + '"]');
      if (!el) return;
      if (heldKeys.has(c)) {
        el.classList.add('pressed');
        el.classList.remove('missed');
      } else {
        el.classList.add('missed');
        el.classList.remove('pressed');
        allGreen = false;
      }
    });
    if (allGreen) ghostScore++;
    document.getElementById('ghost-score').textContent = ghostScore + ' / ' + ghostAttempts;
  }

  function renderGhostCombo() {
    const target = ghostCombos[ghostIndex];
    const container = document.getElementById('ghost-keys');
    container.innerHTML = '';
    target.forEach(function (c) {
      const el = document.createElement('span');
      el.className = 'kbd-key';
      el.dataset.ghostCode = c;
      // Friendly label
      const labels = { KeyW: 'W', KeyA: 'A', KeyS: 'S', KeyD: 'D', Space: 'Space', ShiftLeft: 'L-Shift',
        ControlLeft: 'L-Ctrl', AltLeft: 'L-Alt', KeyZ: 'Z', KeyQ: 'Q', KeyE: 'E', KeyR: 'R',
        KeyF: 'F', KeyG: 'G', KeyX: 'X', KeyC: 'C', KeyV: 'V', KeyB: 'B',
        ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→',
        Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4', Digit5: '5' };
      el.textContent = labels[c] || c;
      container.appendChild(el);
    });
  }

  function nextCombo() {
    ghostIndex = (ghostIndex + 1) % ghostCombos.length;
    renderGhostCombo();
  }

  // ---- Init ----
  buildKeyboard();
  renderGhostCombo();
  document.getElementById('ghost-next').addEventListener('click', nextCombo);
  document.getElementById('kbd-clear').addEventListener('click', function () {
    logEntries.length = 0;
    pushLog('');
  });

  window.addEventListener('keydown', handleDown, true);
  window.addEventListener('keyup', handleUp, true);
  window.addEventListener('blur', function () {
    heldKeys.forEach(function (c) { updateKeyVisual(c, false); });
    heldKeys.clear();
    updateModifiers();
  });
})();
