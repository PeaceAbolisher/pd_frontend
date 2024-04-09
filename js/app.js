document.addEventListener('DOMContentLoaded', function() {
  buildNavbar();
  bindFormSubmissions();
});

function buildNavbar() {
  const entities = ['students', 'professors', 'proposals', 'candidatures'];
  const navbar = document.getElementById('navbar');
  let links = entities.map(entity =>
    `<a href="#" onclick="showEntitySection('${entity}', true)">${entity.charAt(0).toUpperCase() + entity.slice(1)}</a>`
  ).join('');
  navbar.innerHTML = `
    <div class="dropdown">
      <button class="dropbtn">Entities</button>
      <div class="dropdown-content">${links}</div>
    </div>
  `;
}
function showEntitySection(entity, fetchData = false) {
  document.querySelectorAll('.entity-section').forEach(section => section.style.display = 'none');
  const entitySection = document.getElementById(`${entity}Section`);
  if (entitySection) {
    entitySection.style.display = 'block';
    // Fetch data only if fetchData is true, which is only set when clicking the Students link
    if (fetchData && entity === 'students'  || fetchData && entity === 'professors' || fetchData && entity === 'proposals' || fetchData && entity === 'candidatures') {
      ListAll(entity);
    }
  }
}
function bindFormSubmissions() {
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      const entity = event.target.id.replace('add', '').replace('Form', '').toLowerCase();
      fetchEntityData(entity);
    });
  });
}

function ListAll(entity) {
  console.log(`Fetching data for ${entity}...`);
  fetch(`http://localhost:8180/${entity}`)
    .then(response => response.ok ? response.json() : Promise.reject(`HTTP status ${response.status}`))
    .then(data => renderEntityList(entity, data))
    .catch(error => console.error(`Error fetching ${entity}:`, error));
}

function renderEntityList(entity, data) {
  const entityList = document.getElementById(`${entity}Section`);
  console.log(entityList); // Log the element to see if it is found
  if (!entityList) {
    console.error(`Element with ID ${entity}List not found.`);
    return; // Exit the function if the element isn't found
  }
  entityList.innerHTML = data && data.length > 0 ? createEntityTable(data) : 'No data found.';
}


function createEntityTable(data) {
  // Creating table headers based on entity data keys
  const headers = Object.keys(data[0]);
  const thead = `<thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}<th>Actions</th></tr></thead>`;
  const tbody = `<tbody>${data.map(item =>
    `<tr>${Object.values(item).map(value => {
      return `<td>${value !== null ? value : ''}</td>`; // Check for null values
    }).join('')}` +
    `<td>
      <button class="action-button update" onclick="updateEntity(${item.id})">Update</button>
      <button class="action-button delete" onclick="deleteEntity(${item.id})">Delete</button>
    </td></tr>`
  ).join('')}</tbody>`;
  return `<div class="table-container"><table class="entity-table">${thead}${tbody}</table></div>`;
}

// Function to handle the Update action
function updateEntity(id) {
  console.log(`Update entity with id: ${id}`);
  // Add your update logic here
}

// Function to handle the Delete action
function deleteEntity(id) {
  console.log(`Delete entity with id: ${id}`);
  // Add your delete logic here
}

