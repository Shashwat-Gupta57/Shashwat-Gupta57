/* The privacy notice every visitor accepts once before entering.
   It explains what this site does with their data (nothing) and who built it.
   The acceptance is remembered in localStorage ("sg-privacy"), never sent anywhere.
   No JavaScript, no gate — the site is fully usable either way. */
(function () {
  'use strict';
  var KEY = 'sg-privacy';
  try { if (localStorage.getItem(KEY)) return; } catch (e) { /* storage blocked: show it, can't remember */ }

  var base = document.documentElement.getAttribute('data-base') || '';
  var gate = document.createElement('div');
  gate.className = 'gate';
  gate.setAttribute('role', 'dialog');
  gate.setAttribute('aria-modal', 'true');
  gate.setAttribute('aria-labelledby', 'gateTitle');
  gate.innerHTML =
    '<div class="gate-card">' +
      '<p class="gate-kicker mono"><span class="pulse" aria-hidden="true"></span> privacy notice · read before entering</p>' +
      '<h2 id="gateTitle" class="gate-title">Before you <em>enter.</em></h2>' +
      '<p class="gate-lede">You’re about to see the work of <b>Shashwat Gupta</b> — the developer of <b>Talken</b>, a messenger built so that no one can watch who you talk to. He takes everyone’s identity seriously, including yours. So this site keeps a promise:</p>' +
      '<ul class="gate-list">' +
        '<li><b>No cookies.</b> Not one.</li>' +
        '<li><b>No trackers, analytics or ads.</b> Your visit isn’t counted, profiled or sold.</li>' +
        '<li><b>No third parties.</b> Even the fonts are served from here, so no other company learns you came.</li>' +
        '<li><b>Nothing leaves your browser.</b> Only your theme and this acceptance are remembered — on your device.</li>' +
      '</ul>' +
      '<a class="gate-talken" href="' + base + 'projects/talken.html">' +
        '<img src="' + base + 'assets/img/icons/talken.png" alt="" />' +
        '<span><b>Talken</b> — talk like no one’s watching. No message server, no phone number, your key is your account. A messenger in a league of its own.</span>' +
        '<i aria-hidden="true">→</i>' +
      '</a>' +
      '<label class="gate-check"><input type="checkbox" id="gateAgree" /> <span>I’ve read the <a class="ink-link" href="' + base + 'privacy.html" target="_blank">privacy notice</a> and I’m happy to continue.</span></label>' +
      '<div class="gate-actions">' +
        '<button type="button" class="btn btn-solid" id="gateEnter" disabled>Enter the portfolio <span aria-hidden="true">→</span></button>' +
        '<a class="btn btn-ghost" href="' + base + 'privacy.html">Read the full policy</a>' +
      '</div>' +
      '<p class="gate-fine mono">shown once · stored only in your browser · no JavaScript, no gate</p>' +
    '</div>';

  function open() {
    document.body.appendChild(gate);
    document.documentElement.classList.add('gate-open');
    var agree = gate.querySelector('#gateAgree'), enter = gate.querySelector('#gateEnter');
    agree.addEventListener('change', function () { enter.disabled = !agree.checked; });
    enter.addEventListener('click', function () {
      try { localStorage.setItem(KEY, new Date().toISOString().slice(0, 10)); } catch (e) {}
      gate.classList.add('gate-leave');
      document.documentElement.classList.remove('gate-open');
      setTimeout(function () { gate.remove(); }, 450);
    });
    // keep keyboard focus inside the notice while it's open
    gate.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = Array.prototype.filter.call(gate.querySelectorAll('a, button, input'), function (el) { return !el.disabled; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    agree.focus();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', open); else open();
})();
