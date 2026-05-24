export function getOrCreateSessionId() {
  let id = localStorage.getItem('ignite_session_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('ignite_session_id', id)
  }
  return id
}
