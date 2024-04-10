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
  document.querySelectorAll('.entity-section').forEach(section => {
    section.style.display = 'none';
  });

  const formContainer = document.getElementById('formContainer');
  if (hideForm) {
    formContainer.style.display = 'none';
  }

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
  entityList.innerHTML = data && data.length > 0 ? createEntityTable(entity,data) : 'No data found.';
}


function createEntityTable(entity,data) {
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
    </td></tr>`
  ).join('')}</tbody>`;
  return `<div class="table-container"><table class="entity-table">${thead}${tbody}</table></div>`;
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
        <input type="number" id="studentNumber" name="number" placeholder="Number">
        <input type="email" id="studentEmail" name="email" placeholder="Email">
        <input type="text" id="studentCourse" name="course" placeholder="Course">
        <input type="number" id="studentClassification" name="classification" placeholder="Classification">
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
    });

}

