async function setItem(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

async function getItem(key) {
  const value = window.localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}
