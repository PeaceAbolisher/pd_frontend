let lastActiveEntitySection = ''; // This will keep track of the last active entity section

document.addEventListener('DOMContentLoaded', function() {
  buildNavbar();
  bindFormSubmissions();
  document.getElementById('autoAssignEntityButtonContainer').style.display = 'none';
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
  lastActiveEntitySection = `${entity}Section`;
  // Hide all entity sections and clear previously shown entity info
  document.querySelectorAll('.entity-section').forEach(section => section.style.display = 'none');
  document.getElementById('entityInfoContainer').innerHTML = '';

  // Hide form and manage button visibility
  document.getElementById('formContainer').style.display = hideForm ? 'none' : 'block';
  document.getElementById('createEntityButtonContainer').style.display = entity === 'home' ? 'none' : 'block';
  document.getElementById('autoAssignEntityButtonContainer').style.display = entity === 'proposals' ? 'block' : 'none';

  // Hide the Back button as we're in a main section
  hideBackButton();

  // Display the current entity section and fetch data if needed
  const entitySection = document.getElementById(`${entity}Section`);
  if (entitySection) {
    entitySection.style.display = 'block';
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
  // Creating table headers based on entity data keys, excluding proposals for professors
  let headers = Object.keys(data[0]);
  if (entity === 'students') {
    headers.push('Candidature');
  }else if (entity === 'professors') {
    headers = headers.filter(header => header !== 'proposals');
    headers.push('Number of Proposals'); // Add 'Number of Proposals' as the last header for professors
  }
  headers.push('Actions'); // Actions header should be last

  const thead = `<thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${data.map(item => {
    const rowCells = headers.map(header => {
      if (entity === 'students' && header === 'Candidature') {
        // Display a tick or cross based on whether the student has a candidature
        return `<td>${item.candidature ? '✔️' : '❌'}</td>`;
      }else if (header === 'Number of Proposals') {
        // Show the number of proposals instead of tick or cross
        return `<td>${item.proposals ? item.proposals.length : 0}</td>`;
      } else if (header !== 'Actions') {
        // Return the normal data cell
        return `<td>${item[header] !== null ? item[header] : ''}</td>`;
      }
      return ''; // Skip cell creation for 'Actions' header, as it will be added separately
    }).join('');

    const actionButtons = `
  <td>
    <button class="action-button update" onclick="updateEntity('${entity}', ${item.id})">Update</button>
    <button class="action-button delete" onclick="deleteEntity('${entity}', ${item.id})">Delete</button>
    <button class="action-button view" onclick="fetchEntityInfo('${entity}', ${item.id})">More Info</button>
  </td>
`;

    return `<tr>${rowCells}${actionButtons}</tr>`;
  }).join('')}</tbody>`;
  return `<div class="table-container"><table class="entity-table">${thead}${tbody}</table></div>`;
}


function fetchEntityInfo(entity, id) {
  const entityList = document.getElementById(`${entity}Section`);
  entityList.style.display = 'none'; // Hide entity list

  const formContainer = document.getElementById('formContainer');
  formContainer.style.display = 'none'; // Hide forms

  document.getElementById('createEntityButtonContainer').style.display = 'none';
  document.getElementById('autoAssignEntityButtonContainer').style.display = 'none';

  // Make the fetch call
  fetch(`http://localhost:8180/${entity}/${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      displayEntityInfo(entity, data); // Display detailed information about the entity
      showBackButton(entity); // Make sure the back button is shown and properly configured
    })
    .catch(error => {
      console.error('Error fetching entity info:', error);
      alert('Failed to fetch details: ' + error.message);
    });
}





function displayEntityInfo(entity, data) {
  const infoContainer = document.getElementById('entityInfoContainer');
  infoContainer.innerHTML = ''; // Clear previous info

  // Construct a table to display all data fields dynamically
  let htmlContent = `<h3>Details for ${entity.charAt(0).toUpperCase() + entity.slice(1)}</h3>`;
  htmlContent += '<table class="entity-info-table">';

  // Create table rows for each key in the data object
  Object.keys(data).forEach(key => {
    const value = data[key] === null ? '' : data[key];
    htmlContent += `
      <tr>
        <th>${key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}</th>
        <td>${value}</td>
      </tr>
    `;
  });

  htmlContent += '</table>';

  infoContainer.innerHTML = htmlContent;
}




function showBackButton(entity) {
  const backButton = document.getElementById('backButton');
  backButton.onclick = function() { showEntitySection(entity); }; // Set the onclick event to the appropriate handler
  document.getElementById('backButtonContainer').style.display = 'block'; // Show the Back button
}

function hideBackButton() {
  document.getElementById('backButtonContainer').style.display = 'none'; // Hide the Back button
}

function updateEntity(entity, id) {
  console.log(`Update entity with id: ${id}`);

  // Hide all entity sections
  document.querySelectorAll('.entity-section').forEach(section => {
    section.style.display = 'none';
  });

  // Hide the entity list
  const entityListSection = document.getElementById(`${entity}Section`);
  if (entityListSection) {
    entityListSection.style.display = 'none';
  }

  // Hide the Create button
  const createButtonContainer = document.getElementById('createEntityButtonContainer');
  if (createButtonContainer) {
    createButtonContainer.style.display = 'none';
  }
  document.getElementById('autoAssignEntityButtonContainer').style.display = 'none';


  // Show the Back button
  const backButtonContainer = document.getElementById('backButtonContainer');
  if (backButtonContainer) {
    backButtonContainer.style.display = 'block';
  }

  // Show and populate the update form
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
      // Assuming there is no content in the response on successful deletion
      return response.text(); // or response.json() if your API returns a JSON response
    })
    .then(() => {
      alert(`Deleted Successfully!`);
      ListAll(entity); // Refresh the entity list after deletion
      hideBackButton(); // Ensure the back button is hidden if we're back at the list view
    })
    .catch(error => {
      alert(`Error Deleting: ${error.message}`);
      console.error(`Error Deleting ${entity}:`, error);
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
        <input type="text" id="studentNumber" name="studentNumber" placeholder="Student Number">
        <input type="text" id="studentName" name="name" placeholder="Name">
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
        <input type="text" id="professorProposalsId" name="proposals" placeholder="Proposal Id">
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
        <button type="submit">OK</button>
      </form>
    `;
  }
  if (entity === 'candidatures') {
    return `
      <form id="updateCandidatureForm">
        <input type="text" id="candidatureStudent" name="studentId" placeholder="Student ID">
        <input type="text" id="candidatureProposal" name="proposalId" placeholder="Proposal ID">
        <div class="assignment-section">
          <label class="assignment-label">Used in Assignment</label>
          <div class="radio-option">
            <label class="radio-label" for="usedInAssignmentYes">Yes</label>
            <input type="radio" id="usedInAssignmentYes" name="usedInAssignment" value="Yes" checked>
          </div>
          <div class="radio-option">
            <label class="radio-label" for="usedInAssignmentNo">No</label>
            <input type="radio" id="usedInAssignmentNo" name="usedInAssignment" value="No">
          </div>
        </div>
        <button type="submit">OK</button>
      </form>
    `;
  }

}

function populateFormFields(entity, data) {
  // Assume data comes in with the keys as they are named in the HTML form
  const form = document.getElementById('updateForm');
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const element = form.elements.namedItem(key);
      if (element) {
        element.value = data[key] || '';
      }
    }
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
        email: updatedData.email,
        proposalsIds: Array.isArray(updatedData.proposalsIds) ? updatedData.proposalsIds : []
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
        studentId: updatedData.studentId,
        proposalId: updatedData.proposalId
      };
    }
    submitUpdate(entity, id, updatedData);
  });
}

