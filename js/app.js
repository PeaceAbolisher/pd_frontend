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
function showEntitySection(entity, fetchData = false, hideForm = true) {
  // Hide all entity sections
  document.querySelectorAll('.entity-section').forEach(section => {
    section.style.display = 'none';
  });

  // Hide the table and the entity info container
  const entityList = document.getElementById(`${entity}Section`);
  entityList.style.display = 'none';
  const entityInfoContainer = document.getElementById('entityInfoContainer');
  entityInfoContainer.innerHTML = ''; // Clear the entity info table when switching entities

  // Hide form container by default
  const formContainer = document.getElementById('formContainer');
  if (hideForm) {
    formContainer.style.display = 'none';
  }
  // Hide create button by default
  const createButtonContainer = document.getElementById('createEntityButtonContainer');
  createButtonContainer.style.display = 'none';

  // Grab the appropriate entity section
  const entitySection = document.getElementById(`${entity}Section`);
  if (entitySection) {
    // Display the entity section
    entitySection.style.display = 'block';
    // Display the create button container when an entity section is active
    createButtonContainer.style.display = 'block';
    if (fetchData) {
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
  entityList.innerHTML = data && data.length > 0 ? createEntityTable(entity, data) : 'No data found.';
}


function createEntityTable(entity, data) {
  // Creating table headers based on entity data keys
  const headers = Object.keys(data[0]);
  const thead = `<thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}<th>Actions</th></tr></thead>`;
  const tbody = `<tbody>${data.map(item =>
    `<tr>${Object.values(item).map(value => {
      return `<td>${value !== null ? value : ''}</td>`;
    }).join('')}` +
    `<td>
      <button class="action-button update" onclick="updateEntity('${entity}', ${item.id})">Update</button>
      <button class="action-button delete" onclick="deleteEntity('${entity}', ${item.id})">Delete</button>
      <button class="action-button view" onclick="fetchEntityInfo('${entity}', ${item.id})">More Info</button>
    </td></tr>`
  ).join('')}</tbody>`;
  return `<div class="table-container"><table class="entity-table">${thead}${tbody}</table></div>`;
}

function fetchEntityInfo(entity, id) {
  // Hide the table
  const entityList = document.getElementById(`${entity}Section`);
  entityList.style.display = 'none';
  const formContainer = document.getElementById('formContainer');
  formContainer.style.display = 'none';

  fetch(`http://localhost:8180/${entity}/${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error fetching ${entity} info: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      displayEntityInfo(entity, data);
    })
    .catch(error => {
      console.error(`Error fetching ${entity} info:`, error);
      alert(`Error fetching ${entity} info: ${error.message}`);
    });
}

function displayEntityInfo(entity, data) {
  const infoTableHtml = createEntityInfoTable(entity, data);
  const infoContainer = document.getElementById('entityInfoContainer'); // Assuming you have a container element to display the info
  infoContainer.innerHTML = infoTableHtml;

  // Hide the create button container
  const createButtonContainer = document.getElementById('createEntityButtonContainer');
  createButtonContainer.style.display = 'none';
}


function createEntityInfoTable(entity, data) {
  // Creating table headers based on entity data keys
  const headers = Object.keys(data);
  const thead = `<thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody><tr>${Object.values(data).map(value => `<td>${value !== null ? value : ''}</td>`).join('')}</tr></tbody>`;
  return `<div class="table-container"><table class="entity-info-table">${thead}${tbody}</table></div>`;
}



function updateEntity(entity, id) {
  console.log(`Update entity with id: ${id}`);
  showEntitySection(entity, false, false);
  displayUpdateForm(entity, id);
}


function deleteEntity(entity, id) {
  console.log(`Delete ${entity} with id: ${id}`);
  fetch(`http://localhost:8180/${entity}/${id}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error deleting ${entity}: ${response.statusText}`);
      }
      // Check if the response has content before trying to parse it as JSON
      if(response.status === 204 || response.statusText === 'No Content') {
        return {}; // No content
      } else {
        return response.json(); // Parse JSON content
      }
    })
    .then(data => {
      alert(`Deleted Successfully!`);
      ListAll(entity); // Refresh the entity list after deletion
    })
    .catch(error => {
      alert(`Error Deleting`);
    });
}




