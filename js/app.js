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

  // Determine visibility for create button
  const createButtonContainer = document.getElementById('createEntityButtonContainer');
  createButtonContainer.style.display = entity === 'home' ? 'none' : 'block'; // Hide on home page

  // Determine visibility for auto assign button
  const autoAssignButtonContainer = document.getElementById('autoAssignEntityButtonContainer');
  autoAssignButtonContainer.style.display = 'none';

  if (entity === 'proposals') {
    autoAssignButtonContainer.style.display = 'block';
  }

  // Grab the appropriate entity section
  const entitySection = document.getElementById(`${entity}Section`);
  if (entitySection) {
    // Display the entity section
    entitySection.style.display = 'block';
    // Fetch data for the entity if required
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
  if (entity === 'professors') {
    headers = headers.filter(header => header !== 'proposals');
    headers.push('Proposals'); // Add Proposals as the last header before Actions for professors
  }
  headers.push('Actions'); // Actions header should be last

  const thead = `<thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${data.map(item => {
    const rowCells = headers.map(header => {
      if (header === 'Proposals' && entity === 'professors') {
        // Return a tick or cross depending on whether proposals are present
        return `<td>${item.proposals && item.proposals.length > 0 ? '✔️' : '❌'}</td>`;
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
  // Check if the entity is a professor and has proposals
  if (entity === 'professors' && data.proposals && data.proposals.length > 0) {
    // Construct the detailed information for the professor's proposals
    const proposalDetails = data.proposals.map(proposal => {
      return `
        <h3>Proposal ID: ${proposal.id}</h3>
        <p>Title: ${proposal.title}</p>
        <p>Description: ${proposal.description}</p>
        <p>Company Name: ${proposal.companyName}</p>
        <p>Course: ${proposal.course}</p>
        <p>Student Number: ${proposal.studentNumber}</p>
        <p>Candidature ID: ${proposal.candidature_id}</p>
      `;
    }).join('');

    // Display the details in the entityInfoContainer
    const infoContainer = document.getElementById('entityInfoContainer');
    infoContainer.innerHTML = proposalDetails;
  } else {
    // For other entities or professors without proposals, use existing functionality
    const infoTableHtml = createEntityInfoTable(entity, data);
    const infoContainer = document.getElementById('entityInfoContainer');
    infoContainer.innerHTML = infoTableHtml;
  }

  // Append the back button to the button container
  const buttonContainer = document.getElementById('createEntityButtonContainer');
  const backButton = document.createElement('button');
  backButton.className = 'back-button';
  backButton.innerText = 'Back';
  backButton.onclick = function() {
    showEntitySection(entity);
  };
  buttonContainer.appendChild(backButton);
}





function createEntityInfoTable(entity, data) {
  let headers;
  let values;

  if (entity === 'professors' && data.proposals && data.proposals.length > 0) {
    // Assuming data.proposals is an array of proposal objects
    headers = ['Name', 'Email', 'Title', 'Description', 'Company Name', 'Course', 'Student Number', 'Candidature ID'];
    // Flatten the proposals into string for display purposes
    values = data.proposals.map(proposal => [
      data.name,
      data.email,
      proposal.title,
      proposal.description,
      proposal.companyName,
      proposal.course,
      proposal.studentNumber,
      proposal.candidature_id // Assuming this is the ID and is directly accessible
    ]);
  } else {
    // If not a professor or no proposals, display normal info
    headers = Object.keys(data);
    values = [Object.values(data)];
  }

  // Generate the HTML for the table header
  const thead = `<thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr></thead>`;

  // Generate the HTML for the table body
  const tbody = `
    <tbody>
      ${values.map(row => `<tr>${row.map(value => `<td>${value !== null ? value : ''}</td>`).join('')}</tr>`).join('')}
    </tbody>
  `;

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
    // Professor form fields including all fields necessary to create a proposal
    formFieldsHtml = `
      <input type="text" name="name" placeholder="Professor Name">
      <input type="text" name="email" placeholder="Professor Email">
      <div id="proposalFieldsContainer">
        <div class="singleProposalFields">
          <input type="text" name="title[]" placeholder="Proposal Title">
          <input type="text" name="description[]" placeholder="Proposal Description">
          <input type="text" name="companyName[]" placeholder="Company Name Proposal">
          <input type="text" name="course[]" placeholder="Course Proposal">
          <input type="text" name="studentNumber[]" placeholder="Student Number Proposal">
          <input type="text" name="candidature_id[]" placeholder="Candidature ID Proposal">
        </div>
      </div>
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
    <form id="createForm" onsubmit="handleSubmit(event, '${entity}')">
      ${formFieldsHtml}
      ${submitButtonHtml}
    </form>
  `;
  return formHtml;
}

function handleSubmit(event, entity) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  let newData = {
    name: formData.get('name'),
    email: formData.get('email'),
    proposals: [{
      title: formData.get('title'),
      description: formData.get('description'),
      companyName: formData.get('companyName'),
      course: formData.get('course'),
      studentNumber: formData.get('studentNumber'),
      candidature_id: parseInt(formData.get('candidature_id'), 10)
    }]
  };

  // Collect all proposal related data
  const proposalTitles = formData.getAll('title[]');
  const proposalDescriptions = formData.getAll('description[]');
  const proposalCompanyNames = formData.getAll('companyName[]');
  const proposalCourses = formData.getAll('course[]');
  const proposalStudentNumbers = formData.getAll('studentNumber[]');
  const proposalCandidatureIds = formData.getAll('candidature_id[]');

  // Create proposal objects and add to the newData.proposals array
  for (let i = 0; i < proposalTitles.length; i++) {
    let proposal = {
      title: proposalTitles[i],
      description: proposalDescriptions[i],
      companyName: proposalCompanyNames[i],
      course: proposalCourses[i],
      studentNumber: proposalStudentNumbers[i],
      candidature_id: parseInt(proposalCandidatureIds[i], 10)
    };
    // Only add proposal if the candidature ID is a number
    if (!isNaN(proposal.candidature_id)) {
      newData.proposals.push(proposal);
    }
  }

  console.log("Prepared newData for submission:", newData);
  submitCreate(entity, newData);
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
          if (/^(\d+,)*\d+$/.test(value)) {
            const proposalIds = value.split(',').map(proposalId => {
              console.log("Raw proposalId:", proposalId); // Log the raw proposal ID
              proposalId = proposalId.trim(); // Trim whitespace from the proposal ID
              console.log("Trimmed proposalId:", proposalId); // Log the trimmed proposal ID
              const parsedId = parseInt(proposalId, 10);
              console.log("Parsed proposalId:", parsedId); // Log the parsed proposal ID
              return parsedId;
            });
            console.log("Final proposalIds array:", proposalIds); // Log the final array of proposal IDs
            newData[key] = proposalIds.map(proposalId => ({ id: proposalId }));
          } else {
            console.error("Invalid input for proposals. Expected format: '1,2,3,...'");
            alert("Invalid input for proposals. Expected format: '1,2,3,...'");
            return; // Prevent the form from being submitted with invalid data
          }
        } else {
          newData[key] = value;
        }
      });
      console.log("Prepared newData for submission:", newData);
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

  // Handling for the 'professors' entity, where 'proposals' are IDs
  if (entity === 'professors' && newData.proposals) {
    const proposalIds = newData.proposals.split(',').map(proposalId => ({ id: parseInt(proposalId.trim(), 10) }));
    newData.proposals = proposalIds.filter(proposal => !isNaN(proposal.id)); // Filter out any NaN values
  }

  // Handling for creating a single 'proposal', assuming this is the correct structure
  if (entity === 'proposals') {
    const proposalsData = [{
      title: newData.title,
      description: newData.description,
      companyName: newData.companyName,
      course: newData.course,
      studentNumber: newData.studentNumber,
      candidature_id: parseInt(newData.candidature_id, 10)
    }];

    // Ensure candidature_id is a number
    if (isNaN(proposalsData[0].candidature_id)) {
      console.error('Invalid candidature_id:', newData.candidature_id);
      return; // Exit without submitting
    }

    newData = proposalsData[0]; // Set newData to the structured proposal object
  }

  console.log("Final newData to submit:", JSON.stringify(newData));

  // Make the POST request to create a new entity
  fetch(`http://localhost:8180/${entity}`, {
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
      ListAll(entity);
    })
    .catch(error => {
      console.error('Creation error:', error);
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










