const KEY = 'ugmath.session.v2'
export function loadSession(){
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { attempts: [], scaleSnap:null, hSnap:null }
  } catch { return { attempts: [], scaleSnap:null, hSnap:null } }
}
export function saveSession(obj){
  try { localStorage.setItem(KEY, JSON.stringify(obj)) } catch {}
}
export function clearSession(){
  try { localStorage.removeItem(KEY) } catch {}
}
