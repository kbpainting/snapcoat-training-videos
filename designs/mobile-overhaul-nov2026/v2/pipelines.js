/* Sales Pipeline and Project Pipeline: same regions, order, labels and controls as today's phone screens. */
(() => {
  'use strict';
  const V = window.V, S = V.S, $ = V.$, $$ = V.$$, money = V.money, esc = V.esc;
  const chip = (label, c, extra = '') => `<span class="chip${c ? ' c' : ''}"${c ? ` style="--c:${c}"` : ''}${extra}>${label}</span>`;
  const person = (k, label) => `<span class="chip" title="${V.TEAM[k].name}"><i style="--c:${V.TEAM[k].c}">${k}</i>${label || V.first(k)}</span>`;
  const SRC = { Facebook: '#3B82F6', 'G. Ads': '#EA8A0C', 'G. LSA': '#10B981', Website: '#8B5CF6', Referral: '#0EA5E9', Angi: '#F43F5E' };
  const AGE = { Hot: ['flame', '#EF4444'], Warm: ['bolt', '#F59E0B'], Cold: ['snow', '#0EA5E9'], Freezing: ['snow', '#6366F1'] };
  const created = (off, time) => `${V.mdy(V.day(off))}, ${time}`;
  const req = () => `${V.fmt(V.day(1), { month: 'numeric', day: 'numeric' })} at 9:00 AM or ${V.fmt(V.day(2), { month: 'numeric', day: 'numeric' })} at 2:00 PM`;

  /* ── Sales pipeline data ───────────────────────────────────────────────── */
  const SP_STAGES = [
    { key: 'new', title: 'New Lead', c: '#3B82F6', kind: 'lead' },
    { key: 'appt', title: 'Appointment Scheduled', c: '#8B5CF6', kind: 'lead' },
    { key: 'draft', title: 'Proposal In-Draft', c: '#F59E0B', kind: 'prop' },
    { key: 'sent', title: 'Proposal Sent', c: '#0EA5E9', kind: 'prop' },
    { key: 'sold', title: 'Job Sold', c: '#10B981', kind: 'prop' },
    { key: 'rej', title: 'REJECTED Proposal', c: '#F43F5E', kind: 'prop' },
  ];
  const LEADS = [
    { id: 'l1', stage: 'new', name: 'Hannah Whitlock', line: 'Interior repaint', city: 'Stuart', amount: 0, src: 'Facebook', age: ['Hot', '2h ago'], ai: 'active', score: 82, notes: 2, requested: true, auto: true, phone: '(772) 555-0142', email: 'hannah.whitlock@example.com', addr: '418 SE Osprey Ridge Ln, Stuart, FL', created: created(0, '8:03 AM') },
    { id: 'l2', stage: 'new', name: 'Owen Castillo', line: 'Exterior repaint', city: 'Palm City', amount: 6400, src: 'G. Ads', age: ['Warm', '1d ago'], owner: 'DW', optout: true, notes: 0, auto: true, phone: '(772) 555-0177', email: 'owen.castillo@example.com', addr: '2207 SW Mapp Rd, Palm City, FL', created: created(-1, '2:41 PM') },
    { id: 'l3', stage: 'new', name: 'Bayview Dental', line: '', city: '', amount: 0, src: 'Website', age: ['Cold', '6d ago'], ai: 'escalated', outside: true, review: true, notes: 1, auto: true, phone: '(561) 555-0119', email: 'office@bayviewdental.example', addr: '90 Harbor Plaza, Jupiter, FL', created: created(-6, '11:20 AM') },
    { id: 'l4', stage: 'new', name: 'Marisol Ortega', line: 'Cabinet refinishing', city: 'Jensen Beach', amount: 0, src: 'Angi', age: ['Freezing', '41d ago'], ai: 'paused', notes: 3, auto: false, phone: '(772) 555-0163', email: 'marisol.ortega@example.com', addr: '1552 NE Skyline Dr, Jensen Beach, FL', created: created(-41, '9:48 AM') },
    { id: 'l5', stage: 'appt', name: 'Theo Ramsey', line: 'Interior repaint', city: 'Palm City', amount: 0, src: 'Referral', owner: 'DW', appt: { off: 1, time: '9:00 AM', who: 'DW', id: 'a5' }, notes: 1, auto: true, phone: '(772) 555-0108', email: 'theo.ramsey@example.com', addr: '31 SW Cabana Point Cir, Palm City, FL', created: created(-2, '4:15 PM') },
    { id: 'l6', stage: 'appt', name: 'Grace Fontaine', line: 'Exterior repaint', city: 'Hobe Sound', amount: 4800, src: 'G. LSA', owner: 'MR', appt: { off: 2, time: '1:30 PM', who: 'MR', id: 'a7' }, score: 67, notes: 0, auto: true, phone: '(772) 555-0155', email: 'grace.fontaine@example.com', addr: '8840 SE Bridge Rd, Hobe Sound, FL', created: created(-3, '10:02 AM') },
    { id: 'l7', stage: 'appt', name: 'Devon Blake', line: 'Color consult', city: 'Stuart', amount: 0, src: 'Website', owner: 'PS', appt: { off: 0, time: '3:00 PM', who: 'PS', id: 'a3', nonSales: true }, notes: 0, auto: true, phone: '(772) 555-0191', email: 'devon.blake@example.com', addr: '77 SE Ocean Blvd, Stuart, FL', created: created(-1, '9:30 AM') },
  ];
  const PROPS = [
    { id: 'p1', stage: 'draft', name: 'Priya Natarajan', title: 'Interior repaint', type: 'Interior Painting', no: '4812', base: 8940, owner: 'DW', status: 'Draft', off: -2, notes: 1, auto: true },
    { id: 'p2', stage: 'draft', name: 'Luis Herrera', title: 'Exterior and trim', type: 'Exterior Painting', no: '4815', base: 12300, owner: 'MR', status: 'Draft', off: -1, notes: 0, auto: true },
    { id: 'p3', stage: 'sent', name: 'Camille Okafor', title: 'Whole-home interior', type: 'Interior Painting', no: '4801', base: 15750, owner: 'DW', status: 'Viewed', closer: 'AI following up', off: -5, notes: 4, auto: true },
    { id: 'p4', stage: 'sent', name: 'Nate Sullivan', title: 'Kitchen cabinets', type: 'Cabinets', no: '4806', base: 6950, owner: 'PS', status: 'Sent', off: -3, notes: 0, auto: true },
    { id: 'p5', stage: 'sent', name: 'Harbor Point HOA', title: 'Clubhouse exterior', type: 'Commercial', no: '4809', base: 28400, owner: 'MR', status: 'Viewed', closer: 'AI paused', off: -4, notes: 2, auto: false },
    { id: 'p6', stage: 'sold', name: 'Elena Marsh', title: 'Interior repaint', type: 'Interior Painting', no: '4788', accepted: 9884.92, owner: 'DW', status: 'Accepted', deposit: 'DEPOSIT PENDING', invoice: true, off: -8, notes: 2, auto: true },
    { id: 'p7', stage: 'sold', name: 'Victor Lang', title: 'Exterior repaint', type: 'Exterior Painting', no: '4779', accepted: 14210, owner: 'MR', status: 'Accepted', invoice: true, off: -11, notes: 0, auto: true },
    { id: 'p8', stage: 'rej', name: 'Joan Pruitt', title: 'Garage floor coating', type: 'Other', no: '4760', base: 3900, owner: 'PS', status: 'Rejected', off: -16, notes: 1, auto: false },
    { id: 'p9', stage: 'rej', name: 'Sam Whitaker', title: 'Fence staining', type: 'Exterior Painting', no: '4741', base: 2150, owner: 'MR', status: 'Expired', off: -34, notes: 0, auto: false },
  ];
  V.LEADS = LEADS; V.PROPS = PROPS;
  const TAX = 7;
  const propTotal = (p) => (p.accepted != null ? p.accepted : Math.round(p.base * (1 + TAX / 100) * 100) / 100);
  const propBase = (p) => (p.accepted != null ? p.accepted : p.base);
  const STATUS_C = { Draft: '#F59E0B', Sent: '#0EA5E9', Viewed: '#8B5CF6', Accepted: '#10B981', Rejected: '#F43F5E', Expired: '#64748B' };

  function spCards(stage) {
    if (S.spArchived) return [];
    const q = S.search.trim().toLowerCase();
    const list = stage.kind === 'lead' ? LEADS : PROPS;
    return list.filter((x) => x.stage === stage.key && (!q || [x.name, x.email, x.phone, x.addr, x.no, x.title].some((f) => f && String(f).toLowerCase().includes(q))));
  }
  function spSummary(stage, cards) {
    if (!cards.length) return stage.kind === 'lead' ? 'No leads in this stage' : 'No proposals in this stage';
    if (stage.key === 'new' || stage.key === 'appt') {
      const n = {}; cards.forEach((l) => { const a = l.age ? l.age[0] : 'Hot'; n[a] = (n[a] || 0) + 1; });
      return ['Hot', 'Warm', 'Cold', 'Freezing'].filter((a) => n[a]).map((a) => `${n[a]} ${a}`).join(' · ');
    }
    if (stage.key === 'draft') return `${V.plural(cards.length, 'proposal')} · continue editing`;
    if (stage.key === 'sent') return `${V.plural(cards.length, 'proposal')} · ${cards.filter((p) => p.status === 'Viewed').length} viewed${cards.some((p) => p.closer === 'AI following up') ? ' · AI Closer on' : ''}`;
    if (stage.key === 'sold') { const d = cards.filter((p) => p.deposit).length; return `${cards.length} accepted · ${d} ${d === 1 ? 'deposit' : 'deposits'} pending`; }
    return `${cards.filter((p) => p.status === 'Rejected').length} rejected · ${cards.filter((p) => p.status === 'Expired').length} expired · revise proposal`;
  }
  const spTotal = (stage, cards) => cards.reduce((t, x) => t + (stage.kind === 'lead' ? x.amount : propBase(x)), 0);

  function leadCard(l, o) {
    const open = S.cards.has(l.id), a = l.appt;
    const primary = l.stage === 'new'
      ? `<button class="btn grad" data-act="schedmenu" data-arg="${l.id}"><span>${I('calendar')}Schedule Appointment</span>${I('arrow')}</button>`
      : a.nonSales ? `<p class="nonsales">Non-Sales Appointment</p>` : `<button class="btn grad" data-act="createproposal" data-arg="${l.id}"><span>${I('file')}Create Proposal</span>${I('arrow')}</button>`;
    return `<article class="card${open ? ' open' : ''}" data-card="${l.id}" style="--o:${o}">
      <div class="ctop">${I('grip', 'sm grip')}<h3>${l.name}</h3><button class="note" data-act="note" data-arg="${l.id}">${I('plus', 'sm')}Note${l.notes ? ` (${l.notes})` : ''}</button><button class="ibtn" data-act="leadmenu" data-arg="${l.id}" title="More Actions" aria-label="More Actions">${I('dotsv')}</button></div>
      <p class="cline">${l.line ? `${l.line}${l.city ? ' · ' + l.city : ''}` : 'Project details pending'}</p>
      <div class="amt"><b class="num">${money(l.amount)}</b><small>est.</small></div>
      <div class="chips">${l.owner ? person(l.owner) : ''}${chip(l.src, SRC[l.src])}${l.stage === 'new' ? chip(`${I(AGE[l.age[0]][0], 'sm')}${l.age[0]} · ${l.age[1]}`, AGE[l.age[0]][1]) : ''}${l.ai ? `<button class="chip c btnlike" style="--c:${l.ai === 'active' ? '#10B981' : l.ai === 'paused' ? '#64748B' : '#F59E0B'}" data-act="aisetter" data-arg="${l.id}">${I('sparkles', 'sm')}AI ${l.ai}${I('chev', 'sm')}</button>` : ''}${l.score ? chip(`${I('sparkles', 'sm')}${l.score}`, '#8B5CF6', ` title="AI lead score: ${l.score}/100"`) : ''}${l.optout ? '<span class="chip red">SMS Opt-Out</span>' : ''}${l.outside ? `<span class="chip red">${I('alert', 'sm')}Outside Service Area</span>` : ''}${l.review ? `<button class="chip amb pulse btnlike" data-act="sheet" data-arg="review:${l.id}">${I('alert', 'sm')}AI REVIEW</button>` : ''}</div>
      ${l.requested ? `<p class="cline meta">${I('clock', 'sm')}Requested: ${req()}</p>` : ''}
      ${a ? `<p class="cline meta">${I('calendar', 'sm')}${V.md(V.day(a.off))} at ${a.time}<span>${I('user', 'sm')}${V.TEAM[a.who].name}</span><span>${I('pin', 'sm')}${l.city}</span></p>` : ''}
      <div class="primary">${primary}</div>
      <div class="cfoot"><button class="swrow${l.auto ? ' on' : ''}" data-act="auto" data-arg="${l.id}" role="switch" aria-checked="${l.auto}"><i class="sw${l.auto ? ' on' : ''}"></i><span>Auto ${l.auto ? 'on' : 'off'}</span></button><span class="grow"></span>
        ${l.stage === 'new' ? `<button class="textbtn" data-act="createproposal" data-arg="${l.id}">${I('file', 'sm')}Create proposal</button>` : `<button class="textbtn" data-act="sheet" data-arg="editappt:${a.id}">${I('pencil', 'sm')}Edit appointment</button>`}
        <button class="ibtn" data-act="cardtoggle" data-arg="${l.id}" title="${open ? 'Collapse' : 'Expand'} details" aria-label="${open ? 'Collapse' : 'Expand'} details">${I('chev', 'chev')}</button></div>
      <div class="fold${open ? ' open' : ''}"><div><div class="detail">
        <h4>Contact Info</h4><a href="tel:${l.phone.replace(/\D/g, '')}">${I('phone', 'sm')}${l.phone}</a><a href="mailto:${l.email}">${I('mail', 'sm')}${l.email}</a>
        ${l.line ? `<h4>Project Info</h4><p>${l.line}. Customer asked for a walkthrough before pricing.</p>` : ''}
        <p>${I('pin', 'sm')}${l.addr}</p><p class="meta">Created ${l.created}</p>
        <div class="acts">${l.stage === 'new' ? `<button class="btn grad" data-act="schedmenu" data-arg="${l.id}">${I('calendar')}Schedule Appointment</button><button class="btn" data-act="createproposal" data-arg="${l.id}">${I('file')}Create Proposal</button>` : `<button class="btn" data-act="sheet" data-arg="editappt:${a.id}">${I('pencil')}Edit Appointment</button>${a.nonSales ? '<p class="nonsales">Non-Sales Appointment</p>' : `<button class="btn grad" data-act="createproposal" data-arg="${l.id}">${I('file')}Create Proposal</button>`}`}</div>
        <div class="icons"><button class="ibtn ring" data-act="leadview" data-arg="${l.id}" title="View Details" aria-label="View Details">${I('eye')}</button><button class="ibtn ring" data-act="sheet" data-arg="editlead:${l.id}" title="Edit Lead" aria-label="Edit Lead">${I('pencil')}</button><button class="ibtn ring" data-act="leadmenu" data-arg="${l.id}:short" title="More Actions" aria-label="More Actions">${I('dotsv')}</button></div>
        ${l.owner ? `<div class="who"><i style="--c:${V.TEAM[l.owner].c}">${l.owner}</i><span><small>Salesperson</small><b>${V.TEAM[l.owner].name}</b></span></div>` : ''}
      </div></div></div></article>`;
  }
  const propPrimary = (p) => (p.status === 'Accepted' ? ['Schedule Project', 'calendar', 'sheet', 'schedulejob:' + p.id] : p.status === 'Rejected' || p.status === 'Expired' ? ['Revise Proposal', 'pencil', 'soon', 'Revise Proposal'] : p.status === 'Draft' ? ['Resume Proposal', 'file', 'soon', 'Resume Proposal'] : ['View Proposal', 'eye', 'soon', 'View Proposal']);
  function propMenuItems(p) {
    const sent = p.status === 'Sent' || p.status === 'Viewed';
    return [
      { label: p.status === 'Draft' ? 'Resume Proposal' : 'View Proposal', icon: p.status === 'Draft' ? 'file' : 'eye' },
      p.status === 'Draft' && { label: 'Delete Draft', icon: 'trash', cls: 'red', act: 'sheet', arg: 'deletedraft:' + p.id },
      p.invoice && { label: 'View Invoice', icon: 'dollar' },
      sent && { label: 'Edit Proposal', icon: 'pencil' },
      sent && { label: 'Reject Proposal', icon: 'xcircle', cls: 'red', act: 'sheet', arg: 'rejectproposal:' + p.id },
      (p.status === 'Rejected' || p.status === 'Expired') && { label: 'Revise Proposal', icon: 'pencil' },
      p.status === 'Accepted' && { label: 'Schedule Project', icon: 'calendar', act: 'sheet', arg: 'schedulejob:' + p.id },
    ];
  }
  function propCard(p, o) {
    const open = S.cards.has(p.id), pr = propPrimary(p), total = propTotal(p), sold = p.stage === 'sold';
    return `<article class="card${open ? ' open' : ''}" data-card="${p.id}" style="--o:${o}">
      <div class="ctop">${I('grip', 'sm grip')}<h3>${p.name}</h3><button class="note" data-act="note" data-arg="${p.id}">${I('plus', 'sm')}Note${p.notes ? ` (${p.notes})` : ''}</button><button class="ibtn" data-act="propmenu" data-arg="${p.id}" title="Proposal actions" aria-label="Proposal actions">${I('dotsv')}</button></div>
      <p class="cline">${p.title} · ${p.type}</p><p class="cline meta">Proposal #${p.no}</p>
      <div class="amt"><b class="num">${money(total)}</b></div>
      ${p.accepted == null ? `<p class="tax">Cost: ${money(p.base)} · Tax (${TAX}%): ${money(total - p.base)}</p>` : ''}
      <div class="chips">${person(p.owner)}${chip(p.status, STATUS_C[p.status])}${sold ? chip(`${I('trophy', 'sm')}Won`, '#10B981') : ''}${p.stage === 'rej' ? chip('Lost', '#F43F5E') : ''}${p.closer ? `<button class="chip c btnlike" style="--c:${p.closer === 'AI paused' ? '#64748B' : '#8B5CF6'}" data-act="aicloser" data-arg="${p.id}">${I('sparkles', 'sm')}${p.closer}${I('chev', 'sm')}</button>` : ''}${p.deposit ? `<span class="chip amb">${I('dollar', 'sm')}${p.deposit}</span>` : ''}</div>
      ${sold ? `<p class="cline meta">${I('user', 'sm')}Sold by ${V.TEAM[p.owner].name}</p>` : ''}
      <p class="cline meta">${I('clock', 'sm')}Created ${V.mdy(V.day(p.off))}</p>
      <div class="primary"><button class="btn grad" data-act="${pr[2]}" data-arg="${pr[3]}"><span>${I(pr[1])}${pr[0]}</span>${I('arrow')}</button></div>
      <div class="cfoot"><button class="swrow${p.auto ? ' on' : ''}" data-act="auto" data-arg="${p.id}" role="switch" aria-checked="${p.auto}"><i class="sw${p.auto ? ' on' : ''}"></i><span>Auto ${p.auto ? 'on' : 'off'}</span></button><span class="grow"></span>
        <button class="ibtn" data-act="sheet" data-arg="customer:${p.id}" title="View Customer" aria-label="View Customer">${I('eye')}</button>
        <button class="ibtn" data-act="cardtoggle" data-arg="${p.id}" title="${open ? 'Collapse' : 'Expand'} details" aria-label="${open ? 'Collapse' : 'Expand'} details">${I('chev', 'chev')}</button>
        <span class="ownerdot"><i style="--c:${V.TEAM[p.owner].c}">${p.owner}</i><small>${sold ? 'Sold by' : 'Owner'}</small></span></div>
      <div class="fold${open ? ' open' : ''}"><div><div class="detail"><p>${chip(p.status, STATUS_C[p.status])} <span class="meta">Created ${V.mdy(V.day(p.off))}</span></p>
        <div class="acts">${propMenuItems(p).filter(Boolean).map((m) => `<button class="btn${m.cls ? ' ' + m.cls : ''}" data-act="${m.act || 'soon'}" data-arg="${m.arg || m.label}">${I(m.icon)}${m.label}</button>`).join('')}</div>
      </div></div></div></article>`;
  }
  const cardHtml = (x, o) => (x.title ? propCard(x, o) : leadCard(x, o));
  function spBody(stage) {
    const cards = spCards(stage), first = stage.kind === 'lead' ? 2 : 1, all = S.more.has('sp-' + stage.key), noun = stage.kind === 'lead' ? 'lead' : 'proposal';
    if (!cards.length) return `<p class="empty">${stage.kind === 'lead' ? 'No leads in this stage' : 'No proposals in this stage'}</p>`;
    const shown = all ? cards : cards.slice(0, first), rest = cards.slice(first);
    return shown.map(cardHtml).join('') + (!all && rest.length ? `<button class="more" data-act="more" data-arg="sp-${stage.key}">${V.plural(rest.length, 'more ' + noun, 'more ' + noun + 's')} · ${money(spTotal(stage, rest))}${I('chev', 'sm')}</button>` : '');
  }
  function spStage(stage, i) {
    const cards = spCards(stage), open = S.open.sp.has(stage.key), noun = stage.kind === 'lead' ? 'lead' : 'proposal';
    return `<section class="stg${open ? ' open' : ''}" style="--c:${stage.c}" data-stage="${stage.key}">
      <button data-act="stage" data-arg="sp:${stage.key}" aria-expanded="${open}"><span class="no num">0${i + 1}</span><span class="mid"><b>${stage.title}</b><span class="badge" style="--c:${stage.c}" aria-label="${V.plural(cards.length, noun)}">${cards.length}</span><small>${spSummary(stage, cards)}</small></span><span class="tot num">${money(spTotal(stage, cards))}</span>${I('chev', 'chev')}</button>
      <div class="fold${open ? ' open' : ''}"><div><div class="stgbody">${open ? spBody(stage) : ''}</div></div></div></section>`;
  }
  V.spPipelineValue = () => LEADS.reduce((t, l) => t + l.amount, 0) + PROPS.filter((p) => p.stage === 'draft' || p.stage === 'sent').reduce((t, p) => t + p.base, 0);

  V.render.sp = () => {
    const f = S.spFilters, nf = Object.keys(f).length, any = SP_STAGES.some((s) => spCards(s).length);
    const fsel = (k, label) => `<button class="sel" data-act="spfilter" data-arg="${k}">${f[k] || label}${I('chev', 'sm')}</button>`;
    return `${V.helpStrip('sp')}
    <section class="cs tile"><h3>${I('calendar')}Get more from SnapCoat</h3><p>Meet with our team for help with your setup and workflow.</p><button class="btn blue" data-act="soon" data-arg="Book your Client Success Call">Book your Client Success Call${I('out', 'sm')}</button></section>
    <div class="titlerow"><div class="t"><h1>Sales pipeline</h1><span class="live"><i class="dot"></i>Live</span><p>${V.long(V.day(0))}</p></div><button class="plus" data-act="fan" data-arg="sp" aria-label="Open quick actions">${I('plus')}</button></div>
    <section class="metrics tile">
      <div class="m half top first"><span class="k"><i style="--c:#10B981">${I('coin', 'sm')}</i>Pipeline value</span><b class="v num">${money(S.spArchived ? 0 : V.spPipelineValue())}</b><small>Draft + sent opportunities</small></div>
      <div class="m half top"><span class="k"><i style="--c:#10B981">${I('coin', 'sm')}</i>Today's sales</span><b class="v num">${money(9884.92)}</b><small class="good">1 proposal accepted</small></div>
      <div class="m half first"><span class="k"><i style="--c:#F59E0B">${I('alarm', 'sm')}</i>Speed to lead</span><b class="v num">4m</b><small>Text 2m · Call 9m</small></div>
      <div class="m"><span class="k"><i style="--c:#8B5CF6">${I('trend', 'sm')}</i>Set rate</span><b class="v num">38%</b></div>
      <div class="m"><span class="k"><i style="--c:#3B82F6">${I('calcheck', 'sm')}</i>Appts booked</span><b class="v num">3</b></div>
    </section>
    <div class="support"><div>${I('phonein', 'sm')}<span><b>14</b> inbound calls · All inbound lines</span></div><div class="w">${I('alert', 'sm')}<span><b>2</b> needs follow-up · New today, nobody has called or texted</span></div></div>
    <div class="rowr"><button class="btn" data-act="sheet" data-arg="lostleads">${I('userx')}Lost Leads</button><button class="btn" data-act="tools">${I('dots')}Tools</button></div>
    <div class="searchrow"><label class="field">${I('search', 'sm')}<input type="search" id="sp-q" placeholder="Search leads, proposals, and more…" value="${esc(S.search)}" aria-label="Search leads, proposals, and more" enterkeyhint="search"><button class="ibtn" data-act="spsearch" aria-label="Search leads">${I('search')}</button></label>
      <button class="btn${S.spFiltersOpen ? ' isopen' : ''}" data-act="spfilters" aria-label="${S.spFiltersOpen ? 'Collapse' : 'Expand'} filters" aria-expanded="${!!S.spFiltersOpen}">${I('filter')}Filters${nf && !S.spFiltersOpen ? `<span class="badge fill">${nf}</span>` : ''}${I('chev', 'sm chev')}</button>
      ${S.spFiltersOpen || nf ? `<button class="ibtn ring" data-act="spreset" aria-label="Reset">${I('x')}</button>` : ''}</div>
    <div class="fold${S.spFiltersOpen ? ' open' : ''}" id="sp-filters"><div><div class="frow">${fsel('stage', 'All Stages')}${fsel('who', 'All Salespeople')}${fsel('source', 'All Sources')}${fsel('proposals', 'All Proposals')}
      <button class="sel" data-act="sprange" data-arg="value">Value range${f.value ? '<i class="sdot" style="background:var(--brand)"></i>' : ''}</button><label class="field tagf">${I('tag', 'sm')}<input type="text" placeholder="Tag…" aria-label="Filter by tag"></label>
      <button class="sel" data-act="sprange" data-arg="date">Date range${f.date ? '<i class="sdot" style="background:var(--brand)"></i>' : ''}</button><button class="sel" data-act="spreset">${I('x', 'sm')}Reset</button></div></div></div>
    <div class="stagehead"><b>6 stages</b><span>Tap a stage to expand</span></div><p class="hint">Swipe up to browse · tap a card for actions</p>
    <div id="sp-stages">${SP_STAGES.map(spStage).join('')}</div>
    ${any ? '' : `<div class="boardempty"><b>${S.spArchived ? 'No archived opportunities found' : 'No active opportunities in this view'}</b><span>${S.spArchived ? 'Archived leads will appear here' : 'Add a lead or clear filters to get started'}</span></div>`}
    <section class="acc tile" id="goal"><div class="hd"><button class="hdmain" data-act="fold" data-arg="goal-more" aria-expanded="false">${I('target')}<b>Monthly Goal</b></button><button class="ibtn" data-act="goaledit" aria-label="Edit monthly goal">${I('pencil', 'sm')}</button><button class="ibtn" data-act="fold" data-arg="goal-more" aria-label="Show goal details">${I('chev', 'chev')}</button></div>
      <div class="tri"><div><b class="num">${I('target', 'sm inl')}63%</b><small>Progress</small></div><div><b class="num">$31,460</b><small>of $50,000</small></div><div><b class="num">4</b><small>Jobs Sold</small></div></div>
      <div class="fold" id="goal-more"><div><div class="prog" style="--w:63%"><i></i></div><div class="tri"><div><b class="num">$1,748</b><small>Daily Avg</small></div><div><b class="num good">$1,545</b><small>Required Rate</small></div><div><b class="num">12</b><small>Days Left</small></div></div>
        <div class="rank"><h4>${I('trophy', 'sm')}Sales Breakdown</h4>${[['DW', 18240, 2, 58], ['MR', 14210, 1, 45], ['PS', 6950, 1, 22]].map(([k, v, n, w]) => `<div class="rk"><i style="--c:${V.TEAM[k].c}">${k}</i><span><b>${V.TEAM[k].name}</b><em style="--w:${w}%"></em></span><span class="num">${money(v, false)}<small>${V.plural(n, 'job')}</small></span></div>`).join('')}</div><p class="status">${I('trend', 'sm')}Ahead of Pace</p></div></div></section>
    <section class="acc tile"><button class="hd" data-act="fold" data-arg="sm-more" aria-label="Toggle salesperson performance and goals" aria-expanded="false">${I('users')}<b>Salespeople · MTD</b><small>4 jobs sold · 3 salespeople</small>${I('chev', 'chev')}</button>
      <div class="strip">${[['DW', '$18,240', '2 sold · 44% close'], ['MR', '$14,210', '1 sold · 33% close'], ['PS', '$6,950', '1 sold · 25% close']].map(([k, v, s]) => `<div><b>${V.first(k)} <span class="num">${v}</span></b><small>${s}</small></div>`).join('')}</div>
      <div class="fold" id="sm-more"><div>${['DW', 'MR', 'PS'].map((k, i) => `<div class="mgr"><div class="mh"><b>${V.TEAM[k].name}</b>${chip([44, 33, 25][i] + '% Closing', '#10B981')}<button class="btn sm" data-act="sheet" data-arg="salesgoal:${k}">${I('pencil', 'sm')}${i ? 'Set Goal' : 'Edit Goal'}</button></div><div class="quint">${[['Appts Attended', [9, 6, 4][i]], ['Proposals Sent', [7, 5, 4][i]], ['Jobs Sold', [2, 1, 1][i]], ['Cancelled', [1, 0, 1][i]], ['Closing Rate', [44, 33, 25][i] + '%']].map(([a, b]) => `<div><b class="num">${b}</b><small>${a}</small></div>`).join('')}</div>${i ? '<p class="meta pad">No goal set for this salesperson</p>' : '<div class="prog" style="--w:73%"><i></i></div>'}</div>`).join('')}</div></div></section>`;
  };
  V.after.sp = (page) => {
    const q = $('#sp-q', page);
    q.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); V.ACT.spsearch(); } });
  };

  /* ── Sales pipeline actions ────────────────────────────────────────────── */
  const A = V.ACT;
  const lead = (id) => LEADS.find((l) => l.id === id) || PROPS.find((p) => p.id === id);
  A.stage = (el, arg) => {
    const [board, key] = arg.split(':'), set = S.open[board], sec = el.closest('section'), body = $('.stgbody', sec), open = !set.has(key);
    open ? set.add(key) : set.delete(key);
    if (open) { body.innerHTML = board === 'sp' ? spBody(SP_STAGES.find((s) => s.key === key)) : ppBody(PP_STAGES.find((s) => s.key === key)); body.classList.add('rise'); setTimeout(() => body.classList.remove('rise'), 1400); }
    sec.classList.toggle('open', open); el.setAttribute('aria-expanded', open); $('.fold', sec).classList.toggle('open', open);
    if (!open) setTimeout(() => { if (!set.has(key)) body.innerHTML = ''; }, 520); // cards are mounted only while their stage is open, as today
  };
  A.more = (el, arg) => { S.more.add(arg); const sec = el.closest('section'), body = $('.stgbody', sec), key = arg.slice(3); const n = $$('.card', body).length; body.innerHTML = arg.startsWith('sp') ? spBody(SP_STAGES.find((s) => s.key === key)) : ppBody(PP_STAGES.find((s) => s.key === key)); $$('.card', body).forEach((c, i) => { if (i >= n) { c.style.setProperty('--o', i - n); c.classList.add('risein'); } }); };
  V.toggleCard = (id) => { const c = $(`.card[data-card="${id}"]`); if (!c) return; const open = !S.cards.has(id); open ? S.cards.add(id) : S.cards.delete(id); c.classList.toggle('open', open); const f = c.querySelector(':scope > .fold'); if (f) f.classList.toggle('open', open); const b = $('[data-act="cardtoggle"]', c); if (b) { b.title = `${open ? 'Collapse' : 'Expand'} details`; b.setAttribute('aria-label', b.title); } };
  A.cardtoggle = (el, arg) => V.toggleCard(arg);
  A.auto = (el, arg) => { const x = lead(arg) || JOBS.find((j) => j.id === arg); x.auto = !x.auto; el.classList.toggle('on', x.auto); el.setAttribute('aria-checked', x.auto); const sw = $('.sw', el); if (sw) sw.classList.toggle('on', x.auto); const t = $('span', el); if (t) t.textContent = el.classList.contains('auto') ? (x.auto ? 'On' : 'Off') : `Auto ${x.auto ? 'on' : 'off'}`; if (el.classList.contains('auto')) { el.classList.toggle('off', !x.auto); $('svg', el).outerHTML = I(x.auto ? 'bell' : 'belloff', 'sm'); } V.toast(x.auto ? 'Automations Enabled' : 'Automations Paused', x.name); };
  A.note = (el, arg) => V.openSheet('notes', arg + ':add');
  A.fan = (el, arg) => {
    if (el.classList.contains('open')) return V.closeFan();
    const sp = [{ label: 'Add Lead', icon: 'plus', act: 'sheet', arg: 'addlead' }, { label: 'Sales Appointment', icon: 'calendar', act: 'sheet', arg: 'scheduler:sales' }, { label: 'Non-Sales Appointment', icon: 'calendar', act: 'sheet', arg: 'scheduler:non-sales' }, { label: 'Create Proposal', icon: 'file', act: 'sheet', arg: 'createproposal' }, { label: 'Block Off Time', icon: 'ban', act: 'sheet', arg: 'blocktime' }];
    V.openFan(el, arg === 'sp' ? sp : [{ label: 'Schedule Project', icon: 'calendar', act: 'sheet', arg: 'schedulejob' }], arg === 'sp' ? '#6B5CF6' : '#2F6BEE');
  };
  A.tools = (el) => V.openPop(el, V.menu([{ label: 'Zapier Integration', icon: 'zap', act: 'sheet', arg: 'zapier' }, S.spArchived ? { label: 'Return to Active Pipeline', icon: 'restore', act: 'sparchive' } : { label: 'View Archived Leads', icon: 'archive', act: 'sparchive' }]), { width: 250 });
  A.sparchive = () => { V.closePop(); S.spArchived = !S.spArchived; V.redraw(); V.toast(S.spArchived ? 'Archived leads' : 'Active pipeline', S.spArchived ? 'Showing archived leads only' : 'Back to the active pipeline'); };
  A.spsearch = () => { S.search = $('#sp-q').value; $('#sp-stages').innerHTML = SP_STAGES.map(spStage).join(''); V.toast(S.search ? `Search: ${esc(S.search)}` : 'Search cleared', 'Applies on Enter or the magnifier, same as today'); };
  A.spfilters = () => { S.spFiltersOpen = !S.spFiltersOpen; V.redraw(); };
  A.spreset = () => { V.closePop(); S.spFilters = {}; S.search = ''; V.redraw(); };
  const FOPT = { stage: ['All Stages', ...SP_STAGES.map((s) => s.title)], who: ['All Salespeople', ...Object.values(V.TEAM).map((t) => `${t.name} (${t.role})`)], source: ['All Sources', 'Facebook', 'Google Ads', 'Google LSA', 'Website', 'Referral', 'Angi'], proposals: ['All Proposals', 'Has Proposals', 'No Proposals', 'Draft Proposals', 'Sent Proposals', 'Accepted Proposals', 'Rejected Proposals'] };
  A.spfilter = (el, k) => V.openPop(el, V.menu(FOPT[k].map((o, i) => ({ label: o, act: 'spfilterset', arg: `${k}|${i ? o : ''}`, check: (S.spFilters[k] || FOPT[k][0]) === o }))), { align: 'left', width: 250 });
  A.spfilterset = (el, arg) => { const [k, v] = arg.split('|'); V.closePop(); if (v) S.spFilters[k] = v; else delete S.spFilters[k]; V.redraw(); };
  A.sprange = (el, k) => V.openPop(el, k === 'value' ? `<h4>Deal Value Range</h4><div class="poprow"><label class="field"><input type="number" inputmode="decimal" placeholder="Min $" aria-label="Min $"></label><label class="field"><input type="number" inputmode="decimal" placeholder="Max $" aria-label="Max $"></label></div>` : `<h4>Created Date Range</h4><div class="poprow"><button class="sel" data-act="toast" data-arg="From|Opens the same calendar as today">${I('calendar', 'sm')}From</button><button class="sel" data-act="toast" data-arg="To|Opens the same calendar as today">${I('calendar', 'sm')}To</button></div>`, { align: 'left', width: 280 });
  A.leadmenu = (el, arg) => {
    const [id, short] = arg.split(':'), l = lead(id);
    V.openPop(el, V.menu([
      !short && { label: 'View Details', icon: 'eye', act: 'leadview', arg: id }, !short && { label: 'Edit Lead', icon: 'pencil', act: 'sheet', arg: 'editlead:' + id },
      { label: 'Lead Notes', icon: 'msg', act: 'sheet', arg: 'notes:' + id }, { label: 'View Color Renders', icon: 'palette', act: 'sheet', arg: 'renders:' + id }, '-',
      { h: 'Assign to Salesperson' }, { label: 'Unassigned', act: 'assign', arg: id + '|', check: !l.owner }, ...['DW', 'MR', 'PS', 'AM'].map((k) => ({ label: V.TEAM[k].name, dot: V.TEAM[k].c, act: 'assign', arg: `${id}|${k}`, check: l.owner === k })), '-',
      S.spArchived ? { label: 'Unarchive', icon: 'restore', cls: 'green', act: 'toast', arg: 'Lead Archived|Same toast as today when unarchiving' } : { label: 'Disqualify Lead', icon: 'userx', cls: 'red', act: 'sheet', arg: 'disqualify:' + id },
      S.spArchived ? { label: 'Delete Permanently', icon: 'trash', cls: 'red', act: 'sheet', arg: 'deleteforever:' + id } : { label: 'Archive Lead', icon: 'archive', cls: 'orange', act: 'sheet', arg: 'archivelead:' + id },
    ]), { width: 260 });
  };
  A.assign = (el, arg) => { const [id, k] = arg.split('|'); V.closePop(); lead(id).owner = k || null; V.redraw(); V.toast('Assignment Successful', k ? `Assigned to ${V.TEAM[k].name}` : 'Now unassigned'); };
  A.leadview = (el, id) => { const l = lead(id); V.closePop(); V.openSheet(l.stage === 'appt' ? 'apptdetails' : 'leaddetails', l.stage === 'appt' ? l.appt.id : id); };
  A.schedmenu = (el, id) => V.openPop(el, V.menu([{ label: 'Sales Appointment', icon: 'calendar', cls: 'green', act: 'sheet', arg: 'scheduler:sales:' + id }, { label: 'Non-Sales Appointment', icon: 'calendar', cls: 'red', act: 'sheet', arg: 'scheduler:non-sales:' + id }]), { align: 'left', width: 250 });
  A.createproposal = (el, id) => { const l = lead(id); V.closePop(); V.toast('Create Proposal', `${l.name} moves to Proposal In-Draft and the builder opens, same as today`); };
  A.propmenu = (el, id) => V.openPop(el, V.menu(propMenuItems(lead(id))), { width: 240 });
  A.aisetter = (el, id) => { const l = lead(id); V.openPop(el, `<h4>AI Setter</h4><p class="poptext">${l.ai === 'active' ? 'The AI Setter is texting this lead to book an appointment.' : l.ai === 'paused' ? 'The AI Setter is paused for this lead.' : 'The AI Setter handed this conversation to your team.'}</p><button class="btn wide sm" data-act="aitoggle" data-arg="${id}">${I(l.ai === 'paused' ? 'play' : 'pause', 'sm')}${l.ai === 'paused' ? 'Resume AI' : 'Pause AI'}</button>`, { align: 'left', width: 260 }); };
  A.aitoggle = (el, id) => { const l = lead(id); l.ai = l.ai === 'paused' ? 'active' : 'paused'; V.closePop(); V.redraw(); V.toast(l.ai === 'paused' ? 'AI paused' : 'AI resumed', l.name); };
  A.aicloser = (el, id) => { const p = lead(id), paused = p.closer === 'AI paused'; V.openPop(el, `<h4>AI Closer</h4><p class="poptext">${paused ? 'Paused by your team — no texts until resumed' : `Next touch: ${V.md(V.day(2))}`} · 2 follow-ups sent</p><div class="poprow wrap">${paused ? `<button class="btn sm" data-act="closertoggle" data-arg="${id}">Resume</button>` : `<button class="btn sm" data-act="closertoggle" data-arg="${id}">Pause</button><button class="btn sm" data-act="toast" data-arg="Snoozed 1 week|${p.name}">Snooze 1w</button><button class="btn sm" data-act="toast" data-arg="Snoozed 1 month|${p.name}">1mo</button><button class="btn sm" data-act="toast" data-arg="Snoozed 2 months|${p.name}">2mo</button>`}</div>`, { align: 'left', width: 280 }); };
  A.closertoggle = (el, id) => { const p = lead(id); p.closer = p.closer === 'AI paused' ? 'AI following up' : 'AI paused'; V.closePop(); V.redraw(); V.toast(p.closer, p.name); };
  A.goaledit = (el) => V.openPop(el, `<h4>Monthly goal</h4><div class="poprow"><label class="field"><input type="number" inputmode="decimal" placeholder="Enter goal amount" value="50000" aria-label="Goal amount"></label></div><div class="poprow"><button class="btn sm solid" data-act="toast" data-arg="Goal saved|Saved on this device, same as today">Save</button><button class="btn sm" data-act="toast" data-arg="Cancelled">Cancel</button></div>`, { width: 260 });

  /* ── Project pipeline data ─────────────────────────────────────────────── */
  const PP_STAGES = [
    { key: 'await', title: 'Awaiting Scheduling', c: '#3B82F6' }, { key: 'sched', title: 'Project Scheduled', c: '#F97316' }, { key: 'start', title: 'Project Started', c: '#8B5CF6' },
    { key: 'delay', title: 'Project Delayed', c: '#F59E0B' }, { key: 'done', title: 'Project Completed', c: '#22C55E' }, { key: 'paid', title: 'Closed & Paid', c: '#10B981' },
  ];
  V.PP_STAGES = PP_STAGES;
  const JOBS = [
    { id: 'j1', stage: 'await', name: 'Elena Marsh', type: 'Interior Painting', value: 9884.92, src: 'G. Ads', flag: 'DEPOSIT PENDING', tags: ['color consult needed'], notes: 2, auto: true },
    { id: 'j2', stage: 'await', name: 'Victor Lang', type: 'Exterior Painting', value: 14210, src: 'Referral', pm: 'TV', tags: [], notes: 0, auto: true },
    { id: 'j3', stage: 'await', name: 'Rosa Delgado', type: 'Cabinets', value: 6480, src: 'Facebook', tags: [], notes: 1, auto: true, ai: 'active' },
    { id: 'j4', stage: 'sched', name: 'Martin Kessler', type: 'Interior Painting', value: 7320, src: 'Website', pm: 'TV', emp: 2, tags: ['HOA approval in'], notes: 1, auto: true, appt: true },
    { id: 'j5', stage: 'sched', name: 'Bianca Russo', type: 'Exterior Painting', value: 11050, src: 'G. LSA', pm: 'LB', sub: 1, tags: [], notes: 0, auto: true, appt: true },
    { id: 'j6', stage: 'start', name: 'Andre Coleman', type: 'Interior Painting', value: 2929.92, src: 'Referral', pm: 'TV', sub: 1, flag: 'IN PERSON PAYMENT REQUIRED', tags: ['New'], notes: 3, auto: true, visit: 'ok', appt: true },
    { id: 'j7', stage: 'start', name: 'Sofia Marin', type: 'Cabinets', value: 6955, src: 'Facebook', pm: 'LB', emp: 2, tags: [], notes: 0, auto: true, visit: 'stale', appt: true },
    { id: 'j8', stage: 'delay', name: 'Greg Tanaka', type: 'Exterior Painting', value: 8640, src: 'G. Ads', pm: 'TV', emp: 1, tags: ['waiting on weather'], notes: 2, auto: false, visit: 'missed', appt: true },
    { id: 'j9', stage: 'done', name: 'Nora Feldman', type: 'Interior Painting', value: 5410, src: 'Website', pm: 'LB', emp: 2, paid: false, invoice: true, tags: [], notes: 1, auto: true, visit: 'ok' },
    { id: 'j10', stage: 'done', name: 'Caleb Dunn', type: 'Exterior Painting', value: 13775, src: 'Referral', pm: 'TV', sub: 1, paid: true, invoice: true, tags: [], notes: 0, auto: true, visit: 'never' },
    { id: 'j11', stage: 'paid', name: 'Ivy Chen', type: 'Interior Painting', value: 4200, src: 'Angi', pm: 'LB', invoice: true, tags: [], notes: 0, auto: true },
    { id: 'j12', stage: 'paid', name: 'Paul Okoro', type: 'Exterior Painting', value: 9150, src: 'G. Ads', pm: 'TV', invoice: true, tags: [], notes: 4, auto: true },
  ];
  V.JOBS = JOBS;
  const job = (id) => JOBS.find((j) => j.id === id);
  const ppCards = (stage) => (S.ppArchived ? [] : JOBS.filter((j) => j.stage === stage.key && (!S.ppTag || j.tags.some((t) => t.toLowerCase().includes(S.ppTag.toLowerCase())))));
  const VISIT = { ok: ['checkcircle', 'var(--good)', 'Visited this week'], stale: ['alert', '#D97706', 'Last visit 4 days ago, getting stale'], missed: ['xcircle', 'var(--bad)', 'No visit this week'], never: ['pin', 'var(--bad)', 'Never visited, needs first site check-in'] };
  const stageBtns = (j) => {
    const b = (label, icon, act, cls = '') => `<button class="btn${cls ? ' ' + cls : ''}" data-act="${act.split('|')[0]}" data-arg="${act.split('|')[1] || j.id}">${I(icon)}${label}</button>`;
    const photos = `<div class="pair2">${b('Project Photos', 'image', 'sheet|photos:' + j.id)}<button class="btn sq2" data-act="toast" data-arg="Camera|Opens the full-screen job camera, same as today" title="Snap photos" aria-label="Snap photos">${I('camera')}</button></div>`;
    const m = {
      await: b('Schedule Project', 'calendar', 'sheet|schedulejob:' + j.id, 'grad'),
      sched: b('Start Project', 'play', 'jobmove|' + j.id + ':start', 'green') + b('Assign Labor', 'users', 'sheet|assignlabor:' + j.id),
      start: b('Complete Project', 'checkcircle', 'jobmove|' + j.id + ':done', 'green') + b('Pause Project', 'pause', 'jobmove|' + j.id + ':delay', 'amber') + photos + b('Assign Labor', 'users', 'sheet|assignlabor:' + j.id),
      delay: b('Resume Project', 'play', 'jobmove|' + j.id + ':start', 'green') + b('Reschedule', 'undo', 'jobmove|' + j.id + ':await'),
      done: b('Collect Payment', 'dollar', 'sheet|collect:' + j.id, 'grad') + photos, paid: '',
    };
    return `<button class="btn" data-act="workorder" data-arg="${j.id}">${I('file')}Work Order${I('chev', 'sm')}</button>${m[j.stage]}${j.invoice ? b('View Invoice', 'dollar', 'soon|View Invoice') : ''}`;
  };
  function jobCard(j, o) {
    const open = S.cards.has(j.id), st = PP_STAGES.find((s) => s.key === j.stage), v = VISIT[j.visit];
    return `${v ? `<div class="visit" title="${v[2]}"><span style="color:${v[1]}" aria-label="${v[2]}">${I(v[0], 'sm')}</span></div>` : ''}<article class="card jc${open ? ' open' : ''}" data-card="${j.id}" style="--c:${st.c};--o:${o}">
      <div class="jtop"><span class="src" title="${j.src}">${I('building', 'sm')}</span><span class="grow"></span>
        <button class="auto${j.auto ? '' : ' off'}" data-act="auto" data-arg="${j.id}" role="switch" aria-checked="${j.auto}" aria-label="Automations">${I(j.auto ? 'bell' : 'belloff', 'sm')}<span>${j.auto ? 'On' : 'Off'}</span></button>
        <button class="note" data-act="note" data-arg="${j.id}">${I('plus', 'sm')}Note${j.notes ? ` (${j.notes})` : ''}</button>
        <button class="ibtn" data-act="cardtoggle" data-arg="${j.id}" title="${open ? 'Collapse' : 'Expand'} details" aria-label="${open ? 'Collapse' : 'Expand'} details">${I('chev', 'chev')}</button></div>
      <h3 class="jname">${j.name}</h3>
      <div class="chips jchips">${chip(j.src, SRC[j.src])}<span class="chip amb soft">${j.type}</span>${j.ai ? `<button class="chip c btnlike" style="--c:#10B981" data-act="toast" data-arg="AI Setter|Same popover as today: status and Pause AI">${I('sparkles', 'sm')}AI ACTIVE${I('chev', 'sm')}</button>` : ''}</div>
      ${j.flag ? `<div class="chips"><span class="chip ${j.flag.startsWith('IN') ? 'red pulse' : 'amb'}">${I('dollar', 'sm')}${j.flag}</span></div>` : ''}
      ${j.stage === 'done' ? `<div class="chips">${j.paid ? `<span class="chip c" style="--c:#10B981">${I('checkcircle', 'sm')}PAID</span>` : `<span class="chip c" style="--c:#EF4444">${I('flag', 'sm')}UNPAID</span>`}</div>` : ''}
      <p class="cline">(1 proposal • <b class="num pv">${money(j.value)}</b>)</p>
      <div class="chips tags">${j.tags.map((t) => `<span class="tagx">${I('tag', 'sm')}${esc(t)}<button data-act="tagdel" data-arg="${j.id}|${esc(t)}" aria-label="Remove tag ${esc(t)}">${I('x', 'sm')}</button></span>`).join('')}<button class="addtag" data-act="tagadd" data-arg="${j.id}">${I('plus', 'sm')}Tag</button></div>
      ${j.pm ? `<span class="pm" title="Project Manager: ${V.TEAM[j.pm].name}"><i style="--c:${V.TEAM[j.pm].c}">${j.pm}</i>${V.first(j.pm)}</span>` : ''}
      ${!open && (j.emp || j.sub) ? `<span class="labor">${j.emp ? `<span style="background:#8B5CF6" title="${V.plural(j.emp, 'employee')}">${I('users', 'sm')}${j.emp}</span>` : ''}${j.sub ? `<span style="background:#4F46E5" title="${V.plural(j.sub, 'subcontractor')}">${I('building', 'sm')}${j.sub}</span>` : ''}</span>` : ''}
      <div class="fold${open ? ' open' : ''}"><div><div class="detail">
        <h4>Contact Info</h4><a href="tel:7725550100">${I('phone', 'sm')}(772) 555-01${String(40 + JOBS.indexOf(j)).padStart(2, '0')}</a><a href="mailto:${j.name.toLowerCase().replace(' ', '.')}@example.com">${I('mail', 'sm')}${j.name.toLowerCase().replace(' ', '.')}@example.com</a>
        <h4>Project Info</h4><p>${j.type}. Walkthrough notes are on the proposal.</p><p>${I('pin', 'sm')}${120 + JOBS.indexOf(j) * 37} SE Coastal Way, Stuart, FL</p><p class="meta">Created ${created(-20 - JOBS.indexOf(j), '10:15 AM')}</p>
        ${j.emp || j.sub ? `<h4>Assigned Labor (${(j.emp || 0) + (j.sub || 0)})</h4>${Array.from({ length: j.emp || 0 }, (_, i) => `<div class="rowlab">${I('user', 'sm')}<span>${['Rafael Ortiz', 'Kim Tran'][i] || 'Crew member'}<small>Production</small></span><button class="ibtn" data-act="toast" data-arg="Remove assignment|Asks to confirm first, same as today" title="Remove assignment" aria-label="Remove assignment">${I('x', 'sm')}</button></div>`).join('')}${j.sub ? `<div class="rowlab">${I('building', 'sm')}<span>Coastline Finishes<small>Jo Alvarez · ✓ Compliant</small></span><button class="ibtn" data-act="toast" data-arg="Remove assignment|Asks to confirm first, same as today" title="Remove assignment" aria-label="Remove assignment">${I('x', 'sm')}</button></div>` : ''}` : ''}
        ${S.ppArchived ? '' : `<div class="acts">${stageBtns(j)}</div>`}
        <div class="icons"><button class="ibtn ring" data-act="sheet" data-arg="project:${j.id}" title="View Details" aria-label="View Details">${I('eye')}</button><button class="ibtn ring" data-act="sheet" data-arg="${j.appt ? 'reschedule' : 'editlead'}:${j.id}" title="Edit Lead" aria-label="Edit Lead">${I('pencil')}</button><button class="ibtn ring" data-act="jobmenu" data-arg="${j.id}" title="More Actions" aria-label="More Actions">${I('dotsv')}</button></div>
        ${j.pm ? `<div class="who"><i style="--c:${V.TEAM[j.pm].c}">${j.pm}</i><span><small>Project Manager</small><b>${V.TEAM[j.pm].name}</b></span></div>` : ''}
      </div></div></div></article>`;
  }
  function ppBody(stage) { const cards = ppCards(stage); return cards.length ? cards.map(jobCard).join('') : '<p class="empty">No projects in this stage</p>'; }
  function ppStage(stage) {
    const cards = ppCards(stage), open = S.open.pp.has(stage.key), total = cards.reduce((t, j) => t + j.value, 0);
    return `<section class="pstg${open ? ' open' : ''}" style="--c:${stage.c}" data-stage="${stage.key}"><i class="strip"></i>
      <button data-act="stage" data-arg="pp:${stage.key}" aria-expanded="${open}"><span class="mid"><b>${stage.title}</b><small>${V.plural(cards.length, 'project')}${cards.length ? ' · ' + money(total) : ''}</small></span><span class="sq">${I('chev', 'chev')}</span></button>
      <div class="fold${open ? ' open' : ''}"><div><div class="stgbody">${open ? ppBody(stage) : ''}</div></div></div></section>`;
  }
  V.render.pp = () => {
    const all = S.ppArchived ? [] : JOBS, prod = PP_STAGES.filter((s) => s.key === 'start' || s.key === 'delay').reduce((n, s) => n + ppCards(s).length, 0);
    const st = (cls, icon, k, v, h) => `<div class="st tile ${cls}"><i>${I(icon)}</i><div><span class="k">${k}</span><b class="num">${v}</b><small>${h}</small></div></div>`;
    return `${V.helpStrip('pp')}
    <section class="hero tile"><span class="pill">${I('sparkles', 'sm')}Production workspace</span><span class="live"><i class="dot"></i>Live</span>
      <h1>Project Pipeline</h1><p>Coordinate scheduling, production, completion, and closeout from one focused workspace.</p>
      <button class="plus round" data-act="fan" data-arg="pp" aria-label="Open quick actions">${I('plus')}</button>
      <div class="stats2">${st('hi', 'coin', 'Portfolio value', money(all.reduce((t, j) => t + j.value, 0)), 'Value represented across project stages')}${st('', 'briefcase', 'Projects', all.length, 'Project records in this view')}${st('', 'hardhat', 'In production', prod, 'Started and delayed projects')}${st('', S.ppArchived ? 'archive' : 'briefcase', 'Current view', S.ppArchived ? 'Archived' : 'Active', S.ppArchived ? 'Archived project records' : 'Active production portfolio')}</div>
      <div class="two"><button class="btn blue" data-act="pprefresh">${I('refresh')}<span>Refresh</span></button><button class="btn blue" data-act="ppmore">${I('dots')}More</button></div></section>
    <section class="fcard tile"><div class="hd"><button class="hdmain" data-act="fold" data-arg="pp-filters" aria-label="Expand filters" aria-expanded="false"><i>${I('filter', 'sm')}</i><b>Filters</b>${I('chev', 'chev')}</button></div>
      <div class="fold" id="pp-filters"><div><div class="fbody"><div><span class="lbl">Project Manager</span><button class="sel wide" data-act="ppsel" data-arg="pm">All Project Managers${I('chev', 'sm')}</button></div>
        <div><span class="lbl">Tag</span><label class="field"><input type="text" id="pp-tag" placeholder="e.g. color consult needed" value="${esc(S.ppTag)}" aria-label="Tag"></label></div>
        <div><span class="lbl">Project Status</span><button class="sel wide" data-act="ppsel" data-arg="status">All Statuses${I('chev', 'sm')}</button></div>
        <div><span class="lbl">Start Date Range</span><div class="pair"><button class="sel wide" data-act="toast" data-arg="From date|Opens the same calendar as today">${I('calendar', 'sm')}From date</button>to<button class="sel wide" data-act="toast" data-arg="To date|Opens the same calendar as today">${I('calendar', 'sm')}To date</button></div></div>
        <button class="btn sm" data-act="ppclear">${I('x', 'sm')}Clear</button></div></div></div></section>
    <div id="pp-stages">${PP_STAGES.map(ppStage).join('')}</div>
    ${all.length ? '' : `<div class="boardempty"><b>${S.ppArchived ? 'No archived projects found' : 'No active projects in this view'}</b><span>${S.ppArchived ? 'Archived projects will appear here' : 'Accepted work appears here when it is ready for production'}</span></div>`}
    <section class="acc tile topstrip" style="--c:#10B981"><div class="hd"><button class="hdmain" data-act="fold" data-arg="pmc-more" aria-expanded="false">${I('briefcase')}<b>PM Commission</b>${chip('Bonus range', '#10B981')}</button><button class="ibtn" data-act="toast" data-arg="Refreshing...|Updating PM commission data" title="Refresh PM commission data" aria-label="Refresh PM commission data">${I('refresh', 'sm')}</button><button class="ibtn" data-act="fold" data-arg="pmc-more" aria-label="Show commission details">${I('chev', 'chev')}</button></div>
      <p class="meta pad">Current Week</p><div class="duo">${[['$1,284', 'Earned'], ['52%', 'Average GP'], ['3', 'Projects'], ['$24,160', 'Revenue']].map(([a, b]) => `<div><b class="num">${a}</b><small>${b}</small></div>`).join('')}</div>
      <div class="fold" id="pmc-more"><div><div class="fbody"><div><span class="lbl">Reporting period</span><button class="sel wide" data-act="ppsel" data-arg="period">Current Week${I('chev', 'sm')}</button></div></div>
        <div class="tri">${[['$725', 'Base'], ['$459', 'GP Bonus'], ['$100', 'Reviews']].map(([a, b]) => `<div><b class="num">${a}</b><small>${b}</small></div>`).join('')}</div>
        <div class="gp"><div class="mh"><b>GP Performance</b>${chip('Bonus', '#10B981')}</div><p class="meta">Average gross profit for this period</p><div class="prog" style="--w:74%"><i></i></div><p class="meta">70% scale</p><p>Strong margins this week. Keep material waste where it is.</p></div>
        <div class="duo"><button data-act="sheet" data-arg="same:Job-Costed Projects"><b class="num">3</b><small>Costed Projects · $24,160 revenue</small></button><button data-act="sheet" data-arg="same:Review Commissions"><b class="num">2</b><small>Reviews · $100 earned</small></button></div></div></div></section>
    <section class="acc tile"><button class="hd" data-act="fold" data-arg="pmm-more" aria-expanded="false">${I('briefcase')}<span class="hd2"><small>Production overview</small><b>Project Manager Metrics</b></span>${I('chev', 'chev')}</button>
      <div class="tri">${[['$42,515', 'Produced'], ['4', 'Completed'], ['2', 'Managers']].map(([a, b]) => `<div><b class="num">${a}</b><small>${b}</small></div>`).join('')}</div>
      <div class="fold" id="pmm-more"><div>
        <div class="mgr"><div class="mh"><b>Tomas Varga</b>${chip('3 completed', '#10B981')}<button class="btn sm" data-act="sheet" data-arg="prodgoal:TV">${I('pencil', 'sm')}Edit Goal</button></div><p class="bigpct num">71%<small>Monthly Goal Completion</small></p>
          <div class="quad">${[['$40,000', 'Goal'], ['$28,340', 'Produced'], ['3', 'Jobs Done'], ['$11,660', 'Remaining']].map(([a, b]) => `<div><b class="num">${a}</b><small>${b}</small></div>`).join('')}</div>
          <div class="prog miles" style="--w:57%"><i></i>${[25, 50, 75, 100, 125].map((m) => `<em style="left:${m / 1.25}%" title="${m}%"></em>`).join('')}</div>
          <h4 class="sub4">Production Trending</h4><div class="quint">${[['$1,574', 'Daily Average'], ['$972', 'Required Daily'], ['Ahead', 'Pace'], ['12', 'Days Left'], ['$11,660', 'Needed']].map(([a, b]) => `<div><b class="num">${a}</b><small>${b}</small></div>`).join('')}</div><p class="status">${I('trend', 'sm')}On pace to finish the month above goal.</p></div>
        <div class="mgr"><div class="mh"><b>Lena Brooks</b>${chip('1 completed', '#10B981')}<button class="btn sm" data-act="sheet" data-arg="prodgoal:LB">${I('pencil', 'sm')}Set Goal</button></div><p class="meta pad">No production goal set for this PM</p>
          <div class="tri">${[['$14,175', 'Produced'], ['1', 'Jobs Done'], ['$14,175', 'Avg Value']].map(([a, b]) => `<div><b class="num">${a}</b><small>${b}</small></div>`).join('')}</div></div></div></div></section>`;
  };
  V.after.pp = (page) => { const t = $('#pp-tag', page); t.addEventListener('input', () => { S.ppTag = t.value; $('#pp-stages').innerHTML = PP_STAGES.map(ppStage).join(''); }); };

  const TOASTS = { start: ['Project Started', 'Moved to Project Started'], done: ['Project Completed', 'Moved to Project Completed'], delay: ['Project Paused', 'Moved to Project Delayed'], await: ['Project Rescheduled', 'Project moved to Awaiting Scheduling. It will appear in both Project and Sales pipelines.'] };
  A.jobmove = (el, arg) => { const [id, to] = arg.split(':'), j = job(id), from = j.stage; const msg = from === 'delay' && to === 'start' ? ['Project Resumed', 'Back in Project Started'] : TOASTS[to]; j.stage = to; if (to === 'await') j.appt = false; S.open.pp.add(to); V.redraw(); V.toast(msg[0], `${j.name}. ${msg[1]}`); const c = $(`.card[data-card="${id}"]`); if (c) { c.classList.add('landed'); c.scrollIntoView({ block: 'center', behavior: document.documentElement.classList.contains('still') ? 'auto' : 'smooth' }); } };
  A.pprefresh = (el) => { const s = $('span', el); el.disabled = true; el.classList.add('spin'); s.textContent = 'Refreshing'; $$('.live').forEach((l) => { l.lastChild.textContent = 'Refreshing'; }); setTimeout(() => { el.disabled = false; el.classList.remove('spin'); s.textContent = 'Refresh'; $$('.live').forEach((l) => { l.lastChild.textContent = 'Live'; }); }, 1100); };
  A.ppmore = (el) => V.openPop(el, V.menu([S.ppArchived ? { label: 'Return to Active Projects', icon: 'restore', act: 'pparchive' } : { label: 'View Archived Projects', icon: 'archive', act: 'pparchive' }, { label: 'Cancelled Projects', icon: 'xcircle', cls: 'red', act: 'sheet', arg: 'cancelledprojects' }]), { width: 250 });
  A.pparchive = () => { V.closePop(); S.ppArchived = !S.ppArchived; V.redraw(); };
  A.ppsel = (el, k) => V.openPop(el, V.menu(({ pm: ['All Project Managers', 'Tomas Varga', 'Lena Brooks', 'Alex Morgan (Admin)'], status: ['All Statuses', 'Scheduled', 'In Progress', 'Delayed', 'Completed'], period: ['Current Week', 'Previous Week', 'Previous 2 Weeks', 'Previous Month', 'Month to Date', 'Year to Date'] })[k].map((o, i) => ({ label: o, act: 'pick', arg: o, check: !i }))), { align: 'left', width: 250 });
  A.pick = (el, arg) => { const a = document.querySelector('[data-open]'); V.closePop(); if (a && a.firstChild && a.firstChild.nodeType === 3) a.firstChild.textContent = arg; };
  A.ppclear = () => { S.ppTag = ''; V.redraw(); };
  A.tagdel = (el, arg) => { const [id, t] = arg.split('|'), j = job(id); j.tags = j.tags.filter((x) => x !== t); el.closest('.tagx').remove(); };
  A.tagadd = (el, id) => V.openPop(el, `<div class="poprow"><label class="field"><input type="text" id="tag-in" maxlength="40" placeholder="e.g. color consult needed" aria-label="New tag"></label><button class="btn sm solid" data-act="tagsave" data-arg="${id}">Add</button></div><p class="poptext">Small steps or notes that aren’t full stages. Click a tag’s × to remove it.</p>`, { align: 'left', width: 300 });
  A.tagsave = (el, id) => { const v = $('#tag-in').value.trim(), j = job(id); V.closePop(); if (v && !j.tags.includes(v)) { j.tags.push(v); V.redraw(); } };
  A.workorder = (el) => V.openPop(el, V.menu([{ h: 'Work Order' }, { label: 'Admin Copy (full pricing)', icon: 'file', act: 'toast', arg: 'Admin Copy|Opens the PDF in a new tab, same as today' }, { label: 'Sub Copy (no pricing)', icon: 'file', act: 'toast', arg: 'Sub Copy|Opens the PDF in a new tab, same as today' }]), { align: 'left', width: 260 });
  A.jobmenu = (el, id) => { const j = job(id); V.openPop(el, V.menu([{ label: 'Lead Notes', icon: 'msg', act: 'sheet', arg: 'notes:' + id }, { label: 'View Color Renders', icon: 'palette', act: 'sheet', arg: 'renders:' + id }, ...(S.ppArchived ? [] : ['-', { h: 'Assign to Project Manager' }, { label: 'Unassigned', act: 'assignpm', arg: id + '|', check: !j.pm }, ...['TV', 'LB', 'AM'].map((k) => ({ label: V.TEAM[k].name, dot: V.TEAM[k].c, act: 'assignpm', arg: `${id}|${k}`, check: j.pm === k }))])]), { width: 260 }); };
  A.assignpm = (el, arg) => { const [id, k] = arg.split('|'); V.closePop(); job(id).pm = k || null; V.redraw(); V.toast('Project manager updated', k ? V.TEAM[k].name : 'Unassigned'); };
})();
