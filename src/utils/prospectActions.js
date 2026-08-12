import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export const STAGES = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'showing', label: 'Showing' },
  { id: 'offer', label: 'Offer' },
  { id: 'under_contract', label: 'Under Contract' },
  { id: 'closed', label: 'Closed' },
]

export async function updateStage(prospectId, stage) {
  return updateDoc(doc(db, 'prospects', prospectId), { stage })
}

export async function markContacted(prospectId) {
  return updateDoc(doc(db, 'prospects', prospectId), {
    status: 'contacted',
    lastContactAt: serverTimestamp(),
  })
}
