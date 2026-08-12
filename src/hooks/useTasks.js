import { useState, useEffect } from 'react'
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

export const TASK_TYPES = [
  { id: 'call', label: 'Call' },
  { id: 'text', label: 'Text' },
  { id: 'email', label: 'Email' },
  { id: 'appointment', label: 'Appointment' },
  { id: 'note', label: 'Note' },
]

export function useTasks(enabled = true) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }
    setLoading(true)
    const q = query(collection(db, 'tasks'), orderBy('dueAt', 'asc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Firestore tasks listener error:', err)
        setError(err)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [enabled])

  return { tasks, loading, error }
}

export async function createTask({ prospectId, prospectName, type, dueAt, notes }) {
  return addDoc(collection(db, 'tasks'), {
    prospectId,
    prospectName,
    type,
    dueAt: Timestamp.fromDate(new Date(dueAt)),
    notes: notes || '',
    completed: false,
    completedAt: null,
    createdAt: serverTimestamp(),
  })
}

export async function completeTask(taskId) {
  return updateDoc(doc(db, 'tasks', taskId), {
    completed: true,
    completedAt: serverTimestamp(),
  })
}

export async function reopenTask(taskId) {
  return updateDoc(doc(db, 'tasks', taskId), {
    completed: false,
    completedAt: null,
  })
}

export async function deleteTask(taskId) {
  return deleteDoc(doc(db, 'tasks', taskId))
}

export function taskTiming(task) {
  if (!task.dueAt) return { label: 'No due date', bucket: 'upcoming' }
  const due = task.dueAt.toDate ? task.dueAt.toDate() : new Date(task.dueAt.seconds * 1000)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  const dayDiff = Math.round((startOfDue - startOfToday) / 86400000)

  const time = due.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  if (task.completed) return { label: `Completed`, bucket: 'done', due }
  if (dayDiff < 0) return { label: `Overdue — ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, bucket: 'overdue', due }
  if (dayDiff === 0) return { label: `Today, ${time}`, bucket: 'today', due }
  if (dayDiff === 1) return { label: `Tomorrow, ${time}`, bucket: 'upcoming', due }
  return { label: due.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + `, ${time}`, bucket: 'upcoming', due }
}
