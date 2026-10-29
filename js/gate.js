/* The "sign here" notice every visitor accepts once before entering.
   Half joke, half Talken flex: this site collects nothing, and the person who built it builds Talken.
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
      '<p class="gate-kicker mono"><span class="pulse" aria-hidden="true"></span> classified · eyes only (yours)</p>' +
      '<h2 id="gateTitle" class="gate-title">Sign here, <em>agent.</em></h2>' +
      '<p class="gate-lede">Hey, I’m <b>Shashwat</b>. I built <b>Talken</b>, the chat app that makes surveillance agencies cry a little. So yeah, even my portfolio has no clue who you are. Quick rules before you go in:</p>' +
      '<ul class="gate-list">' +
        '<li><b>Triple-wrapped.</b> Every Talken message gets locked three times over before it leaves your device. Three layers, zero peeks.</li>' +
        '<li><b>More private than Tor.</b> Tor bounces you through three strangers’ computers. Talken skips the strangers: straight from you to your friend, no relay, no middleman.</li>' +
        '<li><b>Nothing to raid.</b> No message server, no phone number, your key is your account. Dear governments, you can knock, but there’s no door.</li>' +
        '<li><b>Same rules here.</b> No cookies, no trackers, not even Google Fonts. I genuinely don’t know you’re reading this.</li>' +
      '</ul>' +
      '<a class="gate-talken" href="' + base + 'projects/talken.html">' +
        '<img src="' + base + 'assets/img/icons/talken.png" alt="" />' +
        '<span><b>Talken</b>: the most private messenger on the planet. Yeah, I said it. A league of its own.</span>' +
        '<i aria-hidden="true">→</i>' +
      '</a>' +
      '<label class="gate-check"><input type="checkbox" id="gateAgree" /> <span>I agree my identity is nobody’s business. Especially not the government’s.</span></label>' +
      '<div class="gate-actions">' +
        '<button type="button" class="btn btn-solid" id="gateEnter" disabled>Let me in <span aria-hidden="true">→</span></button>' +
        '<a class="btn btn-ghost" href="' + base + 'privacy.html">The fine print</a>' +
      '</div>' +
      '<p class="gate-fine mono">signed once · remembered only on your device · no spies were harmed (they just got bored)</p>' +
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
