// Mock student data
const students = [
  { name: "Jane Doe", university: "University A", major: "Computer Science", internship: "Web Development", status: "Pending" },
  { name: "John Smith", university: "University B", major: "Marketing", internship: "Graphic Design", status: "Approved" },
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
            <td>${student.internship}</td>
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
