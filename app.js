// Lista zakupów z SYNCHRONIZACJĄ LIVE - Firebase
const firebaseConfig = {
  // WSTAW TUTAJ PRAWdziWY config z Twojej bazy!
  apiKey: "AIzaSyD8dQ1nZ2mN3pO4qR5sT6uV7wX8yZ9aB0cC1dE2f",
  authDomain: "lista-zakupow-17d16.firebaseapp.com",
  databaseURL: "https://lista-zakupow-17d16-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "lista-zakupow-17d16",
  storageBucket: "lista-zakupow-17d16.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

let state = { lists: {}, currentListId: null };
let dbRef;

function initFirebase() {
  firebase.initializeApp(firebaseConfig);
  dbRef = firebase.database().ref('lists');
  
  // SYNCHRONIZACJA LIVE
  dbRef.on('value', snapshot => {
    const data = snapshot.val() || {};
    state.lists = data;
    if (!state.currentListId || !state.lists[state.currentListId]) {
      state.currentListId = Object.keys(data)[0] || 'dom';
    }
    renderEverything();
  });
}

function saveList(id, list) {
  dbRef.child(id).set(list);
}

// Funkcje renderowania (jak wcześniej)
function renderEverything() {
  renderListsSelect();
  renderCurrentListTitle();
  renderItems();
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
}

function renderCurrentListTitle() {
  const h2 = document.getElementById('current-list-title');
  const list = state.lists[state.currentListId];
  h2.textContent = list ? list.name : '';
}

function renderItems() {
  const ul = document.getElementById('items-list');
  ul.innerHTML = '';
  const list = state.lists[state.currentListId];
  if (!list) return;

  list.items.forEach((item, index) => {
    const li = document.createElement('li');
    if (item.bought) li.classList.add('bought');

    const span = document.createElement('span');
    span.textContent = item.name;

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = item.bought ? '↩️' : '✔️';
    toggleBtn.onclick = () => {
      item.bought = !item.bought;
      saveList(state.currentListId, list);
    };

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '🗑️';
    removeBtn.onclick = () => {
      list.items.splice(index, 1);
      saveList(state.currentListId, list);
    };

    li.append(span, toggleBtn, removeBtn);
    ul.appendChild(li);
  });
}

function addList(name) {
  const id = Date.now().toString();
  const newList = { name, items: [] };
  state.lists[id] = newList;
  state.currentListId = id;
  saveList(id, newList);
}

function addItemToCurrentList(name) {
  const list = state.lists[state.currentListId];
  if (!list) return;
  list.items.push({ name, bought: false });
  saveList(state.currentListId, list);
}

// START APLIKACJI
document.addEventListener('DOMContentLoaded', () => {
  // Ładuj Firebase SDK
  const script1 = document.createElement('script');
  script1.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
  script1.onload = () => {
    const script2 = document.createElement('script');
    script2.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js';
    script2.onload = initFirebase;
    document.head.appendChild(script2);
  };
  document.head.appendChild(script1);

  // Event listeners
  document.getElementById('add-list-btn').onclick = () => {
    const name = document.getElementById('new-list-name').value.trim();
    if (name) {
      addList(name);
      document.getElementById('new-list-name').value = '';
    }
  };

  document.getElementById('lists-select').onchange = (e) => {
    state.currentListId = e.target.value;
    renderEverything();
  };

  document.getElementById('add-item-form').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('item-name').value.trim();
    if (name) {
      addItemToCurrentList(name);
      document.getElementById('item-name').value = '';
    }
  };
});
