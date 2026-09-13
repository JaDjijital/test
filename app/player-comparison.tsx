'use client'

import { BarChart3, Check, Timer } from 'lucide-react'
import { dayStatus, playerProgress, STATUS_LABELS, trDate, weekDays, today, type Task, type Profile } from './training'

export default function PlayerComparison({ date, tasks, profiles, loading }: { date: string; tasks: Task[]; profiles: Profile[]; loading: boolean }) {
  const days = weekDays(date)
  return <section className="comparison-panel" aria-label="Haftalık oyuncu karşılaştırması" aria-busy={loading}>
    <div className="comparison-heading"><div><div className="eyebrow">BİRLİKTE GELİŞİN</div><h2><BarChart3 size={22}/>Haftalık karşılaştırma</h2></div><p>{trDate(days[0])} – {trDate(days[6])}</p></div>
    <div className="comparison-grid">{profiles.map((profile, index) => {
      const progress = playerProgress(tasks, profile.id, days)
      return <article className={`player-progress player-tone-${index % 3}`} key={profile.id}>
        <div className="player-progress-heading"><div className="player-initial">{profile.display_name.slice(0,1)}</div><div><h3>{profile.display_name}</h3><span>@{profile.username}</span></div><strong>{loading ? '…' : `${progress.percent}%`}</strong></div>
        <div className="player-progress-track" role="progressbar" aria-label={`${profile.display_name} haftalık tamamlanma`} aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100}><span style={{width: `${loading ? 0 : progress.percent}%`}}/></div>
        <div className="player-metrics"><span><Check size={15}/>{loading ? '…' : `${progress.done}/${progress.total}`} görev</span><span title="Tamamlanan görevlerin dakika ve saat cinsinden hedefleri; kronometre ölçümü değildir."><Timer size={15}/>{loading ? '…' : new Intl.NumberFormat('tr-TR').format(progress.minutes)} dk hedef tamamlandı</span></div>
        <div className="player-week">{days.map((day, dayIndex) => {
          const daily = tasks.filter(task => task.assigned_to === profile.id && task.task_date === day)
          const status = loading ? 'empty' : dayStatus(daily, day, today())
          return <div key={day} title={`${trDate(day)}: ${STATUS_LABELS[status]} (${daily.filter(task => task.completed).length}/${daily.length})`}><span>{['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'][dayIndex]}</span><i className={status}>{status === 'complete' ? <Check size={13}/> : daily.length ? daily.filter(task => task.completed).length : '·'}</i></div>
        })}</div>
        {!loading && !progress.total && <p className="no-week-plan">Bu hafta henüz görev atanmamış.</p>}
      </article>
    })}</div>
    <p className="comparison-note">Seçili günün haftası gösterilir. Oranlar her oyuncunun kendi görevlerine göre hesaplanır; süreler tamamlanan görev hedeflerinin toplamıdır.</p>
  </section>
}