function submitUpdate(entity, id, updatedData) {
  console.log(`Updating entity with ID: ${id}`, 'Data:', updatedData);

  // Create a FormData object and append the data to it
  const formData = new FormData();
  for (const key in updatedData) {
    formData.append(key, updatedData[key]);
  }

  // Make the PUT request with the FormData
  fetch(`http://localhost:8180/${entity}/${id}`, {
    method: 'PUT',
    body: formData,
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error Updating: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Entity updated:', data);
      ListAll(entity); // Refresh the list of entities
      goBack();
      // The function goBack() might need to be called here if you want to return to the previous screen
    })
    .catch(error => {
      console.error('Update error:', error);
    });
}







function showCreateEntityForm() {
  // Find the currently active entity section
  const currentSection = document.querySelector('.entity-section:not([style*="display: none"])');

  if (currentSection) {
    lastActiveEntitySection = currentSection.id; // Store the current section id
    const entity = currentSection.id.replace('Section', '');

    // Hide the current entity list and any displayed entity information
    currentSection.style.display = 'none';
    document.getElementById('entityInfoContainer').style.display = 'none';

    // Display the form for the selected entity
    displayCreateForm(entity);
  } else {
    alert('Please select an entity section first.');
  }
}

function displayCreateForm(entity) {
  const formContainer = document.getElementById('formContainer');

  // Hide all entity sections to ensure the form is the only visible UI component
  document.querySelectorAll('.entity-section').forEach(section => section.style.display = 'none');

  // Generate and display the form HTML
  formContainer.innerHTML = getCreateFormHtmlForEntity(entity);
  formContainer.style.display = 'block';  // Make the form visible

  // Hide other UI components that should not be visible when creating a new entity
  document.getElementById('createEntityButtonContainer').style.display = 'none';
  document.getElementById('autoAssignEntityButtonContainer').style.display = 'none';
  document.getElementById('backButtonContainer').style.display = 'block';  // Show back button to allow user to cancel
}
function goBack() {
  // Hide the form container
  document.getElementById('formContainer').style.display = 'none';

  // Show the last active entity section before the form was opened
  if (lastActiveEntitySection) {
    document.getElementById(lastActiveEntitySection).style.display = 'block';
    document.getElementById('createEntityButtonContainer').style.display = 'block';

    if (lastActiveEntitySection === 'proposalsSection') {
      document.getElementById('autoAssignEntityButtonContainer').style.display = 'block';
    }
    hideBackButton(); // Hide the back button since we are now in the main section
  } else {
    document.getElementById('studentsSection').style.display = 'block'; // Default entity section
    hideBackButton(); // Hide the back button since we are now in the main section
  }

  // Refresh the list if data might be stale
  const entity = lastActiveEntitySection.replace('Section', '');
  ListAll(entity);
}





