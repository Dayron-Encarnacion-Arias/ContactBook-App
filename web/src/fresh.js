// Notas «recién pegadas»: se quedan marcadas hasta que el usuario las ve
const KEY = 'contactbook.fresh';

export function getFresh() {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(KEY)) ?? []);
  } catch {
    return new Set();
  }
}

export function markFresh(id) {
  const fresh = getFresh();
  fresh.add(id);
  sessionStorage.setItem(KEY, JSON.stringify([...fresh]));
}

export function clearFresh(id) {
  const fresh = getFresh();
  fresh.delete(id);
  sessionStorage.setItem(KEY, JSON.stringify([...fresh]));
}
