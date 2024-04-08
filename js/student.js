// Mock student data
const students = [
  { name: "Alice Johnson", university: "State University", major: "Computer Science", status: "Enrolled" },
  { name: "Bob Smith", university: "Tech Institute", major: "Information Technology", status: "Graduated" },
  // Add more student objects here
];

// Function to populate the table with student data
function populateTable() {
  const tableBody = document.querySelector('#student-applications tbody');
  students.forEach(student => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
            <td>${student.name}</td>
            <td>${student.university}</td>
            <td>${student.major}</td>
            <td>${student.status}</td>
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
