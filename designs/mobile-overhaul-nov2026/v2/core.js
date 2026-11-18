/* Core of the v2 prototype: helpers, state, shared phone chrome and the overlay plumbing.
   Rule for this round: every region, label and control sits where it sits in today's phone app.
   Only the look and the motion are new. Names, addresses and numbers are invented. */
(() => {
  'use strict';
  const V = (window.V = { ACT: {}, SHEETS: {}, render: {}, after: {} });
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  V.$ = $; V.$$ = $$;
  const root = document.documentElement;
  const Q = new URLSearchParams(location.search);
  V.Q = Q;
  V.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  V.money = (n, cents = true) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });
  V.plural = (n, one, many) => `${n} ${n === 1 ? one : many || one + 's'}`;

  // Dates are relative to today so the prototype never looks stale. ?date=2026-11-18 pins the day for stills.
  const pinned = Q.get('date');
  V.NOW = pinned ? new Date(pinned + 'T10:24:00') : new Date();
  const D0 = new Date(V.NOW.getFullYear(), V.NOW.getMonth(), V.NOW.getDate());
  V.day = (offset = 0) => new Date(D0.getFullYear(), D0.getMonth(), D0.getDate() + offset);
  V.fmt = (d, o) => d.toLocaleDateString('en-US', o);
  V.long = (d) => V.fmt(d, { weekday: 'long', month: 'long', day: 'numeric' });
  V.md = (d) => V.fmt(d, { month: 'short', day: 'numeric' });
  V.mdy = (d) => V.fmt(d, { month: 'short', day: 'numeric', year: 'numeric' });
  V.sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  V.diffDays = (a, b) => Math.round((new Date(a.getFullYear(), a.getMonth(), a.getDate()) - new Date(b.getFullYear(), b.getMonth(), b.getDate())) / 86400000);

  // The team (invented). AM is the signed-in admin.
  V.TEAM = {
    AM: { name: 'Alex Morgan', c: '#2F7BF7', role: 'admin' },
    DW: { name: 'Dana Whitfield', c: '#7B5CFA', role: 'salesperson' },
    MR: { name: 'Marcus Reyes', c: '#10B981', role: 'salesperson' },
    PS: { name: 'Priya Shah', c: '#E0368C', role: 'salesperson' },
    TV: { name: 'Tomas Varga', c: '#F59E0B', role: 'project_manager' },
    LB: { name: 'Lena Brooks', c: '#14B8A6', role: 'project_manager' },
  };
  V.first = (k) => V.TEAM[k].name.split(' ')[0];
  V.SALES = ['DW', 'MR', 'PS', 'AM'];
  V.PMS = ['TV', 'LB'];

  V.S = {
    screen: 'sp', search: '', spArchived: false, ppArchived: false, spFilters: {}, ppTag: '',
    open: { sp: new Set(), pp: new Set() }, more: new Set(), cards: new Set(),
    saView: 'today', saDay: 0, saMonth: 0, saWho: 'all', saPanel: null,
    pcView: 'monthly', pcMap: false, pcDay: 0, pcWeek: 0, pcMonth: 0, pcPanel: null, pcByPm: false, pcFilters: 0,
    clocked: false, navSection: null,
  };
  const S = V.S;

  const phone = $('#phone'), scroller = $('#scroll'), scrim = $('#scrim'), pop = $('#pop'), sheet = $('#sheet'), sheetBody = $('#sheet-body');
  const drawer = $('#drawer'), fan = $('#fan'), toastEl = $('#toast');
  V.phone = phone; V.scroller = scroller;

  /* ── Theme and finish (review controls, not part of the app) ───────────── */
  V.setTheme = (t) => { root.dataset.theme = t; const m = $('meta[name="theme-color"]'); if (m) m.content = t === 'dark' ? '#070B16' : '#EEF1F7'; syncPicks(); try { localStorage.setItem('v2-theme', t); } catch (e) { /* private mode */ } };
  V.setFinish = (f) => { root.dataset.finish = f; syncPicks(); try { localStorage.setItem('v2-finish', f); } catch (e) { /* private mode */ } };
  function syncPicks() {
    $$('.pick[data-pick]').forEach((p) => {
      const v = p.dataset.pick === 'theme' ? root.dataset.theme : p.dataset.pick === 'finish' ? root.dataset.finish : S.screen;
      $$('button', p).forEach((b) => { b.classList.toggle('on', b.dataset.v === v); b.setAttribute('aria-pressed', b.dataset.v === v); });
    });
  }
  V.syncPicks = syncPicks;
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.pick[data-pick] button');
    if (!b) return;
    const kind = b.parentElement.dataset.pick;
    if (kind === 'theme') V.setTheme(b.dataset.v);
    else if (kind === 'finish') V.setFinish(b.dataset.v);
    else { V.closeAll(); V.go(b.dataset.v); }
  });

  /* ── Overlays ──────────────────────────────────────────────────────────── */
  let popAnchor = null, toastTimer = 0;
  const lock = () => { scroller.style.overflowY = scrim.classList.contains('on') ? 'hidden' : ''; };
  V.closePop = () => { pop.classList.remove('on'); if (popAnchor) popAnchor.removeAttribute('data-open'); popAnchor = null; };
  V.openPop = (anchor, html, opts = {}) => {
    if (popAnchor === anchor && pop.classList.contains('on')) { V.closePop(); return; }
    V.closePop();
    pop.innerHTML = html;
    pop.style.width = opts.width ? opts.width + 'px' : '';
    pop.style.left = '0px'; pop.style.top = '0px';
    const pr = phone.getBoundingClientRect(), ar = anchor.getBoundingClientRect();
    const pw = pop.offsetWidth, ph = pop.offsetHeight, W = phone.clientWidth, H = phone.clientHeight;
    let left = opts.align === 'left' ? ar.left - pr.left : opts.align === 'center' ? ar.left - pr.left + ar.width / 2 - pw / 2 : ar.right - pr.left - pw;
    left = Math.max(10, Math.min(left, W - pw - 10));
    let top = ar.bottom - pr.top + 6, below = true;
    if (top + ph > H - 12) { const up = ar.top - pr.top - ph - 6; if (up > 50) { top = up; below = false; } else top = Math.max(50, H - ph - 12); }
    pop.style.left = left + 'px'; pop.style.top = top + 'px';
    pop.style.setProperty('--ox', Math.round(((ar.left - pr.left + ar.width / 2 - left) / pw) * 100) + '%');
    pop.style.setProperty('--oy', below ? '0%' : '100%');
    popAnchor = anchor; anchor.setAttribute('data-open', '');
    void pop.offsetWidth;
    pop.classList.add('on');
  };
  V.menu = (items) => items.filter(Boolean).map((it) => {
    if (it === '-') return '<hr>';
    if (it.h) return `<h4>${it.h}</h4>`;
    return `<button class="mi${it.cls ? ' ' + it.cls : ''}" role="menuitem" data-act="${it.act || 'soon'}" data-arg="${V.esc(it.arg == null ? it.label : it.arg)}">${it.dot ? `<i class="sdot" style="background:${it.dot}"></i>` : ''}${it.icon ? I(it.icon) : ''}<span>${it.label}${it.sub ? `<small>${it.sub}</small>` : ''}</span>${it.check ? I('check', 'chk') : ''}</button>`;
  }).join('');

  V.openSheet = (name, arg) => {
    const make = V.SHEETS[name];
    if (!make) return;
    V.closePop(); closeFan(); drawer.classList.remove('on');
    const d = make(arg) || {};
    sheetBody.innerHTML = `<button class="x sheet-x" data-act="close" aria-label="Close">${I('x')}</button>${d.title ? `<h2>${d.title}</h2>` : ''}${d.sub ? `<p class="sub">${d.sub}</p>` : ''}${d.body || ''}`;
    sheet.setAttribute('aria-label', (d.title || name).replace(/<[^>]+>/g, ''));
    sheet.dataset.name = name;
    sheetBody.scrollTop = 0;
    syncPicks();
    sheet.classList.add('on'); scrim.classList.add('on'); lock();
  };
  V.closeSheet = () => { sheet.classList.remove('on'); sheet.style.transform = ''; if (!drawer.classList.contains('on') && !fan.classList.contains('on')) scrim.classList.remove('on'); lock(); };

  V.openDrawer = () => { V.closePop(); S.navSection = S.navSection || (S.screen[0] === 's' ? 'sales' : 'production'); V.drawDrawer(); drawer.classList.add('on'); scrim.classList.add('on'); lock(); };
  V.closeDrawer = () => { drawer.classList.remove('on'); if (!sheet.classList.contains('on')) scrim.classList.remove('on'); lock(); };

  function closeFan() { if (!fan.classList.contains('on') && !$('.plus.open')) return; fan.classList.remove('on'); $$('.plus.open').forEach((p) => { p.classList.remove('open'); p.setAttribute('aria-label', 'Open quick actions'); }); if (!sheet.classList.contains('on') && !drawer.classList.contains('on')) scrim.classList.remove('on'); lock(); }
  V.closeFan = closeFan;
  V.openFan = (anchor, actions, color) => {
    V.closePop();
    const pr = phone.getBoundingClientRect(), ar = anchor.getBoundingClientRect();
    fan.style.left = ar.left - pr.left + ar.width / 2 + 'px';
    fan.style.top = ar.top - pr.top + ar.height / 2 + 'px';
    fan.style.setProperty('--goo', color);
    fan.innerHTML = `<div class="goo" aria-hidden="true"><i style="--k:-1"></i>${actions.map((a, k) => `<i style="--k:${k}"></i>`).join('')}</div>`
      + `<button class="closer${anchor.classList.contains('round') ? ' round' : ''}" data-act="fanclose" aria-label="Close quick actions">${I('plus')}</button>`
      + actions.map((a, k) => `<button class="fa" style="--k:${k}" data-act="${a.act}" data-arg="${a.arg || ''}"><span class="lb glass">${a.label}</span><span class="ic">${I(a.icon)}</span></button>`).join('');
    anchor.classList.add('open'); anchor.setAttribute('aria-label', 'Close quick actions');
    scrim.classList.add('on'); lock();
    void fan.offsetWidth; // start the drops from the button, without waiting for a frame
    fan.classList.add('on');
  };

  V.toast = (title, sub) => {
    toastEl.innerHTML = `${I('checkcircle')}<span><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</span>`;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('on'), 2800);
  };
  V.closeAll = () => { V.closePop(); closeFan(); V.closeSheet(); V.closeDrawer(); scrim.classList.remove('on'); lock(); };

  scrim.addEventListener('click', () => V.closeAll());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') V.closeAll(); });

  // Sheets can be pulled down by their handle.
  (() => {
    const grab = $('#grab'); let y0 = 0, dy = 0, on = false;
    grab.addEventListener('pointerdown', (e) => { on = true; y0 = e.clientY; dy = 0; sheet.classList.add('drag'); grab.setPointerCapture(e.pointerId); });
    grab.addEventListener('pointermove', (e) => { if (!on) return; dy = Math.max(0, e.clientY - y0); sheet.style.transform = `translateY(${dy}px)`; });
    const end = () => { if (!on) return; on = false; sheet.classList.remove('drag'); sheet.style.transform = ''; if (dy > 90) V.closeSheet(); };
    grab.addEventListener('pointerup', end); grab.addEventListener('pointercancel', end);
  })();
  // The drawer closes on a left swipe of more than 80px, as it does today.
  (() => {
    let x0 = null;
    drawer.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    drawer.addEventListener('touchend', (e) => { if (x0 !== null && x0 - e.changedTouches[0].clientX > 80) V.closeDrawer(); x0 = null; }, { passive: true });
  })();
  // The highlight on glass follows the finger.
  phone.addEventListener('pointerdown', (e) => {
    const g = e.target.closest('.glass, .tile, .card');
    if (!g) return;
    const r = g.getBoundingClientRect();
    g.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
    g.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
  }, { passive: true });

  /* ── One click handler for the whole phone ─────────────────────────────── */
  phone.addEventListener('click', (e) => {
    if (pop.classList.contains('on') && !e.target.closest('#pop')) {
      const again = popAnchor && popAnchor.contains(e.target);
      V.closePop();
      if (!again) return; // an outside tap only closes the menu, as today
      return;
    }
    const el = e.target.closest('[data-act]');
    if (el && phone.contains(el)) {
      if (el.matches('.btn.grad, .btn.solid')) { el.classList.remove('go'); void el.offsetWidth; el.classList.add('go'); }
      const fn = V.ACT[el.dataset.act];
      if (fn) fn(el, el.dataset.arg || '', e);
      return;
    }
    const card = e.target.closest('.card[data-card]');
    if (card && !e.target.closest('a, button, input, select, textarea, label')) V.toggleCard(card.dataset.card);
  });

  V.ACT.close = () => V.closeSheet();
  V.ACT.sheet = (el, arg) => { const i = arg.indexOf(':'); V.closePop(); V.openSheet(i < 0 ? arg : arg.slice(0, i), i < 0 ? undefined : arg.slice(i + 1)); };
  V.ACT.fanclose = () => closeFan();
  V.ACT.soon = (el, arg) => { V.closePop(); V.toast(arg || 'Same as today', 'Opens the same screen as today. Not drawn in this prototype.'); };
  V.ACT.toast = (el, arg) => { const [t, s] = arg.split('|'); V.closePop(); V.toast(t, s); };
  V.ACT.sheettoast = (el, arg) => { const [t, s] = arg.split('|'); V.closeSheet(); V.toast(t, s); };
  V.ACT.fold = (el, arg) => { const f = $('#' + arg); const open = !f.classList.contains('open'); f.classList.toggle('open', open); $$(`[data-act="fold"][data-arg="${arg}"]`).forEach((b) => { b.setAttribute('aria-expanded', open); b.classList.toggle('isopen', open); }); };
  V.ACT.tab = (el) => {
    const host = el.closest('.sheet-body, .pop, .page'), key = el.dataset.arg;
    const bar = el.closest('.tabs') || (host && $('.tabs', host));
    if (bar) [...bar.children].forEach((t, i) => t.classList.toggle('on', el.closest('.tabs') ? t === el : String(i) === key));
    if (!host || key == null || key === '') return;
    const panes = $$('[data-pane]', host); let hit = false;
    panes.forEach((p) => { const on = p.dataset.pane === key; if (on) hit = true; p.hidden = !on; });
    if (!hit) panes.forEach((p) => { if (p.dataset.pane === '*') { p.hidden = false; const t = $('.tabname', p); if (t && bar) t.textContent = bar.children[Number(key)] ? bar.children[Number(key)].textContent : ''; } });
  };
  V.ACT.sw = (el) => { const on = !el.classList.contains('on'); el.classList.toggle('on', on); const sw = $('.sw', el); if (sw) sw.classList.toggle('on', on); el.setAttribute('aria-checked', on); const dep = el.dataset.arg && $('#' + el.dataset.arg); if (dep) dep.hidden = on; };
  V.ACT.choose = (el) => { [...el.parentElement.children].filter((o) => o.dataset.act === 'choose').forEach((o) => { o.classList.toggle('on', o === el); if (o.hasAttribute('aria-checked')) o.setAttribute('aria-checked', o === el); }); };

  /* ── Shared chrome: header bar, help strip, floating clock button ──────── */
  const TITLES = { sp: 'Sales Pipeline', sa: 'Sales Appointments', pp: 'Project Pipeline', pc: 'Project Calendar' };
  const HELP = {
    sp: ['What does Sales Pipeline do?', 'It shows every open opportunity by stage, from a new lead to a sold job, with the value sitting in each stage.', ['Add a lead or let your lead sources bring them in.', 'Schedule the appointment from the lead card.', 'Create the proposal after the visit.', 'Send it and follow the status as the customer views it.', 'Schedule the project when the job is sold.'], ['Stages update on their own as appointments and proposals change.', 'Tap a stage to open it, tap a card for its actions.', 'Use Filters to narrow by salesperson, source or value.', 'Lost Leads keeps every disqualified lead so you can bring one back.']],
    sa: ['What does Appointments do?', 'It lists every sales visit by day, on a month calendar, or live on the map.', ['Pick a salesperson or leave it on everyone.', 'Use Today for the day list, Calendar for the month.', 'Tap a visit to open its details.', 'Start the appointment when you arrive.', 'Create the proposal from the visit.'], ['Send your ETA with On My Way.', 'Cancelled visits can be rescheduled from the Cancelled list.', 'Block off time so nobody books over it.']],
    pp: ['What does Project Pipeline do?', 'It follows every sold job from scheduling through production, completion and payment.', ['Schedule the project.', 'Assign labor.', 'Start the project on day one.', 'Complete it when the work is done.', 'Collect the final payment to close it out.'], ['Stages change through the buttons on each card.', 'Tags hold small steps that are not full stages.', 'The visit icon shows whether a job was checked this week.']],
    pc: ['What does Project Calendar do?', 'It shows scheduled projects by day, week or month, with the production value of each period.', ['Schedule a project or import jobs.', 'Switch between Daily, Weekly and Monthly.', 'Tap a project to open its details.', 'Use Edit inside the details to move its dates.', 'Check the map for site visits.'], ['Colors follow the project type. Legend lists them.', 'Filters also change the production totals.', 'Connect Google Calendar to see jobs on your own calendar.']],
  };
  V.helpStrip = (k) => {
    const h = HELP[k];
    return `<button class="help" data-act="fold" data-arg="help-${k}" aria-expanded="false">${I('bulb', 'sm')}<span>Want to know how to use this feature, or what it's for? Click here.</span>${I('chev', 'sm chev')}</button>
    <div class="fold" id="help-${k}"><div><section class="helpcard tile"><button class="x" data-act="helpclose" data-arg="${k}" aria-label="Dismiss feature explanation">${I('x')}</button><h3>${h[0]}</h3><p>${h[1]}</p><ol>${h[2].map((s) => `<li>${s}</li>`).join('')}</ol><ul class="tips">${h[3].map((s) => `<li>${I('bulb', 'sm')}<span>${s}</span></li>`).join('')}</ul></section></div></div>`;
  };
  V.ACT.helpclose = (el, k) => { $('#help-' + k).classList.remove('open'); const b = $(`.help[data-arg="help-${k}"]`); b.setAttribute('aria-expanded', 'false'); b.classList.remove('isopen'); };

  function clockText() { const n = pinned ? V.NOW : new Date(); return `${V.fmt(n, { month: 'short', day: 'numeric' })} • ${n.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`; }
  function drawBar() {
    $('#bar').innerHTML = `<button class="hbtn" data-act="drawer" aria-label="Toggle menu">${I('menu')}<span class="cnt" aria-label="12 unread texts">12</span></button>
      <div class="htitle"><b id="ptitle">${TITLES[S.screen]}</b><small id="pclock">${clockText()}</small></div>
      <button class="hbtn" data-act="sheet" data-arg="search" aria-label="Search everything">${I('search')}</button>
      <button class="hbtn shield" data-act="sheet" data-arg="override" aria-label="Generate Override Code">${I('shield')}</button>
      <button class="hbtn bug" data-act="soon" data-arg="Report a Bug" aria-label="Report a Bug">${I('bug')}</button>
      <button class="hbtn notif" data-act="notifs" aria-label="Notifications, 9 unread">9</button>
      <button class="me" data-act="profile" aria-label="Open profile menu">AM</button>`;
  }
  setInterval(() => { const c = $('#pclock'); if (c) c.textContent = clockText(); }, 15000);
  V.ACT.drawer = () => (drawer.classList.contains('on') ? V.closeDrawer() : V.openDrawer());
  V.ACT.profile = (el) => V.openPop(el, `<div class="who phead"><i style="--c:#2F7BF7">AM</i><span><b>Alex Morgan</b><small>Admin</small></span></div><hr>` + V.menu([
    { label: 'Edit Profile', icon: 'user', act: 'sheet', arg: 'same:Edit Profile' },
    { label: 'Change Password', icon: 'key', act: 'sheet', arg: 'same:Change Password' },
    { label: 'Generate Override Code', icon: 'shield', act: 'sheet', arg: 'override' },
    { label: 'Connect to Zapier', icon: 'zap', act: 'sheet', arg: 'zapier' },
    { label: 'Training', icon: 'cap' },
    { label: 'Report Bug', icon: 'bug' },
  ]) + `<div class="langrow"><span>${I('globe')} Language</span><span class="pick mini2"><button class="on">EN</button><button>ES</button></span></div><hr>` + V.menu([{ label: 'Log Out', icon: 'logout', cls: 'red' }]), { width: 250 });
  V.ACT.notifs = (el) => {
    const row = (icon, c, t, s, when) => `<button class="mi nrow" data-act="soon" data-arg="${t}"><i class="nic" style="--c:${c}">${I(icon, 'sm')}</i><span>${t}<small>${s}</small></span><em>${when}</em></button>`;
    V.openPop(el, `<div class="nhead"><b>Notifications</b><button class="textbtn" data-act="notifclear">Clear ${I('chev', 'sm')}</button></div>
      <div class="tabs flat"><span class="on" data-act="tab">All (12)</span><span data-act="tab">Unread (9)</span><span data-act="tab">Read</span></div>
      <div class="nfilter"><button class="sel sm" data-act="soon" data-arg="Filter by Type">All Types ${I('chev', 'sm')}</button><small>12 total</small></div>
      <h4>Today</h4>${row('eye', '#0EA5E9', 'Proposal viewed', 'Camille Okafor opened Proposal #4801', '9:12 AM')}${row('userplus', '#3B82F6', 'New lead', 'Hannah Whitlock, from Facebook', '8:03 AM')}${row('sparkles', '#8B5CF6', 'AI Setter booked a visit', 'Theo Ramsey, tomorrow at 9:00 AM', '7:40 AM')}
      <h4>Yesterday</h4>${row('checkcircle', '#10B981', 'Proposal accepted', 'Elena Marsh signed Proposal #4788', '4:26 PM')}${row('msg', '#F59E0B', 'New text message', 'Owen Castillo replied', '1:15 PM')}
      <hr><button class="mi center" data-act="soon" data-arg="View all notifications">View all notifications (12)</button>`, { width: 340 });
  };
  V.ACT.notifclear = (el) => V.openPop(el, V.menu([{ label: 'Clear read notifications', icon: 'check' }, { label: 'Clear all notifications', icon: 'trash', cls: 'red' }]), { width: 240 });

  function drawClock() { const b = $('#clockin'); b.innerHTML = `${I('clock')}<span>${S.clocked ? 'Clocked in' : 'Clock In'}</span>`; b.classList.toggle('in', S.clocked); b.dataset.act = 'sheet'; b.dataset.arg = 'timeclock'; }
  V.drawClock = drawClock;
  const rv = $('#review'); rv.innerHTML = `${I('sliders', 'sm')}<span>Prototype</span>`; rv.dataset.act = 'sheet'; rv.dataset.arg = 'proto';
  setTimeout(() => rv.classList.add('mini'), 6000);

  /* ── Navigation drawer: today's sections and links ─────────────────────── */
  const NAV = [
    ['today', 'Today', 'home', 'Start with the work that needs attention now.', [['Time & attendance', ['Time Sheets']]]],
    ['sales', 'Sales', 'chart', 'Manage leads, appointments, customers, and proposals.', [['Sales flow', ['Sales Pipeline', 'Lead Manager', 'Appointments', 'Sales Map', 'Customers']], ['Proposals & visuals', ['Proposals', 'Color Renderings']]]],
    ['production', 'Projects', 'hardhat', 'Schedule, deliver, and close out active projects.', [['Delivery', ['Project Pipeline', 'Project Calendar', 'Project Map', 'Work Orders']], ['Change orders', ['Project Change Orders', 'Sales Change Orders']]]],
    ['inbox', 'Inbox', 'inbox', 'Keep customer, project, and AI conversations together.', [['Conversations', ['Team Chat', 'Customer Conversations', 'Project Conversations', 'AI Setter Conversations']]]],
    ['money', 'Money', 'money', 'Collect revenue and understand project profitability.', [['Employee labor', ['Payroll', 'Tracked Labor Review']], ['Receivables', ['Invoices', 'Payment Collection']], ['Profitability', ['Project Costing', 'Commission Dashboard']]]],
    ['insights', 'Insights', 'pie', 'Analyze performance and turn activity into better decisions.', [['Intelligence', ['OwnerIQ', 'Sales Intelligence', 'Call IQ']], ['Reports', ['Sales Reports', 'Project Reports']]]],
    ['people', 'People', 'users', 'Manage employees, subcontractors, access, and compliance.', [['Team', ['Users & Access', 'Employees', 'Subcontractors']], ['Hiring & compliance', ['Contractor Hiring', 'Employee Compliance', 'Subcontractor Compliance']]]],
    ['growth', 'Growth', 'megaphone', 'Capture demand, improve the customer journey, and automate follow-up.', [['Lead capture', ['Lead Form Builder', 'Lead Magnet Pages', 'Prequalification Questions']], ['Customer journey', ['Project Completion Form', 'Color Selection Form', 'Review Portal']], ['Marketing connections', ['Marketing Agency Link', 'Ad Performance', 'Ad Integrations']], ['Automation & AI', ['Automations', 'AI Setter Settings', 'AI Closer Settings']]]],
    ['learn', 'Learn', 'cap', 'Training, playbooks, and standard operating procedures.', [['Learning', ['Training Home', 'Standard Operating Procedures']]]],
    ['settings', 'Settings', 'sliders', 'Configure company, sales, production, communication, and billing.', [['Company', ['Company Details', 'Override Code Settings']], ['Sales setup', ['Proposal Templates', 'Line Item Templates', 'Production Rates']], ['Production setup', ['Crew Availability', 'Job Checklists']], ['Communications', ['Email Settings', 'Quo Settings', 'Commission Plans', 'AI Connection', 'Slack Integration']], ['Payments & plan', ['Payment Settings', '3rd Party Financing', 'ACH Direct Deposit', 'Billing & Subscription']]]],
  ];
  const LINK = { 'Sales Pipeline': 'sp', Appointments: 'sa', 'Project Pipeline': 'pp', 'Project Calendar': 'pc' };
  V.drawDrawer = () => {
    const sec = NAV.find((n) => n[0] === S.navSection) || NAV[1];
    drawer.innerHTML = `<div class="rail"><button class="rbtn" data-act="soon" data-arg="Locations" aria-label="Locations">${I('pin')}</button><button class="rbtn" data-act="soon" data-arg="Find a feature" aria-label="Find a feature">${I('search')}</button><i class="rline"></i>
        <div class="rlist">${NAV.map((n) => `<button class="rbtn${n[0] === sec[0] ? ' on' : ''}" data-act="navsec" data-arg="${n[0]}" aria-label="Open ${n[1]}">${I(n[2])}<span>${n[1]}</span>${n[0] === 'inbox' ? '<i class="rdot"></i>' : ''}</button>`).join('')}</div>
        <span class="pick mini2 lang"><button class="on">EN</button><button>ES</button></span><button class="rbtn" data-act="themeflip" aria-label="Switch between light and dark">${I(root.dataset.theme === 'dark' ? 'moon' : 'sun')}</button></div>
      <div class="dpanel"><div class="dtop"><span class="logo">snapcoat</span><span class="chip">V1</span><button class="x" data-act="drawer" aria-label="Close navigation">${I('x')}</button></div>
        <button class="sel wide" data-act="soon" data-arg="Locations"><span class="selx">${I('pin', 'sm')} Locations</span>${I('chev', 'sm')}</button>
        <div class="field">${I('search', 'sm')}<span>Find a feature…</span></div>
        <div class="dsec"><h3><i class="bdot"></i>${sec[1]}</h3><p>${sec[3]}</p></div>
        <nav>${sec[4].map(([g, items]) => `<div class="sec">${g}</div>${items.map((it) => `<button class="nav${LINK[it] === S.screen ? ' on' : ''}" data-act="${LINK[it] ? 'go' : 'soon'}" data-arg="${LINK[it] || it}">${it}</button>`).join('')}`).join('')}</nav>
        <div class="dfoot"><span>SnapCoat CRM</span><span>© ${V.NOW.getFullYear()} SnapCoat LLC</span></div></div>`;
  };
  V.ACT.navsec = (el, arg) => { S.navSection = arg; V.drawDrawer(); };
  V.ACT.themeflip = () => { V.setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'); V.drawDrawer(); };
  V.ACT.go = (el, arg) => { V.closeAll(); V.go(arg); };

  V.go = (screen, keepScroll) => {
    S.screen = screen;
    $$('.page').forEach((p) => p.classList.toggle('on', p.id === 'page-' + screen));
    const page = $('#page-' + screen);
    page.innerHTML = V.render[screen]();
    if (V.after[screen]) V.after[screen](page);
    $('#ptitle').textContent = TITLES[screen];
    if (!keepScroll) scroller.scrollTop = 0;
    syncPicks();
  };
  V.redraw = () => { const y = scroller.scrollTop; V.go(S.screen, true); scroller.scrollTop = y; const p = $('#page-' + S.screen); p.style.animation = 'none'; };
  V.boot = () => {
    let theme = Q.get('theme'), finish = Q.get('finish');
    try { theme = theme || localStorage.getItem('v2-theme'); finish = finish || localStorage.getItem('v2-finish'); } catch (e) { /* private mode */ }
    if (!theme) theme = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    V.setTheme(theme === 'dark' ? 'dark' : 'light');
    V.setFinish(['gloss', 'satin', 'matte'].includes(finish) ? finish : 'gloss');
    if (Q.get('still')) root.classList.add('still');
    drawBar(); drawClock();
    // Deep links, used for the stills and the tests: ?screen=pp&stages=start&cards=j6&open=act:jobmenu:j6
    const scr = TITLES[Q.get('screen')] ? Q.get('screen') : 'sp', list = (k) => (Q.get(k) || '').split(',').filter(Boolean);
    list('stages').forEach((k) => S.open[scr === 'pp' ? 'pp' : 'sp'].add(k));
    list('cards').forEach((k) => S.cards.add(k));
    list('more').forEach((k) => S.more.add(k));
    if (Q.get('view')) { if (scr === 'sa') S.saView = Q.get('view'); else S.pcView = Q.get('view'); }
    if (Q.get('map')) S.pcMap = true;
    if (Q.get('day')) S.saDay = S.pcDay = Number(Q.get('day'));
    if (Q.get('panel')) S.saPanel = S.pcPanel = Number(Q.get('panel'));
    if (Q.get('filters')) S.spFiltersOpen = true;
    V.go(scr);
    const after = () => {
      if (Q.get('scroll')) scroller.scrollTop = Number(Q.get('scroll'));
      list('open').forEach((tok) => {
        const [kind, a, ...more] = tok.split(':'), b = more.join(':');
        if (kind === 'drawer') V.openDrawer();
        else if (kind === 'sheet') V.openSheet(a, b || undefined);
        else if (kind === 'fold') { const btn = $(`[data-act="fold"][data-arg="${a}"]`); if (btn) V.ACT.fold(btn, a); }
        else if (kind === 'act') { const el = b ? $(`[data-act="${a}"][data-arg="${b}"]`) : $(`[data-act="${a}"]`); if (el && V.ACT[a]) V.ACT[a](el, el.dataset.arg || '', {}); }
      });
      if (Q.get('scroll') && list('open').some((t) => t.startsWith('fold'))) scroller.scrollTop = Number(Q.get('scroll'));
    };
    requestAnimationFrame(() => requestAnimationFrame(after));
  };
})();
