'use client'

import { useEffect, useRef, useState } from 'react'
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react'
import { calendarDays, dayStatus, daySummary, monthName, shiftDay, shiftMonth, STATUS_LABELS, taskLabel, today, trDate, type Task } from './training'

type Props = { date: string; tasks: Task[]; loading: boolean; onSelect: (date: string) => void }

export default function TrainingCalendar({ date, tasks, loading, onSelect }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const pendingFocus = useRef<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (pendingFocus.current) {
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-calendar-day="${pendingFocus.current}"]`)?.focus()
      pendingFocus.current = null
    }
  }, [date])
  const days = calendarDays(date)
  const current = today()
  const activeDate = hovered || date
  const grouped = new Map<string, Task[]>()
  tasks.forEach(task => grouped.set(task.task_date, [...(grouped.get(task.task_date) || []), task]))
  const activeTasks = grouped.get(activeDate) || []
  const activeDone = activeTasks.filter(task => task.completed).length

  return <section className="calendar-panel" aria-label="Antrenman takvimi" aria-busy={loading}>
    <div className="calendar-heading">
      <div><div className="eyebrow">HER GÜN BİR ADIM</div><h2><CalendarDays size={22} />Antrenman takvimi</h2></div>
      <button className="secondary-btn" onClick={() => { setHovered(null); onSelect(current) }}>Bugüne dön</button>
    </div>
    <div className="calendar-layout">
      <div className="calendar-main">
        <div className="calendar-month">
          <button className="icon-button" aria-label="Önceki ay" onClick={() => { setHovered(null); onSelect(shiftMonth(date, -1)) }}><ChevronLeft size={19}/></button>
          <div><h3>{monthName(date)}</h3><label className="month-picker">Ay seç<input aria-label="Takvim ayı" type="month" value={date.slice(0, 7)} onChange={event => { if (/^\d{4}-\d{2}$/.test(event.target.value)) { setHovered(null); onSelect(event.target.value + '-01') } }} /></label></div>
          <button className="icon-button" aria-label="Sonraki ay" onClick={() => { setHovered(null); onSelect(shiftMonth(date, 1)) }}><ChevronRight size={19}/></button>
        </div>
        <div className="weekdays" aria-hidden="true">{['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].map(day => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid" ref={gridRef} onMouseLeave={() => setHovered(null)}>
          {days.map(day => {
            const dayTasks = grouped.get(day) || []
            const done = dayTasks.filter(task => task.completed).length
            const status = loading ? 'empty' : dayStatus(dayTasks, day, current)
            return <button key={day} type="button" data-calendar-day={day}
              className={`calendar-day ${status} ${day.slice(0,7) !== date.slice(0,7) ? 'outside-month' : ''} ${day === date ? 'selected' : ''} ${day === current ? 'is-today' : ''}`}
              aria-label={loading ? `${trDate(day)}: yükleniyor` : daySummary(dayTasks, day)} aria-pressed={day === date}
              aria-current={day === current ? 'date' : undefined}
              title={loading ? 'Görevler yükleniyor' : daySummary(dayTasks, day)}
              onMouseEnter={() => setHovered(day)} onFocus={() => setHovered(day)} onBlur={() => setHovered(null)}
              onKeyDown={event => {
                if (event.key === 'Escape') setHovered(null)
                const delta = ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 } as Record<string, number>)[event.key]
                if (delta) { event.preventDefault(); const next = shiftDay(day, delta); pendingFocus.current = next; setHovered(null); onSelect(next) }
              }}
              onClick={() => { setHovered(null); onSelect(day) }}>
              <span className="day-number">{Number(day.slice(-2))}{status === 'complete' && <Check size={12}/>}</span>
              <span className="day-count">{loading ? '·' : dayTasks.length ? `${done}/${dayTasks.length}` : '—'}</span>
              <span className="day-progress" aria-hidden="true"><span style={{width: dayTasks.length ? `${done / dayTasks.length * 100}%` : '0%'}} /></span>
            </button>
          })}
        </div>
        <div className="calendar-legend">{(['complete','partial','planned','missed','empty'] as const).map(status => <span key={status}><i className={status}/>{STATUS_LABELS[status]}</span>)}</div>
        <p className="calendar-help">Günün üzerine gelerek özeti gör. Görevlerini açmak için tıkla; telefonda güne dokun.</p>
      </div>
      <aside className="day-inspector" aria-label="Gün özeti" aria-live="polite">
        <div className="inspector-label"><span>{hovered ? 'GÜNE BAKIŞ' : 'SEÇİLİ GÜN'}</span><CalendarDays size={16}/></div>
        <h3>{trDate(activeDate)}</h3>
        <p className="inspector-summary">{loading ? 'Görevler yükleniyor...' : activeTasks.length ? `${activeDone}/${activeTasks.length} görev tamamlandı` : 'Henüz bir plan yok'}</p>
        <div className="inspector-tasks">{!loading && activeTasks.map(task => <div key={task.id} className={`inspector-task ${task.completed ? 'finished' : ''}`}>
          {task.completed ? <Check size={16}/> : <Clock3 size={16}/>}
          <div><strong>{task.assignee?.display_name || 'Oyuncu'}</strong><p>{taskLabel(task)}</p><span>{task.completed ? 'Tamamladı' : 'Bekliyor'}</span></div>
        </div>)}{!loading && !activeTasks.length && <div className="inspector-empty"><CalendarDays size={30}/><p>Bu güne bir görev ekleyerek<br/>antrenmanını planla.</p></div>}</div>
      </aside>
    </div>
  </section>
}