function displayUpdateForm(entity, id) {
  const formHtml = getFormHtmlForEntity(entity);
  const formContainer = document.getElementById('formContainer');
  formContainer.innerHTML = formHtml; // populate with the form HTML
  formContainer.style.display = 'block'; // make sure to make it visible
  fetch(`http://localhost:8180/${entity}/${id}`)
    .then(response => response.json())
    .then(data => populateFormFields(entity, data))
    .catch(error => console.error(`Error fetching ${entity} data:`, error));
  bindUpdateFormSubmission(entity, id);
}

function getFormHtmlForEntity(entity) {
  if (entity === 'students') {
    return `
      <form id="updateForm">
        <input type="text" id="studentName" name="name" placeholder="Name">
        <input type="text" id="studentNumber" name="number" placeholder="Number">
        <input type="text" id="studentEmail" name="email" placeholder="Email">
        <input type="text" id="studentCourse" name="course" placeholder="Course">
        <input type="text" id="studentClassification" name="classification" placeholder="Classification">
        <button type="submit">OK</button>
      </form>
    `;
  }
  if (entity === 'professors') {
    return `
      <form id="updateForm">
        <input type="text" id="professorName" name="name" placeholder="Name">
        <input type="text" id="professorEmail" name="email" placeholder="Email">
        <input type="text" id="professorProposals" name="proposals" placeholder="Proposals">
        <button type="submit">OK</button>
      </form>
    `;
  }
  if (entity === 'proposals') {
    return `
      <form id="updateForm">
        <input type="text" id="proposalTitle" name="title" placeholder="Tile">
        <input type="text" id="proposalDescription" name="description" placeholder="Description">
        <input type="text" id="proposalCompanyName" name="companyName" placeholder="Company Name">
        <input type="text" id="proposalCourse" name="course" placeholder="Course">
        <input type="text" id="proposalStudentNumber" name="studentNumber" placeholder="Student Number">
        <input type="text" id="proposalCandidature" name="candidature" placeholder="Candidature ID">
        <input type="text" id="proposalProfessor" name="professor" placeholder="Professor ID">
        <button type="submit">OK</button>
      </form>
    `;
  }
  if (entity === 'candidatures') {
    return `
      <form id="updateCandidatureForm">
        <input type="text" id="candidatureStudent" name="student" placeholder="Student ID">
        <input type="text" id="candidatureProposal" name="proposal" placeholder="Proposal ID">
        <button type="submit">OK</button>
      </form>
    `;
  }
}

function populateFormFields(entity, data) {
  if (entity === 'students') {
    document.getElementById('studentName').value = data.name || '';
    document.getElementById('studentNumber').value = data.number || '';
    document.getElementById('studentEmail').value = data.email || '';
    document.getElementById('studentCourse').value = data.course || '';
    document.getElementById('studentClassification').value = data.classification || '';
  }
  if (entity === 'professors') {
    document.getElementById('professorName').value = data.name || '';
    document.getElementById('professorEmail').value = data.email || '';
    document.getElementById('professorProposals').value = data.proposals || '';
  }
  if (entity === 'proposals') {
    document.getElementById('proposalTitle').value = data.title || '';
    document.getElementById('proposalDescription').value = data.description || '';
    document.getElementById('proposalCompanyName').value = data.companyName || '';
    document.getElementById('proposalCourse').value = data.course || '';
    document.getElementById('proposalStudentNumber').value = data.studentNumber || '';
    document.getElementById('proposalCandidature').value = data.candidature ? data.candidature.id : '';
    document.getElementById('proposalProfessor').value = data.professor ? data.professor.id : '';
  }
  if (entity === 'candidatures') {
    // TO DO
  }
}

function bindUpdateFormSubmission(entity, id) {
  const updateForm = document.getElementById('updateForm');
  updateForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(updateForm);
    let updatedData = Object.fromEntries(formData);


    if (entity === 'students') {
      updatedData = {
        num: updatedData.studentNumber,
        name: updatedData.name,
        email: updatedData.email,
        course: updatedData.course,
        classification: parseFloat(updatedData.classification)
      };
    }
    if (entity === 'professors') {
      updatedData = {
        name: updatedData.name,
        email: updatedData.email
      };
    }
    if (entity === 'proposals') {
      updatedData = {
        title: updatedData.title,
        description: updatedData.description,
        companyName: updatedData.companyName,
        course: updatedData.course,
        studentNumber: updatedData.studentNumber,
        candidature: updatedData.candidature ? { id: updatedData.candidature } : null,
        professor: updatedData.professor ? { id: updatedData.professor } : null
      };
    }
    if (entity === 'candidatures') {       //--------->falta vero que recebe
      updatedData = {
        student: updatedData.student ? { id: updatedData.student } : null,
        proposal: updatedData.proposal ? { id: updatedData.proposal } : null
      };
    }
    submitUpdate(entity, id, updatedData);
  });
}

