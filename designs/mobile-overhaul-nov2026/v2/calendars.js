/* Sales Appointments and Project Calendar: same regions, order, labels and controls as today's phone screens. */
(() => {
  'use strict';
  const V = window.V, S = V.S, $ = V.$, $$ = V.$$, money = V.money, A = V.ACT;
  const add = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /* ── Shared phone month calendar (one component draws both calendars today, too) ── */
  // items: { id, s: Date, n: days, short, name, c, done, chip, blocked, act, arg }
  function monthGrid({ off, items, panelKey, dayAct, emptyAct, prod }) {
    const first = new Date(V.NOW.getFullYear(), V.NOW.getMonth() + off, 1), last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
    let w = add(first, -first.getDay()), html = '';
    for (; w <= last; w = add(w, 7)) {
      const bars = [], rows = [];
      items.filter((it) => it.n > 1).forEach((it) => {
        const a = Math.max(0, V.diffDays(it.s, w)), b = Math.min(6, V.diffDays(it.s, w) + it.n - 1);
        if (a > b) return;
        let r = 0; while (rows[r] && rows[r].some(([x, y]) => !(b < x || a > y))) r++;
        (rows[r] = rows[r] || []).push([a, b]);
        bars.push(`<button class="barx" style="--s:${a};--n:${b - a + 1};--r:${r};--c:${it.c}" data-act="${it.act}" data-arg="${it.arg}" aria-label="${it.name}, ${it.n} days">${it.done ? I('check', 'sm') : ''}<span>${it.short} ${it.name}</span>${it.chip ? `<em>${it.chip}</em>` : ''}</button>`);
      });
      const cells = WD.map((_, i) => {
        const d = add(w, i), offDay = V.diffDays(d, V.day(0)), singles = items.filter((it) => it.n === 1 && V.sameDay(it.s, d));
        const pills = singles.slice(0, 3).map((it) => `<button class="pillx${it.blocked ? ' blk' : ''}" style="--c:${it.c}" data-act="${it.act}" data-arg="${it.arg}">${it.blocked ? I('ban', 'sm') : it.done ? I('check', 'sm') : ''}${it.short} ${it.name}</button>`).join('');
        const cls = ['day', d.getMonth() !== first.getMonth() ? 'out' : '', offDay === 0 ? 'today' : '', S[panelKey] === offDay ? 'sel' : ''].filter(Boolean).join(' ');
        return `<div class="${cls}" role="button" tabindex="0" data-act="${singles.length ? dayAct : emptyAct}" data-arg="${offDay}" aria-label="${V.long(d)}${singles.length ? ', ' + V.plural(singles.length, 'entry', 'entries') : ''}"><b>${d.getDate()}</b>${rows.length ? `<i class="sp" style="height:${rows.length * 23}px"></i>` : ''}${pills}${singles.length > 3 ? `<button class="morex" data-act="${dayAct}" data-arg="${offDay}">+${singles.length - 3} more</button>` : ''}</div>`;
      }).join('');
      html += `<div class="wk">${prod ? prod(w) : ''}<div class="days">${cells}${bars.join('')}</div></div>`;
    }
    return `<section class="cal tile"><div class="calhead"><button class="ibtn" data-act="${panelKey}month" data-arg="-1" aria-label="Previous month">${I('left')}</button><b>${V.fmt(first, { month: 'long', year: 'numeric' })}</b><button class="ibtn" data-act="${panelKey}month" data-arg="1" aria-label="Next month">${I('right')}</button></div><div class="wd">${WD.map((d) => `<span>${d}</span>`).join('')}</div>${html}</section>`;
  }
  const dayNav = (key, off) => `<section class="navcard tile"><button class="ibtn" data-act="${key}" data-arg="-1" aria-label="Previous day">${I('left')}</button><b>${V.long(V.day(off))}${off === 0 ? '<small><span class="chip c" style="--c:#3B82F6">Today</span></small>' : ''}</b><button class="ibtn" data-act="${key}" data-arg="1" aria-label="Next day">${I('right')}</button></section>${off !== 0 ? `<button class="btn sm wide jump" data-act="${key}" data-arg="0">${I('calendar', 'sm')}Jump to Today</button>` : ''}`;
  const emptyDay = `<div class="emptyday tile">${I('calendar', 'lg')}<b>No appointments scheduled</b><span>Use the arrow buttons to navigate between days</span></div>`;

  /* ── Sales appointments ────────────────────────────────────────────────── */
  const ap = (id, name, title, off, m, t1, t2, short, who, x = {}) => ({ id, name, title, off, m, t1, t2, short, who, n: 1, status: 'scheduled', lead: true, by: 'AM', phone: '(772) 555-01' + String(20 + m % 70).padStart(2, '0'), addr: '', ...x });
  const AP = [
    ap('a1', 'Camille Okafor', 'In-home estimate: whole-home interior', 0, 540, '9:00 AM', '10:00 AM', '9a', 'DW', { addr: '1204 SE Riverside Dr, Stuart, FL 34996', notes: 'Second visit. Wants to walk the upstairs bedrooms and talk colors before deciding.', proposal: [16852, 'Viewed'], recorded: true, status: 'completed' }),
    ap('a2', 'Nate Sullivan', 'In-home estimate: kitchen cabinets', 0, 690, '11:30 AM', '12:30 PM', '11:30a', 'PS', { addr: '58 NW Fork Rd, Stuart, FL 34994', notes: 'Maple cabinets, wants a satin white. Check the hinges and the island end panels.', by: 'PS' }),
    { id: 'b1', blocked: true, off: 0, n: 1, m: 780, t1: '1:00 PM', t2: '2:00 PM', short: '1p', who: 'MR', reason: 'Training', name: 'Training' },
    ap('a3', 'Devon Blake', 'Color consult', 0, 900, '3:00 PM', '3:45 PM', '3p', 'PS', { addr: '77 SE Ocean Blvd, Stuart, FL 34994', nonSales: true, notes: 'Choosing between two whites for the trim.' }),
    ap('a5', 'Theo Ramsey', 'In-home estimate: interior repaint', 1, 540, '9:00 AM', '10:00 AM', '9a', 'DW', { addr: '31 SW Cabana Point Cir, Palm City, FL 34990', notes: 'Living room and hallway before the holidays. Dog in the yard, use the side gate.' }),
    ap('a6', 'Luis Herrera', 'In-home estimate: exterior and trim', 1, 660, '11:00 AM', '12:00 PM', '11a', 'MR', { addr: '906 SE Dixie Hwy, Stuart, FL 34994' }),
    ap('a13', 'Renee Pollard', 'In-home estimate: garage floor', 1, 810, '1:30 PM', '2:15 PM', '1:30p', 'PS', { addr: '14 NE Savannah Rd, Jensen Beach, FL 34957' }),
    ap('a14', 'Walt Greer', 'In-home estimate: exterior', 1, 930, '3:30 PM', '4:30 PM', '3:30p', 'MR', { addr: '2750 SW Martin Hwy, Palm City, FL 34990' }),
    ap('a7', 'Grace Fontaine', 'In-home estimate: exterior repaint', 2, 810, '1:30 PM', '2:30 PM', '1:30p', 'MR', { addr: '8840 SE Bridge Rd, Hobe Sound, FL 33455' }),
    ap('a8', 'Owen Castillo', 'In-home estimate: exterior repaint', 3, 600, '10:00 AM', '11:00 AM', '10a', 'DW', { addr: '2207 SW Mapp Rd, Palm City, FL 34990' }),
    ap('a9', 'Harbor Point HOA', 'Walkthrough: clubhouse exterior', 5, 510, '8:30 AM', '9:30 AM', '8:30a', 'MR', { addr: '1 Harbor Point Blvd, Stuart, FL 34996' }),
    { id: 'b2', blocked: true, off: 6, n: 1, m: 0, allDay: true, short: '', who: 'DW', reason: 'PTO', name: 'PTO' },
    ap('a12', 'Marisol Ortega', 'In-home estimate: cabinets', 7, 840, '2:00 PM', '3:00 PM', '2p', 'PS', { addr: '1552 NE Skyline Dr, Jensen Beach, FL 34957' }),
    ap('a10', 'Priya Natarajan', 'In-home estimate: interior repaint', -2, 960, '4:00 PM', '5:00 PM', '4p', 'DW', { addr: '410 SW Federal Hwy, Stuart, FL 34994', status: 'completed', proposal: [9566, 'Draft'] }),
    ap('a11', 'Joan Pruitt', 'In-home estimate: garage floor', -6, 660, '11:00 AM', '11:45 AM', '11a', 'PS', { addr: '63 SE Seabreeze Ave, Stuart, FL 34996', status: 'completed' }),
  ];
  V.AP = AP;
  const saMine = (a) => S.saWho === 'all' || a.who === S.saWho;
  const saList = () => AP.filter(saMine);
  const saItems = () => saList().map((a) => ({ id: a.id, s: V.day(a.off), n: 1, short: a.short, name: a.blocked ? `${a.who} ${a.reason}` : a.name, c: a.blocked ? '#EA8A0C' : V.TEAM[a.who].c, blocked: a.blocked, done: false, act: 'sheet', arg: (a.blocked ? 'editblock:' : 'apptdetails:') + a.id }));

  function saCard(a, i, n) {
    if (a.blocked) return `<article class="dcard tile"><button class="tm blocked wide" data-act="sheet" data-arg="editblock:${a.id}">${I('ban', 'sm')}<span class="num">${a.allDay ? 'ALL DAY' : `${a.t1} - ${a.t2}`}</span><span class="chip amb">Blocked</span></button><button class="bd" data-act="sheet" data-arg="editblock:${a.id}"><b>${a.reason || 'Time Blocked Off'}</b><span>${V.TEAM[a.who].name}</span></button><div class="ft"><span>Appointment ${i} of ${n}</span>${I('right', 'sm')}</div></article>`;
    const p = a.proposal;
    return `<article class="dcard tile${p ? ' haspro' : ''}"><div class="tm"><span class="num">${a.t1} - ${a.t2}</span>${p ? `<span class="chip c" style="--c:#10B981">${I('dollar', 'sm')}${p[0].toLocaleString('en-US')}</span><span class="chip">${p[1]}</span>` : ''}${a.recorded ? `<span class="chip c" style="--c:#8B5CF6">${I('mic', 'sm')}Recorded</span>` : ''}</div>
      <button class="bd" data-act="sheet" data-arg="apptdetails:${a.id}"><b>${a.title}</b><span>${a.name}</span><small>${a.addr}</small>${a.notes ? `<small class="clamp">${a.notes}</small>` : ''}</button>
      ${a.recorded ? `<button class="recap" data-act="recap"><b>${I('mic', 'sm')}AI Visit Recap<span class="chip">42m</span></b><ul><li>Wants the whole upstairs plus the stairwell.</li><li>Leaning toward the premium paint line.</li><li>Decision by the end of the week.</li></ul><div class="full" hidden><p><b>Next steps</b></p><ul><li>Send the revised proposal with the stairwell added.</li><li>Follow up Friday morning.</li></ul></div><small class="hintline">Tap for full recap + next steps</small></button>` : ''}
      <p class="assigned">Assigned: ${V.TEAM[a.who].name}</p><p class="createdby">Created by: ${V.TEAM[a.by].name}</p>
      ${a.status === 'completed' ? '' : `<div class="omw"><button class="btn grad sm" data-act="sheet" data-arg="omw:${a.id}">${I('nav', 'sm')}On My Way</button></div>`}
      <div class="ax"><a class="btn solid" href="tel:${a.phone.replace(/\D/g, '')}">${I('phone')}Call</a><button class="btn green" data-act="sheet" data-arg="navigate:${a.id}">${I('nav')}Navigate</button><button class="btn purple" data-act="toast" data-arg="Proposal|Opens the proposal builder for ${a.name}, same as today">${I('file')}Proposal</button><button class="btn amber" data-act="sheet" data-arg="notes:${a.id}:consult">${I('msg')}Notes</button></div>
      <div class="ft"><span>Appointment ${i} of ${n}</span>${I('right', 'sm')}</div></article>`;
  }
  function saPanel() {
    if (S.saPanel == null) return '';
    const d = V.day(S.saPanel), rows = saList().filter((a) => a.off === S.saPanel).sort((x, y) => x.m - y.m);
    return `<section class="daypanel tile" id="sa-panel"><div class="hd"><b>${V.long(d)}</b><button class="x" data-act="sapanelclose" aria-label="Close">${I('x')}</button></div>
      ${rows.map((a) => `<button class="entry" style="--c:${a.blocked ? '#EA8A0C' : V.TEAM[a.who].c}" data-act="sheet" data-arg="${a.blocked ? 'editblock' : 'apptdetails'}:${a.id}"><small>${I(a.blocked ? 'ban' : 'clock', 'sm')}${a.allDay ? 'ALL DAY' : `${a.t1} - ${a.t2}`}</small><b>${a.blocked ? a.reason || 'Blocked' : a.name}</b><small>${V.TEAM[a.who].name}</small></button>`).join('')}
      <button class="btn wide" data-act="sheet" data-arg="appttype:${S.saPanel}">${I('calendar')}Add Appointment</button></section>`;
  }
  function saView() {
    if (S.saView === 'calendar') return monthGrid({ off: S.saMonth, items: saItems(), panelKey: 'saPanel', dayAct: 'sapanel', emptyAct: 'saempty' }) + saPanel();
    if (S.saView === 'map') {
      const who = ['DW', 'MR', 'PS'].filter((k) => S.saWho === 'all' || S.saWho === k);
      return `<section class="mapbox" id="sa-map"><div class="roads"></div><i class="water"></i>
        <div class="mapdate glass"><button class="ibtn" data-act="toast" data-arg="Previous day|The map shows that day's visits and routes" aria-label="Previous day">${I('left')}</button><button class="chipbtn on" data-act="toast" data-arg="Today|Already showing today">Today</button><button class="ibtn" data-act="toast" data-arg="Next day|The map shows that day's visits" aria-label="Next day">${I('right')}</button></div>
        <div class="ctl">${[['crosshair', 'Center all markers'], ['refresh', 'Request fresh GPS from all users'], ['satellite', 'Toggle satellite view', 'on'], ['route', 'Toggle route breadcrumbs'], ['layers', 'Toggle legend']].map(([ic, label, on]) => `<button class="mbtn glass${on ? ' on' : ''}" data-act="mapbtn" data-arg="${ic}" title="${label}" aria-label="${label}">${I(ic)}</button>`).join('')}</div>
        ${who.map((k, i) => `<button class="mk person" style="--c:${V.TEAM[k].c};left:${[28, 62, 44][i]}%;top:${[38, 30, 62][i]}%" data-act="maptip" data-arg="${V.TEAM[k].name}|Salesperson · ${['24 mph, heading north', 'Stationary', '31 mph, heading east'][i]} · Updated 1 min ago · GPS accuracy: ±8m">${k}</button>`).join('')}
        ${saList().filter((a) => a.off === 0 && !a.blocked).map((a, i) => `<button class="mk stop${a.status === 'completed' ? ' done' : ''}" style="--c:${V.TEAM[a.who].c};left:${[20, 71, 53][i % 3]}%;top:${[55, 48, 76][i % 3]}%" data-act="maptip" data-arg="#${i + 1} — ${a.name}|${a.t1} - ${a.t2} · ${a.addr} · ${a.status === 'completed' ? 'Completed' : 'Scheduled'}">${a.status === 'completed' ? I('check', 'sm') : i + 1}</button>`).join('')}
        <div class="legendbox glass" id="sa-legend" hidden><b>Salesperson Colors</b>${who.map((k) => `<span><i class="sdot" style="background:${V.TEAM[k].c}"></i>${V.TEAM[k].name}</span>`).join('')}</div>
        <div class="maptip glass" id="sa-tip" hidden></div>
        <div class="mapstatus glass"><span>${I('users', 'sm')}${who.length}</span><span>${I('calendar', 'sm')}${saList().filter((a) => a.off === 0 && !a.blocked).length}</span><span>${I('checkcircle', 'sm')}${saList().filter((a) => a.off === 0 && a.status === 'completed').length}</span><small>${V.NOW.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</small></div></section>`;
    }
    const rows = saList().filter((a) => a.off === S.saDay).sort((x, y) => x.m - y.m);
    return `${dayNav('saday', S.saDay)}<div class="stripline tile">${V.plural(rows.length, 'appointment')} scheduled</div>${rows.length ? `<div class="rise">${rows.map((a, i) => saCard(a, i + 1, rows.length)).join('')}</div>` : emptyDay}`;
  }
  V.render.sa = () => {
    const n = saList().filter((a) => !a.blocked).length, who = S.saWho === 'all' ? null : V.TEAM[S.saWho];
    const seg = ['today', 'calendar', 'map'], idx = seg.indexOf(S.saView);
    return `${V.helpStrip('sa')}
    <section class="sahead tile"><div><span class="eyebrow">Sales Calendar · Live</span><h1>Appointments</h1></div><span class="cnt"><b class="num">${n}</b> scheduled</span></section>
    <button class="sel wide" data-act="sawho"><span class="selx"><i class="sdot big" style="background:${who ? who.c : 'linear-gradient(135deg,#3B82F6,#D946A8)'}"></i>${who ? who.name : 'All Salespeople'}</span>${I('chev', 'sm')}</button>
    <div class="ctlrow"><button class="ibtn ring big" data-act="sarefresh" aria-label="Refresh appointments">${I('refresh')}</button>
      <div class="seg3 purple" role="tablist"><i class="thumb" style="transform:translateX(${idx * 100}%)"></i>${[['today', 'list', 'Today', 'List view'], ['calendar', 'calendar', 'Calendar', 'Calendar view'], ['map', 'map', 'Map', 'Map view']].map(([k, ic, label, al]) => `<button class="${S.saView === k ? 'on' : ''}" data-act="saview" data-arg="${k}" aria-label="${al}" role="tab" aria-selected="${S.saView === k}">${I(ic, 'sm')}${label}</button>`).join('')}</div></div>
    <div class="ctlrow three"><button class="btn sm" data-act="sheet" data-arg="progress" aria-label="Today’s progress">${I('chart', 'sm')}Progress</button><button class="btn sm" data-act="sheet" data-arg="cancelledappts" aria-label="Cancelled appointments">${I('calx', 'sm')}Cancelled</button><button class="btn sm solid" data-act="saadd" aria-label="Add appointment">${I('plus', 'sm')}Add${I('chev', 'sm')}</button></div>
    <div id="sa-view">${saView()}</div>`;
  };
  const saDraw = () => { $('#sa-view').innerHTML = saView(); };
  A.saview = (el, k) => { S.saView = k; S.saPanel = null; if (k !== 'today') S.saDay = 0; V.redraw(); };
  A.saday = (el, d) => { S.saDay = d === '0' ? 0 : S.saDay + Number(d); saDraw(); };
  A.saPanelmonth = (el, d) => { S.saMonth += Number(d); S.saPanel = null; saDraw(); };
  A.sapanel = (el, d) => { S.saPanel = S.saPanel === Number(d) ? null : Number(d); saDraw(); const p = $('#sa-panel'); if (p) p.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
  A.sapanelclose = () => { S.saPanel = null; saDraw(); };
  A.saempty = (el, d) => V.openSheet('appttype', d);
  A.sawho = (el) => V.openPop(el, V.menu([{ label: 'All Salespeople', dot: 'linear-gradient(135deg,#3B82F6,#D946A8)', act: 'sawhoset', arg: 'all', check: S.saWho === 'all' }, ...['DW', 'MR', 'PS', 'AM', 'TV', 'LB'].map((k) => ({ label: V.TEAM[k].name, dot: V.TEAM[k].c, act: 'sawhoset', arg: k, check: S.saWho === k }))]), { align: 'left', width: 280 });
  A.sawhoset = (el, k) => { V.closePop(); S.saWho = k; S.saPanel = null; V.redraw(); };
  A.sarefresh = (el) => { el.classList.add('spin'); setTimeout(() => el.classList.remove('spin'), 900); };
  A.saadd = (el) => V.openPop(el, V.menu([{ label: 'Sales Appointment', icon: 'calendar', cls: 'green', act: 'sheet', arg: 'scheduler:sales' }, { label: 'Non-Sales Appointment', icon: 'calendar', cls: 'red', act: 'sheet', arg: 'scheduler:non-sales' }, { label: 'Block Off Time', icon: 'ban', cls: 'orange', act: 'sheet', arg: 'blocktime' }]), { width: 250 });
  A.recap = (el) => { const f = $('.full', el); f.hidden = !f.hidden; $('.hintline', el).hidden = !f.hidden; };
  A.mapbtn = (el, k) => { el.classList.toggle('on'); if (k === 'layers') $('#sa-legend').hidden = !el.classList.contains('on'); if (k === 'refresh') { el.classList.remove('on'); V.toast('Requesting fresh GPS', 'From everyone who shares their location'); } if (k === 'satellite') $('#sa-map').classList.toggle('plain', !el.classList.contains('on')); if (k === 'crosshair') el.classList.remove('on'); };
  A.maptip = (el, arg) => { const t = $('#sa-tip'), [a, b] = arg.split('|'); if (!t.hidden && t.dataset.for === a) { t.hidden = true; return; } t.dataset.for = a; t.innerHTML = `<b>${a}</b><small>${b.split(' · ').join('<br>')}</small>`; t.hidden = false; };

  /* ── Project calendar ──────────────────────────────────────────────────── */
  const TYPE = { interior: ['#3B82F6', 'Home Painting', 'Interior'], exterior: ['#14B8A6', 'Home Painting', 'Exterior'], cabinets: ['#D946A8', 'Kitchen Cabinets', 'Cabinets'], commercial: ['#F59E0B', 'Commercial', 'Commercial'], other: ['#64748B', 'Other', ''] };
  const EV = [
    { id: 'e1', job: 'j6', name: 'Andre Coleman', type: 'interior', off: -1, n: 3, pm: 'TV', value: 2929.92, out: 2929.92, addr: '342 SE Coastal Way, Stuart, FL 34994', notes: 'Crew starts in the primary bedroom. Customer works from home, keep the hallway clear.' },
    { id: 'e2', job: 'j7', name: 'Sofia Marin', type: 'cabinets', off: 0, n: 3, pm: 'LB', value: 6955, out: 3477.5, chip: 'Cabinets', addr: '379 SE Coastal Way, Stuart, FL 34994', notes: 'Doors and drawer fronts go to the shop on day one. Boxes are sprayed on site.', recorded: true },
    { id: 'e3', job: 'j4', name: 'Martin Kessler', type: 'interior', off: 1, n: 3, pm: 'TV', value: 7320, out: 7320, addr: '231 SE Coastal Way, Stuart, FL 34994', notes: 'HOA approval is in. Park on the street.' },
    { id: 'e4', job: 'j5', name: 'Bianca Russo', type: 'exterior', off: 5, n: 4, pm: 'LB', value: 11050, out: 11050, addr: '268 SE Coastal Way, Stuart, FL 34994', notes: 'Pressure wash on day one.' },
    { id: 'e5', job: 'j10', name: 'Caleb Dunn', type: 'exterior', off: -8, n: 3, pm: 'TV', value: 13775, out: 0, done: true, addr: '453 SE Coastal Way, Stuart, FL 34994' },
    { id: 'e6', job: 'j9', name: 'Nora Feldman', type: 'interior', off: -10, n: 2, pm: 'LB', value: 5410, out: 5410, done: true, addr: '416 SE Coastal Way, Stuart, FL 34994' },
    { id: 'e7', job: 'j11', name: 'Ivy Chen', type: 'other', off: 0, n: 1, pm: 'LB', value: 4200, out: 0, short: '2p', t1: '2:00 PM', t2: '3:30 PM', label: 'Touch-up visit', addr: '490 SE Coastal Way, Stuart, FL 34994', notes: 'Two nail pops in the dining room ceiling.' },
    { id: 'e8', job: 'j8', name: 'Greg Tanaka', type: 'exterior', off: 8, n: 2, pm: 'TV', value: 8640, out: 8640, addr: '379 SE Coastal Way, Stuart, FL 34994' },
  ].map((e) => ({ short: '8a', t1: '8:00 AM', t2: '4:00 PM', label: `${TYPE[e.type][2] || 'Painting'} Project`, ...e, s: V.day(e.off) }));
  V.EV = EV;
  const pcItems = () => EV.map((e) => ({ id: e.id, s: e.s, n: e.n, short: e.short, name: e.name, c: TYPE[e.type][0], done: e.done, chip: e.chip, act: 'sheet', arg: 'project:' + e.job }));
  const prodOf = (from, to) => { const list = EV.filter((e) => e.s >= from && e.s <= to); return { list, value: list.reduce((t, e) => t + e.value, 0), out: list.reduce((t, e) => t + e.out, 0) }; };
  const prodLine = (label, p, cls = '', extra = '') => (p.list.length ? `<div class="prodline ${cls}"><b>${label} Production: <span class="num">${money(p.value, false)}</span></b><span>${V.plural(p.list.length, 'project')}</span><span class="out">Outstanding: ${money(p.out, false)}</span>${extra}</div>` : '');
  const range = (e) => { const a = e.s, b = add(e.s, e.n - 1); return a.getMonth() === b.getMonth() ? `${V.md(a)}-${b.getDate()}` : `${V.md(a)} - ${V.md(b)}`; };

  function pcPanel() {
    if (S.pcPanel == null) return '';
    const d = V.day(S.pcPanel), rows = EV.filter((e) => S.pcPanel >= e.off && S.pcPanel < e.off + e.n);
    return `<section class="daypanel tile" id="pc-panel"><div class="hd"><b>${V.long(d)}</b><button class="x" data-act="pcpanelclose" aria-label="Close">${I('x')}</button></div>
      ${rows.map((e) => `<button class="entry" style="--c:${TYPE[e.type][0]}" data-act="sheet" data-arg="project:${e.job}"><small>${I('clock', 'sm')}${e.t1} - ${e.t2}</small><b>${e.name}</b>${e.chip ? `<span class="chip">${e.chip}</span>` : ''}${e.done ? `<span class="chip c" style="--c:#10B981">${I('check', 'sm')}Project Completed</span>` : ''}</button>`).join('')}
      <button class="btn wide" data-act="sheet" data-arg="schedulejob">${I('calendar')}Add Appointment</button></section>`;
  }
  function pcDailyCard(e, i, n) {
    return `<article class="dcard tile haspro"><div class="tm"><span class="num">${e.t1} - ${e.t2}</span><span class="chip c" style="--c:#10B981">${I('dollar', 'sm')}${Math.round(e.value).toLocaleString('en-US')}</span><span class="chip">accepted</span>${e.done ? `<span class="chip c" style="--c:#10B981">${I('check', 'sm')}Project Completed</span>` : ''}${e.recorded ? `<span class="chip c" style="--c:#8B5CF6">${I('mic', 'sm')}Recorded</span>` : ''}</div>
      <button class="bd" data-act="sheet" data-arg="project:${e.job}"><b>${e.label} - ${e.name}</b><span>${e.name}</span><small>${e.addr}</small>${e.notes ? `<small class="clamp">${e.notes}</small>` : ''}</button>
      ${e.recorded ? `<button class="recap" data-act="recap"><b>${I('mic', 'sm')}AI Visit Recap<span class="chip">18m</span></b><ul><li>Walked the kitchen with the customer.</li><li>Confirmed the satin white on all boxes.</li><li>Island gets the darker accent color.</li></ul><div class="full" hidden><p><b>Next steps</b></p><ul><li>Order two more quarts of the accent.</li></ul></div><small class="hintline">Tap for full recap + next steps</small></button>` : ''}
      <div class="ax">${e.done ? '' : `<button class="btn grad" data-act="sheet" data-arg="omw:${e.id}">${I('nav')}On My Way</button>`}<a class="btn solid" href="tel:7725550100">${I('phone')}Call</a><button class="btn green" data-act="sheet" data-arg="navigate:${e.id}">${I('nav')}Navigate</button><button class="btn amber" data-act="sheet" data-arg="notes:${e.job}:consult">${I('msg')}Notes</button></div>
      <div class="ft"><span>Appointment ${i} of ${n}</span>${I('right', 'sm')}</div></article>`;
  }
  function pcView() {
    if (S.pcMap) {
      const rows = V.JOBS.filter((j) => j.visit);
      return `<section class="pmmap"><div class="navcard tile"><button class="ibtn" data-act="toast" data-arg="Previous week" aria-label="Previous week">${I('left')}</button><b>Week of ${V.md(add(V.day(0), -V.day(0).getDay()))}</b><button class="ibtn" data-act="toast" data-arg="Next week" aria-label="Next week">${I('right')}</button></div>
        <div class="quad pad0">${[[rows.length, 'Total'], [rows.filter((j) => j.visit === 'ok').length, 'Visited'], [rows.filter((j) => j.visit !== 'ok').length, 'Not Visited'], [Math.round((rows.filter((j) => j.visit === 'ok').length / rows.length) * 100) + '%', 'Compliance']].map(([a, b]) => `<div class="tile"><b class="num">${a}</b><small>${b}</small></div>`).join('')}</div>
        <div class="frow nopad"><button class="sel" data-act="toast" data-arg="All PMs|Same list as today">All PMs${I('chev', 'sm')}</button><button class="sel" data-act="toast" data-arg="All Status|Same list as today">All Status${I('chev', 'sm')}</button><button class="sel" data-act="toast" data-arg="Sort by|Same list as today">Sort by${I('chev', 'sm')}</button></div>
        <div class="mapbox short plain"><div class="roads"></div><i class="water"></i>${rows.map((j, i) => `<span class="mk stop${j.visit === 'ok' ? ' done' : ''}" style="--c:${j.visit === 'ok' ? '#10B981' : '#EF4444'};left:${[24, 58, 40, 72, 33][i % 5]}%;top:${[34, 28, 62, 58, 80][i % 5]}%">${j.visit === 'ok' ? I('check', 'sm') : i + 1}</span>`).join('')}</div>
        ${rows.map((j) => `<div class="maprow tile"><span><b>${j.name}</b><small>${V.PP_STAGES.find((s) => s.key === j.stage).title}${j.pm ? ' · ' + V.TEAM[j.pm].name : ''}</small></span><button class="btn sm green" data-act="sheet" data-arg="navigate:${j.id}">${I('nav', 'sm')}Navigate</button></div>`).join('')}</section>`;
    }
    if (S.pcView === 'monthly') {
      const first = new Date(V.NOW.getFullYear(), V.NOW.getMonth() + S.pcMonth, 1), last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
      return prodLine('Month', prodOf(first, last)) + monthGrid({ off: S.pcMonth, items: pcItems(), panelKey: 'pcPanel', dayAct: 'pcpanel', emptyAct: 'pcempty', prod: (w) => prodLine('Week', prodOf(w, add(w, 6)), 'wk') }) + pcPanel();
    }
    if (S.pcView === 'weekly') {
      const w = add(V.day(0), -V.day(0).getDay() + S.pcWeek * 7), p = prodOf(w, add(w, 6)), pms = [...new Set(p.list.map((e) => e.pm))];
      return `<section class="weekbox tile"><div class="navcard flat"><button class="ibtn" data-act="pcweek" data-arg="-1" aria-label="Previous week">${I('left')}</button><b>${V.md(w)} - ${V.mdy(add(w, 6))}</b><button class="ibtn" data-act="pcweek" data-arg="1" aria-label="Next week">${I('right')}</button></div>
        ${prodLine('Week', p, 'inbox', pms.length > 1 ? `<button class="bypm" data-act="pcbypm">${S.pcByPm ? 'Hide by PM ▲' : 'By PM ▼'}</button>` : '')}
        ${S.pcByPm && pms.length > 1 ? `<div class="bypmlist">${pms.map((k) => { const l = p.list.filter((e) => e.pm === k); return `<div><b>${V.TEAM[k].name}</b><span>${l.length} · ${money(l.reduce((t, e) => t + e.value, 0), false)} · Outstanding ${money(l.reduce((t, e) => t + e.out, 0), false)}</span></div>`; }).join('')}</div>` : ''}
        ${WD.map((name, i) => { const d = add(w, i), off = V.diffDays(d, V.day(0)), list = EV.filter((e) => off >= e.off && off < e.off + e.n);
          return `<div class="dayblk${off === 0 ? ' today' : ''}"><div class="dh"><span>${name}</span><b class="num">${d.getDate()}</b><span class="grow"></span>${list.length ? `<span class="badge fill">${list.length}</span>` : ''}</div>${list.length ? list.map((e) => { const pos = e.n === 1 ? '' : off === e.off ? '▶' : off === e.off + e.n - 1 ? '■' : '━'; return `<button class="wcard" style="--c:${TYPE[e.type][0]}" data-act="sheet" data-arg="project:${e.job}"><span class="r1">${pos ? `<i>${pos}</i>` : ''}<span>${e.name}</span>${e.chip ? `<em>${e.chip}</em>` : ''}<em>${e.done ? 'completed' : 'scheduled'}</em></span><small>${I('calendar', 'sm')}${e.n > 1 ? range(e) : e.t1}${e.done ? `<span>${I('check', 'sm')}Project Completed</span>` : ''}</small></button>`; }).join('') : '<p class="none">No appointments</p>'}</div>`; }).join('')}</section>`;
    }
    const rows = EV.filter((e) => e.off === S.pcDay);
    return `${dayNav('pcday', S.pcDay)}<div class="stripline tile">${V.plural(rows.length, 'appointment')} scheduled</div>${rows.length ? `<div class="rise">${rows.map((e, i) => pcDailyCard(e, i + 1, rows.length)).join('')}</div>` : emptyDay}`;
  }
  V.render.pc = () => {
    const seg = ['daily', 'weekly', 'monthly'], idx = seg.indexOf(S.pcView), nf = S.pcFilters;
    return `${V.helpStrip('pc')}
    <div class="sticky glass" id="pc-controls">
      <div class="gcal">${S.gcalOff ? `<button class="btn sm" data-act="gcal">${I('calendar', 'sm')}Connect Google Calendar</button>` : `${I('calendar', 'sm')}${I('check', 'sm')}<span>Google Calendar Connected</span><button class="textbtn" data-act="gcal">Disconnect</button>`}</div>
      <div class="mini"><button class="ibtn" data-act="fold" data-arg="pc-filters" aria-label="Expand filters" aria-expanded="false">${I('chev', 'sm chev')}</button><b>Filters</b>${nf ? `<span class="badge fill">${nf}</span>` : ''}<span class="grow"></span>${nf ? '<button class="textbtn" data-act="pcclear">Clear</button>' : ''}</div>
      <div class="fold" id="pc-filters"><div><div class="fbody tight"><div><span class="lbl">Project Manager</span><button class="sel wide" data-act="pcsel" data-arg="pm">All Project Managers${I('chev', 'sm')}</button></div>
        <div><span class="lbl">Project Status</span><button class="sel wide" data-act="pcsel" data-arg="status">All Statuses${I('chev', 'sm')}</button></div>
        <div><span class="lbl">Start Date Range</span><div class="pair"><button class="sel wide" data-act="toast" data-arg="From date|Opens the same calendar as today">${I('calendar', 'sm')}From date</button>to<button class="sel wide" data-act="toast" data-arg="To date|Opens the same calendar as today">${I('calendar', 'sm')}To date</button></div></div>
        <button class="btn sm" data-act="pcclear">${I('x', 'sm')}Clear Filters</button></div></div></div>
      <div class="arow"><button class="btn sm blue" data-act="sarefresh">${I('refresh', 'sm')}Refresh</button><button class="btn sm blue" data-act="sheet" data-arg="importjobs">${I('upload', 'sm')}Import</button><button class="btn sm solid" data-act="sheet" data-arg="schedulejob">${I('plus', 'sm')}Schedule Project</button></div>
      <div class="vrow"><div class="seg3" role="tablist"><i class="thumb" style="transform:translateX(${idx * 100}%)"></i>${[['daily', 'Daily'], ['weekly', 'Weekly'], ['monthly', 'Monthly']].map(([k, label]) => `<button class="${S.pcView === k ? 'on' : ''}" data-act="pcview" data-arg="${k}" role="tab" aria-selected="${S.pcView === k}">${label}</button>`).join('')}</div>
        <button class="ibtn ring big${S.pcMap ? ' lit' : ''}" data-act="pcmap" aria-label="${S.pcMap ? 'Back to the calendar' : 'Map view'}" aria-pressed="${S.pcMap}">${I(S.pcMap ? 'calendar' : 'map')}</button>
        <button class="btn sm" data-act="legend" aria-label="Legend">${I('palette', 'sm')}Legend</button></div></div>
    <div id="pc-view">${pcView()}</div>`;
  };
  const pcDraw = () => { $('#pc-view').innerHTML = pcView(); };
  A.pcview = (el, k) => { S.pcView = k; S.pcPanel = null; V.redraw(); };
  A.pcmap = () => { S.pcMap = !S.pcMap; V.redraw(); };
  A.pcday = (el, d) => { S.pcDay = d === '0' ? 0 : S.pcDay + Number(d); pcDraw(); };
  A.pcweek = (el, d) => { S.pcWeek += Number(d); pcDraw(); };
  A.pcPanelmonth = (el, d) => { S.pcMonth += Number(d); S.pcPanel = null; pcDraw(); };
  A.pcpanel = (el, d) => { S.pcPanel = S.pcPanel === Number(d) ? null : Number(d); pcDraw(); const p = $('#pc-panel'); if (p) p.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
  A.pcpanelclose = () => { S.pcPanel = null; pcDraw(); };
  A.pcempty = () => V.openSheet('schedulejob');
  A.pcbypm = () => { S.pcByPm = !S.pcByPm; pcDraw(); };
  A.pcsel = (el, k) => V.openPop(el, V.menu(({ pm: ['All Project Managers', 'Tomas Varga', 'Lena Brooks', 'Alex Morgan'], status: ['All Statuses', ...V.PP_STAGES.map((s) => s.title)] })[k].map((o, i) => ({ label: o, act: 'pcpick', arg: o, check: !i }))), { align: 'left', width: 260 });
  A.pcpick = (el, arg) => { const a = document.querySelector('[data-open]'); V.closePop(); if (a) a.firstChild.textContent = arg; S.pcFilters = Math.min(4, S.pcFilters + (arg.startsWith('All ') ? 0 : 1)); const m = $('#pc-controls .mini'); if (m && S.pcFilters && !$('.badge', m)) $('b', m).insertAdjacentHTML('afterend', `<span class="badge fill">${S.pcFilters}</span>`); else if (m && $('.badge', m)) $('.badge', m).textContent = S.pcFilters; };
  A.pcclear = () => { S.pcFilters = 0; V.redraw(); };
  A.gcal = () => { S.gcalOff = !S.gcalOff; V.redraw(); V.toast(S.gcalOff ? 'Disconnected' : 'Google Calendar Connected', S.gcalOff ? 'Asks to confirm first, same as today' : 'Sends you to Google to approve, same as today'); };
  A.legend = (el) => V.openPop(el, `<div class="legendlist">${Object.values(TYPE).map(([c, name, sub]) => `<span><i class="sq3" style="background:${c}"></i>${name}${sub && name === 'Home Painting' ? ` <small>(${sub.toLowerCase()})</small>` : ''}</span>`).join('')}</div>`, { width: 230 });
})();
