/* Kaizen OS v0.3 — provider-neutral sync engine.
   This module is safe to ship client-side. It stores no OAuth secrets.
   Provider tokens belong in a server-side /api layer when deployed. */

window.KaizenSync = (() => {
  const SYNC_KEY = 'kaizen-os-v03-sync';
  const defaultState = {
    defaultWriteCalendar: 'personal-kaizen',
    providers: {
      googleCalendar: { connected: false, lastSync: null, direction: 'two-way' },
      googleTasks: { connected: false, lastSync: null, direction: 'two-way' },
      monday: { connected: true, lastSync: null, direction: 'read-link' }
    },
    queue: [],
    conflicts: []
  };

  function load(){
    try { return Object.assign({}, defaultState, JSON.parse(localStorage.getItem(SYNC_KEY)||'{}')); }
    catch { return structuredClone(defaultState); }
  }
  function save(s){ localStorage.setItem(SYNC_KEY, JSON.stringify(s)); }
  function enqueue(kind, action, payload){
    const s=load();
    s.queue.push({id:crypto.randomUUID?.()||String(Date.now()+Math.random()),kind,action,payload,createdAt:new Date().toISOString(),status:'pending'});
    save(s); return s;
  }
  function markLocalSync(){
    const s=load();
    const now=new Date().toISOString();
    Object.values(s.providers).forEach(p=>{ if(p.connected) p.lastSync=now; });
    s.queue=s.queue.map(q=>({...q,status:q.status==='pending'?'waiting-auth':q.status}));
    save(s); return s;
  }
  function setProvider(name, patch){ const s=load(); s.providers[name]={...s.providers[name],...patch}; save(s); return s; }
  function setDefaultCalendar(id){ const s=load(); s.defaultWriteCalendar=id; save(s); return s; }
  return {load,save,enqueue,markLocalSync,setProvider,setDefaultCalendar};
})();
