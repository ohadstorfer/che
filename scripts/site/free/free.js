// Posta free guides (/free/*): the whole guide and the PDF are open to everyone.
// The optional box at the end sends the email to functions/free-guide (body
// data-endpoint), which saves it in public.guide_leads and mails the PDF once.
// The 30-day ticks are remembered on this device (best effort: storage may be off).
(function () {
  var body = document.body;
  var guide = body.dataset.guide;
  var endpoint = body.dataset.endpoint;
  var KEY = 'posta-free-' + guide;
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var params = new URLSearchParams(location.search);
  // Where the visitor came from: ?src=ig-dm from a DM, else the utm_source.
  var source = params.get('src') || params.get('utm_source') || (document.referrer ? new URL(document.referrer).host : 'direct');

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function track(event, props) { try { if (window.postaTrack) window.postaTrack(event, props); } catch (e) {} }

  document.querySelectorAll('[data-guide-form]').forEach(function (form) {
    var input = form.querySelector('input[type=email]');
    var note = form.querySelector('.get-note');
    var original = note.textContent;
    input.addEventListener('input', function () { note.classList.remove('err'); note.textContent = original; });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.getAttribute('aria-busy') === 'true') return;
      var email = input.value.trim();
      if (!EMAIL.test(email)) {
        note.classList.add('err');
        note.textContent = 'That email doesn’t look right. Check it and try again.';
        input.focus();
        return;
      }
      form.setAttribute('aria-busy', 'true');
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, guide: guide, source: source, 'bot-field': form.querySelector('.hp').value }),
      })
        .then(function (r) { if (!r.ok) throw new Error(String(r.status)); })
        .then(function () {
          track('guide_email', { guide: guide, source: source });
          var sent = document.createElement('p');
          sent.className = 'sent';
          sent.setAttribute('role', 'status');
          sent.textContent = '¡Listo! Check your inbox in a minute.';
          form.replaceWith(sent);
        })
        .catch(function () {
          note.classList.add('err');
          note.textContent = 'Something went wrong. Try again in a minute.';
        })
        .then(function () { form.removeAttribute('aria-busy'); });
    });
  });

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-pdf]')) track('guide_pdf', { guide: guide });
  });

  // 30-day plan ticks
  document.querySelectorAll('[data-tick]').forEach(function (box) {
    var k = KEY + '-' + box.dataset.tick;
    box.checked = store(k) === '1';
    box.addEventListener('change', function () { store(k, box.checked ? '1' : '0'); });
  });
})();
