// Sample data for internship proposals
const proposals = [
  { title: "Web Development Internship", company: "Tech Co.", location: "New York", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { title: "Marketing Internship", company: "Marketing Inc.", location: "San Francisco", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { title: "Graphic Design Internship", company: "Design Studio", location: "Los Angeles", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." }
];

// Function to display internship proposals
function displayProposals() {
  const proposalList = document.getElementById('proposal-list');

  proposals.forEach(proposal => {
    const proposalDiv = document.createElement('div');
    proposalDiv.classList.add('proposal');

    proposalDiv.innerHTML = `
            <h2>${proposal.title}</h2>
            <p><strong>Company:</strong> ${proposal.company}</p>
            <p><strong>Location:</strong> ${proposal.location}</p>
            <p>${proposal.description}</p>
            <button class="apply-btn" onclick="apply('${proposal.title}')">Apply</button>
        `;

    proposalList.appendChild(proposalDiv);
  });
}

// Function to simulate applying for an internship
function apply(title) {
  alert(`Applied for ${title}!`);
}

// Display proposals when the page loads
window.onload = displayProposals;

function fetchMessage() {
  fetch('http://localhost:8180/hello')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.text();
    })
    .then(text => {
      document.getElementById('dynamic-content').textContent = text;
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
}

// Display proposals and fetch message when the page loads
window.onload = function() {
  displayProposals();
  fetchMessage();
};
