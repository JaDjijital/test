'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Activity, Award, Camera, Check, ChevronLeft, ChevronRight, Crosshair,
  Flame, LogOut, Plus, Target, Timer, Trophy, Upload, Users, X
} from 'lucide-react'

type Profile = { id: string; username: string; display_name: string }
type Task = {
  id: string
  title: string
  category: string
  target_value: number | null
  unit: string | null
  task_date: string
  assigned_to: string
  assigned_by: string
  completed: boolean
  completed_at: string | null
  proof_url: string | null
  proof_link?: string | null
  notes: string | null
  created_at: string
  assignee?: Profile
  assigner?: Profile
}

const CATEGORIES = [
  { value: 'aim', label: 'Aim / Bot', icon: Crosshair },
  { value: 'dm', label: 'Deathmatch', icon: Target },
  { value: 'surf', label: 'Surf / Movement', icon: Activity },
  { value: 'utility', label: 'Smoke / Utility', icon: Flame },
  { value: 'other', label: 'Diğer', icon: Timer },
]

const pad = (n: number) => String(n).padStart(2, '0')
const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const today = () => dateKey(new Date())
const trDate = (value: string) => new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`))

function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!supabase) return setError('Giriş sistemi henüz yapılandırılmadı. Lütfen yöneticiyle iletişime geç.')
    setLoading(true)
    const email = `${username.trim().toLowerCase()}@training.local`
    try {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return setError('Kullanıcı adı veya parola hatalı.')
    onLogin()
    } catch { setError('Bağlantı kurulamadı. Lütfen tekrar dene.') }
    finally { setLoading(false) }
  }

  return (
    <main className="login-shell">
      <div className="noise" />
      <section className="login-card">
        <div className="brand-mark"><Crosshair size={26} /></div>
        <div className="eyebrow">PRIVATE TRAINING HUB</div>
        <h1>AIM<span>ROOM</span></h1>
        <p className="muted">CS2 antrenmanlarını planla, kanıtla ve tamamla.</p>
        <form onSubmit={login} className="login-form">
          <label>Kullanıcı adı<input required value={username} onChange={e => setUsername(e.target.value)} placeholder="jahner" autoComplete="username" /></label>
          <label>Parola<input required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password" autoComplete="current-password" /></label>
          {error && <div className="error-box">{error}</div>}
          <button className="primary" disabled={loading}>{loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}</button>
        </form>
        <div className="secure-note">Sadece davetli oyuncular</div>
      </section>
    </main>
  )
}

function AddTaskModal({ profiles, me, date, onClose, onSaved }: { profiles: Profile[]; me: Profile; date: string; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('aim')
  const [target, setTarget] = useState('')
  const [unit, setUnit] = useState('adet')
  const [assignedTo, setAssignedTo] = useState(profiles.find(p => p.id !== me.id)?.id ?? me.id)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase || !title.trim()) return
    setSaving(true)
    setError('')
    try {
    const { error } = await supabase.from('tasks').insert({
      title: title.trim(), category, target_value: target ? Number(target) : null,
      unit: target ? unit : null, task_date: date, assigned_to: assignedTo,
      assigned_by: me.id, notes: notes.trim() || null
    })
    if (error) setError('Görev kaydedilemedi. Lütfen tekrar dene.')
    if (!error) { onSaved(); onClose() }
    } catch { setError('Bağlantı kurulamadı. Lütfen tekrar dene.') }
    finally { setSaving(false) }
  }

  return <div className="modal-backdrop" onMouseDown={e => e.currentTarget === e.target && onClose()}>
    <div className="modal">
      <button className="close-btn" onClick={onClose}><X size={20}/></button>
      <div className="eyebrow">YENİ GÖREV</div>
      <h2>{trDate(date)}</h2>
      <form onSubmit={save} className="task-form">
        <label>Görev<input value={title} onChange={e => setTitle(e.target.value)} placeholder="Örn. Bot vur" required /></label>
        <div className="two-col">
          <label>Tür<select value={category} onChange={e => setCategory(e.target.value)}>{CATEGORIES.map(c => <option value={c.value} key={c.value}>{c.label}</option>)}</select></label>
          <label>Kime<select value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>{profiles.map(p => <option value={p.id} key={p.id}>{p.display_name}</option>)}</select></label>
        </div>
        <div className="two-col">
          <label>Hedef<input type="number" min="0" step="0.1" value={target} onChange={e => setTarget(e.target.value)} placeholder="1000" /></label>
          <label>Birim<select value={unit} onChange={e => setUnit(e.target.value)}><option>adet</option><option>saat</option><option>dakika</option><option>round</option><option>map</option></select></label>
        </div>
        <label>Not <span className="optional">(opsiyonel)</span><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Örn. HS odaklı, AK kullan..." /></label>
        {error && <div className="error-box" role="alert">{error}</div>}
        <button className="primary" disabled={saving}>{saving ? 'Kaydediliyor...' : 'Görevi Ata'}</button>
      </form>
    </div>
  </div>
}

function TaskCard({ task, me, onChange }: { task: Task; me: Profile; onChange: () => void }) {
  const [uploading, setUploading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const category = CATEGORIES.find(c => c.value === task.category) ?? CATEGORIES[4]
  const Icon = category.icon

  const toggle = async () => {
    if (!supabase || task.assigned_to !== me.id) return
    if (updating) return
    setUpdating(true); setError('')
    try {
      const { data, error } = await supabase.from('tasks').update({ completed: !task.completed, completed_at: !task.completed ? new Date().toISOString() : null }).eq('id', task.id).select('id').single()
      if (error || !data) throw error
      onChange()
    } catch { setError('Görev güncellenemedi. Lütfen tekrar dene.') }
    finally { setUpdating(false) }
  }

  const upload = async (file?: File) => {
    if (!file || !supabase || task.assigned_to !== me.id) return
    setError('')
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) return setError('JPG, PNG, WebP veya GIF seç.')
    if (file.size > 10 * 1024 * 1024) return setError('Görsel en fazla 10 MB olabilir.')
    setUploading(true)
    try {
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${me.id}/${task.id}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('training-proofs').upload(path, file, { upsert: true })
    if (error) throw error
    {
      const { error: saveError } = await supabase.from('tasks').update({ proof_url: path }).eq('id', task.id).select('id').single()
      if (saveError) throw saveError
      onChange()
    }
    } catch { setError('Görsel kaydedilemedi. Lütfen tekrar dene.') }
    finally { setUploading(false) }
  }

  return <article className={`task-card ${task.completed ? 'done' : ''}`}>
    <button className="checkbox" role="checkbox" aria-checked={task.completed} onClick={toggle} disabled={updating || task.assigned_to !== me.id} aria-label={`${task.title}: tamamlandı`}>{task.completed && <Check size={18} strokeWidth={3}/>}</button>
    <div className="task-icon"><Icon size={19}/></div>
    <div className="task-content">
      <div className="task-topline"><span className="task-category">{category.label}</span><span className="assigned-pill">{task.assignee?.display_name ?? 'Oyuncu'}</span></div>
      <h3>{task.title}</h3>
      <div className="task-meta">
        {task.target_value !== null && <span className="metric"><b>{task.target_value}</b> {task.unit}</span>}
        <span>Atayan: {task.assigner?.display_name ?? '—'}</span>
      </div>
      {task.notes && <p className="task-note">{task.notes}</p>}
      <div className="proof-row">
        {task.proof_link ? <a href={task.proof_link} target="_blank" rel="noreferrer" className="proof-preview"><img src={task.proof_link} alt="Antrenman kanıtı" /><span><Camera size={14}/> Kanıtı görüntüle</span></a> : task.assigned_to === me.id ? <label className="upload-btn"><Upload size={15}/>{uploading ? 'Yükleniyor...' : 'Kanıt ekle'}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden disabled={uploading} onChange={e => upload(e.target.files?.[0])}/></label> : <span className="no-proof">Kanıt eklenmedi</span>}
      </div>
      {error && <div className="error-box" role="alert">{error}</div>}
    </div>
  </article>
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [me, setMe] = useState<Profile | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [date, setDate] = useState(today())
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [celebrated, setCelebrated] = useState(false)
  const [loadError, setLoadError] = useState('')

  const load = async () => {
    if (!supabase) return
    setLoading(true)
    setLoadError('')
    try {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return onLogout()
    const [{ data: profileRows, error: profileError }, { data: taskRows, error: taskError }] = await Promise.all([
      supabase.from('profiles').select('*').order('display_name'),
      supabase.from('tasks').select('*').eq('task_date', date).order('created_at')
    ])
    if (profileError || taskError) throw profileError || taskError
    const ps = (profileRows ?? []) as Profile[]
    const mine = ps.find(p => p.id === auth.user?.id) ?? null
    const hydrated = await Promise.all(((taskRows ?? []) as Task[]).map(async t => ({
      ...t,
      assignee: ps.find(p => p.id === t.assigned_to),
      assigner: ps.find(p => p.id === t.assigned_by),
      proof_link: t.proof_url ? (await supabase!.storage.from('training-proofs').createSignedUrl(t.proof_url, 3600)).data?.signedUrl : null
    })))
    setProfiles(ps); setMe(mine); setTasks(hydrated); setLoading(false)
    } catch { setLoadError('Görevler yüklenemedi. Lütfen tekrar dene.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [date])

  const myTasks = useMemo(() => me ? tasks.filter(t => t.assigned_to === me.id) : [], [tasks, me])
  const completed = myTasks.filter(t => t.completed).length
  const completion = myTasks.length ? Math.round((completed / myTasks.length) * 100) : 0
  const allDone = myTasks.length > 0 && completed === myTasks.length

  useEffect(() => { if (allDone) setCelebrated(true) }, [allDone])

  const moveDate = (days: number) => {
    const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate() + days); setDate(dateKey(d)); setCelebrated(false)
  }

  const logout = async () => { await supabase?.auth.signOut(); onLogout() }

  if (!me && !loading) return <div className="center-message"><p>{loadError || 'Oyuncu profilin henüz hazırlanmadı. Lütfen yöneticiyle iletişime geç.'}</p><button onClick={load}>Tekrar Dene</button><button onClick={logout}>Çıkış Yap</button></div>

  return <main className="app-shell">
    <header className="topbar">
      <div className="logo"><Crosshair size={23}/><strong>AIM<span>ROOM</span></strong></div>
      <div className="profile-mini"><div className="avatar">{me?.display_name?.slice(0,1) ?? '?'}</div><div><b>{me?.display_name ?? '...'}</b><small>@{me?.username ?? ''}</small></div><button onClick={logout} title="Çıkış"><LogOut size={18}/></button></div>
    </header>

    <div className="dashboard">
      <section className="hero">
        <div><div className="eyebrow"><span className="live-dot"/> DAILY TRAINING</div><h1>Bugünün işi<br/><span>bitmeden çıkış yok.</span></h1><p>{me?.display_name}, günün görevlerini tamamla. Kanıtını bırak, seriyi bozma.</p></div>
        <div className="score-ring" style={{'--progress': `${completion * 3.6}deg`} as React.CSSProperties}><div><strong>{completion}%</strong><small>{completed}/{myTasks.length} TAMAMLANDI</small></div></div>
      </section>

      <section className="datebar">
        <button onClick={() => moveDate(-1)}><ChevronLeft/></button>
        <div><span>{date === today() ? 'BUGÜN' : 'ANTRENMAN GÜNÜ'}</span><strong>{trDate(date)}</strong></div>
        <button onClick={() => moveDate(1)}><ChevronRight/></button>
      </section>

      <section className="stats-grid">
        <div className="stat"><div className="stat-icon"><Target/></div><div><small>GÖREVLERİM</small><strong>{myTasks.length}</strong></div></div>
        <div className="stat"><div className="stat-icon"><Check/></div><div><small>TAMAMLANAN</small><strong>{completed}</strong></div></div>
        <div className="stat"><div className="stat-icon"><Users/></div><div><small>TAKIM GÖREVİ</small><strong>{tasks.length}</strong></div></div>
        <div className="stat"><div className="stat-icon"><Flame/></div><div><small>GÜNLÜK DURUM</small><strong className="status-text">{allDone ? 'BİTTİ' : 'DEVAM'}</strong></div></div>
      </section>

      <section className="section-head"><div><div className="eyebrow">MISSION LIST</div><h2>{date === today() ? 'Bugünün görevleri' : 'Görevler'}</h2></div><button className="add-btn" onClick={() => setAddOpen(true)}><Plus size={18}/> Görev Ata</button></section>

      <section className="task-list">
        {loadError && <div className="error-box" role="alert">{loadError}<button onClick={load}>Tekrar Dene</button></div>}
        {loading ? <div className="empty">Görevler yükleniyor...</div> : tasks.length === 0 ? <div className="empty"><Crosshair size={34}/><h3>Henüz görev yok</h3><p>Bu güne ilk antrenman görevini ekle.</p></div> : tasks.map(t => <TaskCard key={t.id} task={t} me={me!} onChange={load}/>) }
      </section>
    </div>

    {addOpen && me && <AddTaskModal profiles={profiles} me={me} date={date} onClose={() => setAddOpen(false)} onSaved={load}/>} 
    {celebrated && allDone && <div className="celebration" onClick={() => setCelebrated(false)}><div className="celebration-card"><div className="trophy"><Trophy size={42}/></div><div className="eyebrow">MISSION COMPLETE</div><h2>TEBRİKLER, {me?.display_name?.toUpperCase()}!</h2><p>Bugünün bütün görevlerini tamamladın. Yarın yine aynı disiplin.</p><div className="achievement"><Award size={18}/> Günlük antrenman tamamlandı</div><button className="primary" onClick={() => setCelebrated(false)}>Devam Et</button></div></div>}
  </main>
}

export default function Page() {
  const [ready, setReady] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  const check = async () => {
    if (!supabase) { setReady(true); return }
    const { data } = await supabase.auth.getSession()
    setLoggedIn(!!data.session); setReady(true)
  }
  useEffect(() => { check() }, [])
  if (!ready) return <div className="splash"><Crosshair size={30}/><strong>AIMROOM</strong></div>
  return loggedIn ? <Dashboard onLogout={() => setLoggedIn(false)} /> : <Login onLogin={() => setLoggedIn(true)} />
}
