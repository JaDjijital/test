export type Profile = { id: string; username: string; display_name: string }
export type Task = {
  id: string; title: string; category: string; target_value: number | null
  unit: string | null; task_date: string; assigned_to: string; assigned_by: string
  completed: boolean; completed_at: string | null; proof_url: string | null
  proof_link?: string | null; notes: string | null; created_at: string
  assignee?: Profile; assigner?: Profile
}

export const pad = (n: number) => String(n).padStart(2, '0')
export const dateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
export const today = () => dateKey(new Date())
export const parseDate = (date: string) => new Date(`${date}T12:00:00`)
export const trDate = (date: string) => new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(parseDate(date))
export const monthName = (date: string) => new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(parseDate(date))

export function shiftDay(date: string, offset: number) {
  const result = parseDate(date)
  result.setDate(result.getDate() + offset)
  return dateKey(result)
}

export function shiftMonth(date: string, offset: number) {
  const original = parseDate(date)
  const result = new Date(original.getFullYear(), original.getMonth() + offset, 1, 12)
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()
  result.setDate(Math.min(original.getDate(), lastDay))
  return dateKey(result)
}

/** Six complete weeks, starting on Monday; local noon avoids UTC date shifts. */
export function calendarDays(date: string) {
  const first = parseDate(date.slice(0, 7) + '-01')
  first.setDate(first.getDate() - (first.getDay() + 6) % 7)
  return Array.from({ length: 42 }, (_, index) => shiftDay(dateKey(first), index))
}

export function dayStatus(tasks: Task[], date: string, currentDate: string) {
  if (!tasks.length) return 'empty'
  const done = tasks.filter(task => task.completed).length
  if (done === tasks.length) return 'complete'
  if (done > 0) return 'partial'
  return date < currentDate ? 'missed' : 'planned'
}

export const STATUS_LABELS = {
  empty: 'Görev yok', complete: 'Tamamlandı', partial: 'Kısmen tamamlandı',
  missed: 'Eksik kaldı', planned: 'Planlandı',
}

export function taskLabel(task: Task) {
  return `${task.title}${task.target_value !== null ? ` (${new Intl.NumberFormat('tr-TR').format(task.target_value)} ${task.unit || 'adet'})` : ''}`
}

export function daySummary(tasks: Task[], date: string) {
  if (!tasks.length) return `${trDate(date)}: Görev yok.`
  return `${trDate(date)}: ${tasks.map(task => `${task.assignee?.display_name || 'Oyuncu'} — ${taskLabel(task)} ${task.completed ? 'tamamladı' : 'bekliyor'}`).join('; ')}`
}

export const QUICK_TASKS = [
  { label: '1.000 bot', title: 'Bot vur', category: 'aim', target: '1000', unit: 'adet' },
  { label: '30 dk DM', title: 'Deathmatch antrenmanı', category: 'dm', target: '30', unit: 'dakika' },
  { label: '5 smoke', title: 'Smoke çalış', category: 'utility', target: '5', unit: 'adet' },
  { label: '20 dk surf', title: 'Surf / movement çalış', category: 'surf', target: '20', unit: 'dakika' },
  { label: 'Demo incele', title: 'Maç demosunu incele', category: 'demo', target: '1', unit: 'demo' },
]

export function weekDays(date: string) {
  const start = shiftDay(date, -((parseDate(date).getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, index) => shiftDay(start, index))
}

export function playerProgress(tasks: Task[], playerId: string, days: string[]) {
  const selected = tasks.filter(task => task.assigned_to === playerId && days.includes(task.task_date))
  const completed = selected.filter(task => task.completed)
  const minutes = completed.reduce((total, task) => total + (task.target_value || 0) * (task.unit === 'saat' ? 60 : task.unit === 'dakika' ? 1 : 0), 0)
  return { total: selected.length, done: completed.length, percent: selected.length ? Math.round(completed.length / selected.length * 100) : 0, minutes }
}
