let currentRole = 'EMPLOYEE';

export function setRole(role) {
  currentRole = role;
}

export function getRole() {
  return currentRole;
}

function headers() {
  return {
    'Content-Type': 'application/json',
    'x-user-role': currentRole,
  };
}

export async function chat(message) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function overlap(idea) {
  const res = await fetch('/api/overlap', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ idea }),
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

export async function fetchStock() {
  const res = await fetch('/api/stock');
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function fetchNews() {
  const res = await fetch('/api/news');
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}
