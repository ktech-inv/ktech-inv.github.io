/*
  KAI Tech: cookie lišta a měření návštěvnosti, stejné jako na audit.kaitechinvest.com.

  Google Analytics 4 (G-TK6W3SX28Y) a Meta Pixel (1799620708055955) se při načtení
  stránky NENAČÍTAJÍ. Jejich skripty vkládá jen funkce nactiMereni(), a to výhradně
  po kliknutí na Přijmout (§ 89 odst. 3 zák. č. 127/2005 Sb., čl. 6 GDPR).
  Odmítnutí je stejně snadné jako souhlas: obě tlačítka mají stejný vzhled.

  Klik na platební odkaz (buy.stripe.com) posílá InitiateCheckout (Meta) a
  begin_checkout (GA4), ale jen když návštěvník souhlasil. Hodnotu berou
  z atributů data-plan, data-value a data-currency u odkazu.

  Na stránku stačí <script src="/cookies.js" defer></script> a v patičce odkaz
  s atributem data-cookie-settings, který lištu znovu otevře.
*/
(function () {
  var KLIC = 'kai_cookie_consent';
  var GA_ID = 'G-TK6W3SX28Y';
  var FB_ID = '1799620708055955';
  var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var T = EN ? {
    nadpis: 'Cookies and traffic measurement',
    text: 'We always use cookies that are technically necessary for the site to work. ' +
          'Analytics and marketing tools (Google Analytics, Meta Pixel) load only with your consent; ' +
          'until then none of their scripts run. You can change your choice at any time via ' +
          '“Cookie settings” in the footer. More in our ',
    odkaz: 'Privacy Policy', href: '/en/privacy.html',
    odmitnout: 'Reject', prijmout: 'Accept', popis: 'Cookie settings'
  } : {
    nadpis: 'Cookies a měření návštěvnosti',
    text: 'Technicky nutné cookies pro fungování webu používáme vždy. Analytické a marketingové ' +
          'nástroje (Google Analytics, Meta Pixel) načteme až s vaším souhlasem – do té doby se žádný ' +
          'jejich skript nespustí. Souhlas můžete kdykoli změnit odkazem „Nastavení cookies“ v patičce. Více v ',
    odkaz: 'Ochraně osobních údajů', href: '/gdpr.html',
    odmitnout: 'Odmítnout', prijmout: 'Přijmout', popis: 'Nastavení cookies'
  };

  var styl = document.createElement('style');
  styl.textContent =
    '.cc-bar{position:fixed;left:0;right:0;bottom:0;z-index:9999;display:none;background:#0a1228;' +
    'border-top:1px solid rgba(100,140,255,.15);box-shadow:0 -10px 40px rgba(0,0,0,.45);padding:1.25rem 3rem;' +
    "font-family:'DM Sans',system-ui,sans-serif;}" +
    '.cc-bar.cc-show{display:block;}' +
    '.cc-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:1.75rem;flex-wrap:wrap;}' +
    '.cc-text{flex:1 1 380px;font-size:.84rem;line-height:1.65;color:#b8cae0;text-align:left;}' +
    ".cc-text strong{display:block;font-family:'Syne',sans-serif;font-weight:700;font-size:.95rem;color:#fff;margin-bottom:.35rem;}" +
    '.cc-text a{color:#00c2ff;text-decoration:underline;}' +
    '.cc-text a:hover{color:#fff;}' +
    '.cc-actions{display:flex;gap:.75rem;flex-shrink:0;}' +
    /* Obě tlačítka záměrně stejně: odmítnutí musí být stejně snadné a nápadné jako souhlas. */
    ".cc-btn{flex:1 1 0;min-width:150px;padding:.8rem 1.75rem;font-family:'DM Sans',system-ui,sans-serif;font-weight:600;" +
    'font-size:.95rem;line-height:1.2;text-align:center;color:#fff;background:#0f1a35;border:1px solid #4d8fff;' +
    'border-radius:10px;cursor:pointer;transition:all .25s;}' +
    '.cc-btn:hover{background:#1e6bff;border-color:#1e6bff;box-shadow:0 0 30px rgba(30,107,255,.35);transform:translateY(-2px);}' +
    '.cc-btn:focus-visible{outline:2px solid #00c2ff;outline-offset:2px;}' +
    '@media(max-width:900px){.cc-bar{padding:1.25rem 1.5rem;}.cc-inner{gap:1.1rem;}.cc-actions{width:100%;}}';
  document.head.appendChild(styl);

  var lista = document.createElement('div');
  lista.className = 'cc-bar';
  lista.setAttribute('role', 'dialog');
  lista.setAttribute('aria-live', 'polite');
  lista.setAttribute('aria-label', T.popis);
  lista.innerHTML =
    '<div class="cc-inner"><div class="cc-text"><strong>' + T.nadpis + '</strong>' + T.text +
    '<a href="' + T.href + '">' + T.odkaz + '</a>.</div><div class="cc-actions">' +
    '<button type="button" class="cc-btn" data-cc="ne">' + T.odmitnout + '</button>' +
    '<button type="button" class="cc-btn" data-cc="ano">' + T.prijmout + '</button></div></div>';
  document.body.appendChild(lista);

  function prectiSouhlas() {
    try {
      var v = JSON.parse(localStorage.getItem(KLIC) || 'null');
      return (v && typeof v.analytics === 'boolean') ? v : null;
    } catch (e) { return null; }
  }

  function ulozSouhlas(ano) {
    try {
      localStorage.setItem(KLIC, JSON.stringify({ analytics: ano, ts: new Date().toISOString(), v: 1 }));
    } catch (e) { /* anonymní režim: volba platí jen pro tuto stránku */ }
  }

  var nacteno = false;
  // Skripty třetích stran se vkládají výhradně odsud, tedy až po souhlasu.
  function nactiMereni() {
    if (nacteno) return;
    nacteno = true;

    var ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(ga);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);

    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', FB_ID);
    window.fbq('track', 'PageView');
  }

  lista.addEventListener('click', function (e) {
    var volba = e.target.getAttribute && e.target.getAttribute('data-cc');
    if (!volba) return;
    ulozSouhlas(volba === 'ano');
    lista.classList.remove('cc-show');
    if (volba === 'ano') nactiMereni();
    // Po odmítnutí se nic nenačte; window.fbq ani window.gtag nevzniknou.
  });

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    if (a.hasAttribute('data-cookie-settings')) {
      e.preventDefault();
      lista.classList.add('cc-show');
      lista.querySelector('[data-cc="ne"]').focus();
      return;
    }
    if ((a.getAttribute('href') || '').indexOf('https://buy.stripe.com/') !== 0) return;
    var plan = a.getAttribute('data-plan') || '';
    var hodnota = parseFloat(a.getAttribute('data-value')) || undefined;
    var mena = a.getAttribute('data-currency') || 'CZK';
    if (window.fbq) window.fbq('track', 'InitiateCheckout', { value: hodnota, currency: mena, content_name: plan });
    if (window.gtag) window.gtag('event', 'begin_checkout', { value: hodnota, currency: mena, items: [{ item_id: plan }] });
  });

  var souhlas = prectiSouhlas();
  if (souhlas === null) lista.classList.add('cc-show');
  else if (souhlas.analytics) nactiMereni();
})();