function getCreateFormHtmlForEntity(entity) {
  let formFieldsHtml = '';

  if (entity === 'students') {
    formFieldsHtml += `
      <div><label for="studentNumber">Student Number:</label><input type="text" id="studentNumber" name="num" placeholder="Student Number"></div>
      <div><label for="studentName">Name:</label><input type="text" id="studentName" name="name" placeholder="Name"></div>
      <div><label for="studentEmail">Email:</label><input type="text" id="studentEmail" name="email" placeholder="Email"></div>
      <div><label for="studentCourse">Course:</label><input type="text" id="studentCourse" name="course" placeholder="Course"></div>
      <div><label for="studentClassification">Classification:</label><input type="text" id="studentClassification" name="classification" placeholder="Classification"></div>
    `;
  } else if (entity === 'professors') {
    formFieldsHtml += `
      <div><label for="professorName">Name:</label><input type="text" id="professorName" name="name" placeholder="Professor Name"></div>
      <div><label for="professorEmail">Email:</label><input type="text" id="professorEmail" name="email" placeholder="Professor Email"></div>
    `;
  } else if (entity === 'proposals') {
    formFieldsHtml += `
      <div><label for="proposalTitle">Title:</label><input type="text" id="proposalTitle" name="title" placeholder="Title"></div>
      <div><label for="proposalDescription">Description:</label><input type="text" id="proposalDescription" name="description" placeholder="Description"></div>
      <div><label for="proposalCompanyName">Company Name:</label><input type="text" id="proposalCompanyName" name="companyName" placeholder="Company Name"></div>
      <div><label for="proposalCourse">Course:</label><input type="text" id="proposalCourse" name="course" placeholder="Course"></div>
    `;
  } else if (entity === 'candidatures') {
    formFieldsHtml += `
      <div><label for="candidatureStudent">Student ID:</label><input type="text" id="candidatureStudent" name="student" placeholder="Student ID"></div>
      <div><label for="candidatureProposal">Proposal ID:</label><input type="text" id="candidatureProposal" name="proposal" placeholder="Proposal ID"></div>
    `;
  }

  const submitButtonHtml = `
    <div class="form-button-container">
      <button type="submit">Create</button>
    </div>
  `;
  const formHtml = `
    <form id="createForm" onsubmit="handleSubmit(event, '${entity}')">
      ${formFieldsHtml}
      ${submitButtonHtml}
    </form>
  `;
  return formHtml;
}

function handleSubmit(event, entity) {
  event.preventDefault();
  const formData = new FormData(event.target);

  if (entity === 'candidatures') {
    // Retrieve student ID input and replace 'student' with 'studentId'
    const studentId = formData.get('student');
    formData.delete('student');
    formData.append('studentId', studentId.trim());

    // Retrieve proposal ID input and replace 'proposal' with 'proposalsIds'
    const proposalIds = formData.get('proposal').split(',').map(s => s.trim()).filter(Boolean);
    formData.delete('proposal');
    proposalIds.forEach(id => {
      formData.append('proposalsIds', id);
    });
  }

  submitCreate(entity, formData);
}

function submitCreate(entity, formData) {
  console.log(formData)
  // Make the fetch request using FormData
  fetch(`http://localhost:8180/${entity}`, {
    method: 'POST',
    body: formData,
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(error => Promise.reject(error));
      }
      return response.json();
    })
    .then(data => {
      console.log('Entity created:', data);
      ListAll(entity); // Update the list of entities
      goBack();
    })
    .catch(error => {
      const errorInfo = {
        message: error.message,
        stack: error.stack, // Be careful with logging stack traces in production environments
      };
      console.error('Creation error:', JSON.stringify(errorInfo));
    });

}


function showAutoAssignEntityForm() {
  fetch('http://localhost:8180/proposals/assign', { // Adjust the fetch URL to the correct endpoint
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }
      return response.text(); // Since you expect a text response, use response.text() instead of response.json()
    })
    .then(message => {
      alert(message); // Display the message from the response
    })
    .catch(error => {
      console.error('Error during auto assignment:', error);
      alert('Error during auto assignment: ' + error.message);
    });
}










