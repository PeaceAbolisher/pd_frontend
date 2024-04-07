// update viewing element
document.addEventListener('DOMContentLoaded', function() {
  fetch('http://localhost:50000/hello')
    .then(response => response.text())
    .then(text => document.getElementById('data-view').textContent = text)
    .catch(error => document.getElementById('data-view').textContent = 'Error loading data: ' + error);

});
