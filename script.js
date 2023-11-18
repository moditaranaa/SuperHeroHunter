// Constants for Marvel API authentication
const publicKey = 'baefddac52774132baab0d2e48e6b25c';
const privateKey = '0b8bbef08ca173ac77bd8ae1402590c017280a36';
const baseURL = 'https://gateway.marvel.com:443/v1/public/characters';

// Function to generate the MD5 hash
function generateHash(timestamp) {
  const hash = CryptoJS.MD5(`${timestamp}${privateKey}${publicKey}`).toString();
  return hash;
}

// Function to fetch superheroes from Marvel API
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

// Superhero Display Function Starts Here
function displaySuperheroes(superheroes) {

  // Fetching the conatiner where the card is to be appeneded
  const container = document.getElementById('superheroesContainer');
  container.innerHTML = '';

  // Applying forEach loop here to create card for each character.
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

      // This will add all cards to the container and will display cards.
    container.appendChild(card);
  });
};

// --------------------------Fetch and display characters at home page ends here---------------------------------------------//


// --------------------------Superhero character page code starts here-------------------------------------------------------//

// Function to navigate to the Character Details Page with the selected superhero's ID
function navigateToCharacterDetails(superheroId) {
  // Redirect to the Character Details Page with the superhero ID as a query parameter
  window.location.href = `character.html?id=${superheroId}`;
}

// Function to fetch superhero details by ID from Marvel API
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
    return data.data.results[0]; // Get the first result (should be the superhero)
  } catch (error) {
    console.error('Error fetching superhero details:', error);
    return null;
  }
}

// Function to display superhero details on the Character Details Page
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

  // Display comics details
  comicsList.innerHTML = '';
  superhero.comics.items.forEach((comic) => {
    const listItem = document.createElement('li');
    listItem.textContent = comic.name;
    comicsList.appendChild(listItem);
  });

  // Display events details
  eventsList.innerHTML = '';
  superhero.events.items.forEach((event) => {
    const listItem = document.createElement('li');
    listItem.textContent = event.name;
    eventsList.appendChild(listItem);
  });

  // Display stories details
  storiesList.innerHTML = '';
  superhero.stories.items.forEach((story) => {
    const listItem = document.createElement('li');
    listItem.textContent = story.name;
    storiesList.appendChild(listItem);
  });
}

// Function to initialize the Character Details Page
function initializeCharacterPage() {
  // Get the superhero ID from the query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const superheroId = urlParams.get('id');

  // Fetch superhero details by ID and display them
  fetchSuperheroDetails(superheroId).then((superhero) => {
    if (superhero) {
      displaySuperheroDetails(superhero);
    } else {
      
    }
  });
}

// Character page first initialiazation when page loads.
initializeCharacterPage();

// --------------------------Superhero character page code ends here-------------------------------------------------------//


// --------------------------Favourites feature Code Starts Here------------------------------------------------------------//

// Function to add a superhero to favorites
function addToFavorites(id, name, image) {
  let existing = JSON.parse(localStorage.getItem('favoriteSuperheroes')) || {};

  // If the superhero is not in favorites, add it
  if (!existing[id]) {
    existing[id] = { name: name, image: image };

    // Save back to localStorage
    localStorage.setItem('favoriteSuperheroes', JSON.stringify(existing));

    // Change the heart icon color to red
    const heartIcon = document.getElementById(`heartIcon${id}`);
    if (heartIcon) {
      heartIcon.classList.add('text-danger');
    }

    // Display a notification that the superhero is added to favorites
    alert(`${name} is added to your favorites!`);
  } else {
    // If the superhero is already in favorites, display a message
    alert(`${name} is already in your favorites!`);
  }

  // Refresh the favorites display after adding a superhero
  displayFavorites();
}





// Function to display favorite superheroes on the Favorites page
function displayFavorites() {
  // Featching favourites container on favourite page
  const container = document.getElementById('favoritesContainer');
  container.innerHTML = '';

  // Getting the existing favorite superheroes data from local storage
  let favorites = JSON.parse(localStorage.getItem('favoriteSuperheroes'));

  // Checking if there are favorite superheroes in local storage
  if (favorites) {
    // Iterating over the favorite superheroes and create cards for each
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
    // If there are no favorite superheroes in local storage, display a message
    container.innerHTML = '<p>No favorite superheroes found.</p>';
  }
}


// Function to remove a superhero from favorites
function removeFromFavorites(id) {
  let favorites = localStorage.getItem('favoriteSuperheroes');
  if (!favorites) return;
  favorites = JSON.parse(favorites);

  // Removing the superhero data from the favorites object here
  delete favorites[id];

  // Saving the updated favorites back to localStorage
  localStorage.setItem('favoriteSuperheroes', JSON.stringify(favorites));

  // Refresh the favorites display
  displayFavorites();
}



// --------------------------Favourites feature Code Ends Here------------------------------------------------------------//



// ----------------------------------------Function to initialize the app starts here--------------------------------------------------//
function initializeApp() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    fetchSuperheroes(query).then((superheroes) => {
      displaySuperheroes(superheroes);
    });
  });

  
  // Initial fetch of superheroes
  fetchSuperheroes().then((superheroes) => {
    displaySuperheroes(superheroes);
  });
};

// Initiliazation function for the website.
initializeApp();

// ----------------------------------------Function to initialize the app ends here--------------------------------------------------//


