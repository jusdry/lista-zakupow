// Lista zakupów - DZIAŁAJĄCA z SHARE (link do listy)
const STORAGE_KEY = 'shopping-lists-v1';

let state = {
  lists: {},
  currentListId: null
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    state = JSON.parse(saved);
  } else {
    const id = 'dom';
    state.lists[id] = { name: 'Dom', items: [] };
    state.currentListId = id;
  }
}

function renderListsSelect() {
  const select = document.getElementById('lists-select');
  select.innerHTML = '';

  Object.entries(state.lists).forEach(([id, list]) => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = list.name;
    if (id === state.currentListId) opt.selected = true;
    select.appendChild(opt);
  });

  renderCurrentListTitle();
  renderItems();
  renderShareButton();
}

function renderCurrentListTitle() {
  const h2 = document.getElementById('current-list-title');
  const list = state.lists[state.currentListId];
  h2.textContent = list ? list.name : '';
}

function renderItems() {
  const ul = document.getElementById('items-list');
  ul.innerHTML = '';
  const list = state.lists[state.currentListId
