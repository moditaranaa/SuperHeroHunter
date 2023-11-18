
const publicKey = 'baefddac52774132baab0d2e48e6b25c';
const privateKey = '0b8bbef08ca173ac77bd8ae1402590c017280a36';
const baseURL = 'https://gateway.marvel.com:443/v1/public/characters';
function generateHash(timestamp) {
  const hash = CryptoJS.MD5(`${timestamp}${privateKey}${publicKey}`).toString();
  return hash;
}
async function fetchSuperheroes(query) {
  const timestamp = new Date().getTime();
  const hash = generateHash(timestamp);

  const url = new URL(baseURL);
  url.searchParams.append('ts', timestamp);
  url.searchParams.append('apikey', publicKey);
  url.searchParams.append('hash', hash);

  if (query) {
    url.searchParams.append('nameStartsWith', query);
  }
  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    return data.data.results;
  } catch (error) {
    console.error('Error fetching superheroes:', error);
    return [];
  }
}

function displaySuperheroes(superheroes) {
  const container = document.getElementById('superheroesContainer');
  container.innerHTML = '';
  superheroes.forEach((superhero) => {
    const card = document.createElement('div');
    card.classList.add('col-md-4', 'mb-4');
    card.innerHTML = `
      <div class="card p-1">
        <img src="${superhero.thumbnail.path}.${superhero.thumbnail.extension}" class="card-img-top" alt="${superhero.name}">
        <div class="card-body">
          <h5 class="card-title">${superhero.name}</h5>
          <button type="button" class="btn btn-outline-primary" onclick="navigateToCharacterDetails(${superhero.id})">More Info</button>
          <i class="fa-regular fa-heart heartCard" onclick="addToFavorites(${superhero.id}, '${superhero.name}', '${superhero.thumbnail.path}.${superhero.thumbnail.extension}')"></i>
        </div>
      </div>`;
    container.appendChild(card);
  });
};

function navigateToCharacterDetails(superheroId) {
  window.location.href = `character.html?id=${superheroId}`;
}

async function fetchSuperheroDetails(superheroId) {
  const timestamp = new Date().getTime();
  const hash = generateHash(timestamp);

  const url = new URL(`${baseURL}/${superheroId}`);
  url.searchParams.append('ts', timestamp);
  url.searchParams.append('apikey', publicKey);
  url.searchParams.append('hash', hash);

  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    return data.data.results[0];
  } catch (error) {
    console.error('Error fetching superhero details:', error);
    return null;
  }
}

function displaySuperheroDetails(superhero) {
  const superheroName = document.getElementById('superheroName');
  const superheroImage = document.getElementById('superheroImage');
  const superheroBio = document.getElementById('superheroBio');
  const comicsList = document.getElementById('comicsList');
  const eventsList = document.getElementById('eventsList');
  const storiesList = document.getElementById('storiesList');

  superheroName.innerHTML = `${superhero.name}`;
  superheroImage.src = `${superhero.thumbnail.path}.${superhero.thumbnail.extension}`;
  superheroBio.textContent = superhero.description || 'No Biography Available For This Character';
  comicsList.innerHTML = '';
  superhero.comics.items.forEach((comic) => {
    const listItem = document.createElement('li');
    listItem.textContent = comic.name;
    comicsList.appendChild(listItem);
  });
  eventsList.innerHTML = '';
  superhero.events.items.forEach((event) => {
    const listItem = document.createElement('li');
    listItem.textContent = event.name;
    eventsList.appendChild(listItem);
  });
  storiesList.innerHTML = '';
  superhero.stories.items.forEach((story) => {
    const listItem = document.createElement('li');
    listItem.textContent = story.name;
    storiesList.appendChild(listItem);
  });
}

function initializeCharacterPage() {
  // Get the superhero ID from the query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const superheroId = urlParams.get('id');

  fetchSuperheroDetails(superheroId).then((superhero) => {
    if (superhero) {
      displaySuperheroDetails(superhero);
    } else {
      
    }
  });
}

initializeCharacterPage();

function addToFavorites(id, name, image) {
  let existing = JSON.parse(localStorage.getItem('favoriteSuperheroes')) || {};

  
  if (!existing[id]) {
    existing[id] = { name: name, image: image };

    localStorage.setItem('favoriteSuperheroes', JSON.stringify(existing));
    const heartIcon = document.getElementById(`heartIcon${id}`);
    if (heartIcon) {
      heartIcon.classList.add('text-danger');
    }

    alert(`${name} is added to your favorites!`);
  } else {

    alert(`${name} is already in your favorites!`);
  }

  displayFavorites();
}
function displayFavorites() {
 
  const container = document.getElementById('favoritesContainer');
  container.innerHTML = '';

 
  let favorites = JSON.parse(localStorage.getItem('favoriteSuperheroes'));
  if (favorites) {
    Object.keys(favorites).forEach((id) => {
      const superhero = favorites[id];
      const card = document.createElement('div');
      card.classList.add('col-md-4', 'mb-4');
      card.innerHTML = `
        <div class="card p-1">
          <img src="${superhero.image}" class="card-img-top" alt="${superhero.name}">
          <div class="card-body">
            <h5 class="card-title">${superhero.name}</h5>
            <button type="button" class="btn btn-outline-primary" onclick="navigateToCharacterDetails(${id})">More Info</button>
            <i id="heartIcon${id}" class="fa-regular fa-heart heartFavourite "></i>
            <i class="fas fa-trash-alt text-danger ml-2" onclick="removeFromFavorites(${id})"></i>
          </div>
        </div>`;

      container.appendChild(card);
    });
  } else {
    container.innerHTML = '<p>No favorite superheroes found.</p>';
  }
}
function removeFromFavorites(id) {
  let favorites = localStorage.getItem('favoriteSuperheroes');
  if (!favorites) return;
  favorites = JSON.parse(favorites);
  delete favorites[id];
  localStorage.setItem('favoriteSuperheroes', JSON.stringify(favorites));
  displayFavorites();
}
function initializeApp() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    fetchSuperheroes(query).then((superheroes) => {
      displaySuperheroes(superheroes);
    });
  });
  fetchSuperheroes().then((superheroes) => {
    displaySuperheroes(superheroes);
  });
};
initializeApp();

