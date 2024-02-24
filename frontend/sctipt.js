const fakeDatabase = {
  GPU: [
    "https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/",
    "https://www.nvidia.com/en-us/geforce/",
    "https://www.nvidia.com/en-us/gpu-cloud/",
  ],
  AI: [
    "https://www.nvidia.com/en-us/deep-learning-ai/",
    "https://www.nvidia.com/en-us/omniverse/",
  ],
  Driver: [
    "https://www.nvidia.com/en-us/drivers/",
    "https://www.nvidia.com/Download/index.aspx",
  ],
  Technology: [
    "https://www.nvidia.com/en-us/",
    "https://www.nvidia.com/en-us/technologies/",
    "https://www.nvidia.com/en-us/industries/",
  ],
  RTX: ["https://www.nvidia.com/en-us/geforce/rtx/"],
};

function search() {
  const query = document
    .getElementById("searchQuery")
    .value.trim()
    .toLowerCase();
  const resultsContainer = document.getElementById("searchResults");
  resultsContainer.innerHTML = "";

  let foundResults = false;
  Object.keys(fakeDatabase).forEach((term) => {
    if (term.toLowerCase().includes(query)) {
      foundResults = true;
      fakeDatabase[term].forEach((link) => {
        const linkElement = document.createElement("a");
        linkElement.href = link;
        linkElement.target = "_blank";
        linkElement.innerHTML = `<span class="result-title">${term}:</span> ${link}`;
        resultsContainer.appendChild(linkElement);
      });
    }
  });

  if (!foundResults) {
    resultsContainer.innerHTML = `<div class="no-results">No results found for "${query}"</div>`;
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark-theme");
  document.body.classList.toggle("light-theme");
}

function switchPage(pageId) {
  document
    .querySelectorAll(".container, .search-container")
    .forEach(function (page) {
      page.classList.remove("active");
    });
  document.getElementById(pageId).classList.add("active");
}

switchPage("searchPage");

// Example implementation for the Edit Index page
function addTerm() {
  const term = document.getElementById("newTerm").value;
  const docIds = document.getElementById("docIds").value;
  const links = document.getElementById("links").value;

  // Here you would add the term to your database
  console.log(`Adding term: ${term}, DocIDs: ${docIds}, Links: ${links}`);

  // For demonstration, just reload the terms table
  loadTerms();
}

function loadTerms() {
  // This function would fetch terms from the database and display them
  // For demonstration, let's just clear the table and add a placeholder row
  const tableBody = document
    .getElementById("termsTable")
    .getElementsByTagName("tbody")[0];
  tableBody.innerHTML = ""; // Clear existing rows

  // Add a new row as an example
  const row = tableBody.insertRow();
  row.insertCell(0).innerText = "Example Term";
  row.insertCell(1).innerText = "1, 2, 3";
  row.insertCell(2).innerHTML =
    '<a href="#">Link 1</a>, <a href="#">Link 2</a>';
  const actionsCell = row.insertCell(3);
  const editBtn = document.createElement("button");
  editBtn.innerText = "Edit";
  editBtn.className = "btn";
  editBtn.onclick = function () {
    editTerm("Example Term");
  };
  actionsCell.appendChild(editBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "Delete";
  deleteBtn.className = "btn";
  deleteBtn.onclick = function () {
    deleteTerm("Example Term");
  };
  actionsCell.appendChild(deleteBtn);
}

function editTerm(term) {
  console.log(`Editing term: ${term}`);
  // Here you would populate the form with the term's details for editing
}

function deleteTerm(term) {
  console.log(`Deleting term: ${term}`);
  // Here you would remove the term from your database
  loadTerms(); // Reload the terms list
}

// Initially load terms when the page loads
window.onload = function () {
  loadTerms();
};