function submitUpdate(entity, id, updatedData) {
  console.log(entity, id, JSON.stringify(updatedData));
  fetch(`http://localhost:8180/${entity}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedData),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error Updating: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      alert('Updated Successfully!');
      // After successfully updating, refresh the list and hide the form
      showEntitySection(entity, true, true);
    })
    .catch(error => {
      alert('Error Updating!');
    }
  );
}

function showCreateEntityForm() {
  // Determine which entity form to show based on the active section
  const currentSection = document.querySelector('.entity-section:not([style*="display: none"])');
  if (currentSection) {
    const entity = currentSection.id.replace('Section', '');
    displayCreateForm(entity);
  } else {
    alert('Please select an entity section first.');
  }
}

function displayCreateForm(entity) {
  const formContainer = document.getElementById('formContainer');
  formContainer.innerHTML = getCreateFormHtmlForEntity(entity); // Generate the form HTML dynamically
  formContainer.style.display = 'block';
  bindCreateFormSubmission(entity);
}
function getCreateFormHtmlForEntity(entity) {
  let formFieldsHtml = '';
  if (entity === 'students') {
    formFieldsHtml = `
      <input type="text" name="name" placeholder="Name">
      <input type="text" name="num" placeholder="Student Number">
      <input type="text" name="email" placeholder="Email">
      <input type="text" name="course" placeholder="Course">
      <input type="text" name="classification" placeholder="Classification">
      <input type="text" name="candidature" placeholder="Candidature">

    `;
  } else if (entity === 'professors') {
    formFieldsHtml = `
      <input type="text" name="name" placeholder="Name">
      <input type="text" name="email" placeholder="Email">
      <input type="text" name="proposals" placeholder="Proposals">
    `;
  } else if (entity === 'proposals') {
    formFieldsHtml = `
    <input type="text" name="title" placeholder="Title">
    <input type="text" name="description" placeholder="Description">
    <input type="text" name="companyName" placeholder="Company Name">
    <input type="text" name="course" placeholder="Course">
    <input type="text" name="studentNumber" placeholder="Student Number">
    <input type="text" name="candidature" placeholder="Candidature ID">
    <input type="text" name="professor" placeholder="Professor ID">
  `;
  } else if (entity === 'candidatures') {
    formFieldsHtml = `
      <input type="text" name="student" placeholder="Student ID">
      <input type="text" name="proposal" placeholder="Proposal ID">
    `;
  }
  const submitButtonHtml = `<button type="submit">Create</button>`;
  const formHtml = `
    <form id="createForm">
      ${formFieldsHtml}
      ${submitButtonHtml}
    </form>
  `;
  return formHtml;
}

function bindCreateFormSubmission(entity) {
  const createForm = document.getElementById('createForm');
  if (createForm) {
    createForm.addEventListener('submit', function(event) {
      event.preventDefault();
      const formData = new FormData(createForm);
      const newData = {};
      formData.forEach((value, key) => {
        if (key === 'proposals') {
          // Assuming that if 'proposals' is empty, an empty array should be sent
          newData[key] = value ? JSON.parse(value) : [];
        } else {
          newData[key] = value;
        }
      });
      submitCreate(entity, newData);
    });
  }
}

function submitCreate(entity, newData) {
  console.log(entity, JSON.stringify(newData));

  // Set empty fields to null
  Object.keys(newData).forEach(key => {
    if (newData[key] === "") {
      newData[key] = null;
    }
  });

  // If proposals is present, convert it to an array of objects with 'id' key
  if (newData.proposals) {
    newData.proposals = newData.proposals.map(proposalId => ({ id: proposalId }));
  }

  console.log(newData);

  // Make the POST request to create a new professor
  fetch(`http://localhost:8180/professors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newData),
  })
    .then(response => {
      if (!response.ok) {
        // Assuming the server sends a JSON response for errors
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    })
    .then(data => {
      // Handle successful creation if needed
    })
    .catch(error => {
      // Handle errors
      console.error('Creation error:', error);
      alert(`Error creating professor: ${error.message}`);
    });
}









