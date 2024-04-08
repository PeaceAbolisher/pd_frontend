// Mock professor data
const professors = [
  { name: "Dr. Emily Smith", department: "Computer Science", area: "Artificial Intelligence", status: "Active" },
  { name: "Dr. John Doe", department: "Physics", area: "Quantum Mechanics", status: "On Sabbatical" },
  // Add more professor objects here
];

// Function to populate the table with professor data
function populateTable() {
  const tableBody = document.querySelector('#professor-applications tbody');
  professors.forEach(professor => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
            <td>${professor.name}</td>
            <td>${professor.department}</td>
            <td>${professor.area}</td>
            <td>${professor.status}</td>
            <td>
                <button class="view-profile">View Profile</button>
                <button class="contact">Contact</button>
            </td>
        `;
    tableBody.appendChild(tr);
  });
}

// Call populateTable on window load
window.onload = populateTable;
