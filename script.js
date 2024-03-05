import { searchTerms } from "./test/frontEndTestFunction.js";

fakeDatabase = {
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

let currentPage = 1;
let linksPerPage = 5; // Default links per page

async function search() {
  const query = document.getElementById("searchQuery").value.trim().toUpperCase();
  const resultsContainer = document.getElementById("searchResults");
  resultsContainer.innerHTML = "";

  linksPerPage = parseInt(document.getElementById("linksPerPage").value);
  const allMatchingLinks = await searchTerms(query);
  console.log(allMatchingLinks);

  if (allMatchingLinks.length === 0) {
    resultsContainer.innerHTML = `<div class="no-results">We couldn't find any results for "${query}". Please try another search.</div>`;
    document.getElementById("pagination").innerHTML = ""; 
  } else {
    const totalPages = Math.ceil(allMatchingLinks.length / linksPerPage);
    displayPage(allMatchingLinks, currentPage, linksPerPage);
    setupPagination(totalPages);
  }
}

async function displayPage(allMatchingLinks, page, linksPerPage) {
  const start = (page - 1) * linksPerPage;
  const end = start + linksPerPage;
  const pageLinks = allMatchingLinks.slice(start, end);

  const resultsContainer = document.getElementById("searchResults");
  resultsContainer.innerHTML = "";

  
  pageLinks.forEach((doc) => {
    const linkElement = document.createElement("div"); // Use a div to contain both the title and the link
    linkElement.classList.add("search-result");

    // Create an anchor element for the link
    const anchorElement = document.createElement("a");
    anchorElement.href = doc.url;
    anchorElement.target = "_blank";
    anchorElement.textContent = doc.title;

    // Append the anchor element to the linkElement
    linkElement.appendChild(anchorElement);

    // Optionally, create and append other elements here, like a span for the occurrence number or description

    // Append the constructed element to the results container
    resultsContainer.appendChild(linkElement);
  });
}

function setupPagination(totalPages) {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageLink = document.createElement("button");
    pageLink.textContent = i;
    pageLink.onclick = function () {
      currentPage = i;
      search();
    };
    paginationContainer.appendChild(pageLink);
  }
}

// New clearSearch function
function clearSearch() {
  document.getElementById("searchQuery").value = "";
  document.getElementById("searchResults").innerHTML = "";
  document.getElementById("pagination").innerHTML = "";
  currentPage = 1;
}

function toggleTheme() {
  document.body.classList.toggle("dark-theme");
  document.body.classList.toggle("light-theme");
}

function calcStats() {
  let totalTerms = Object.keys(fakeDatabase).length;
  let totalLinks = 0;
  let termWithMostLinks = "";
  let maxLinksCount = 0;

  Object.keys(fakeDatabase).forEach((term) => {
    const linksCount = fakeDatabase[term].length;
    totalLinks += linksCount;
    if (linksCount > maxLinksCount) {
      maxLinksCount = linksCount;
      termWithMostLinks = term;
    }
  });

  let avgAppearancesPerTerm = totalAppearances / totalTerms;
  let avgAppearancesPerLink = totalAppearances / totalLinks;

  document.getElementById(
    "totalTerms"
  ).textContent = `Total Terms: ${totalTerms}`;
  document.getElementById(
    "termMostLinks"
  ).textContent = `Term with Most Links: ${termWithMostLinks} (${maxLinksCount} links)`;
  document.getElementById(
    "totalLinks"
  ).textContent = `Total Links: ${totalLinks}`;
  document.getElementById(
    "avgLinksPerTerm"
  ).textContent = `Average Links per Term: ${avgLinksPerTerm.toFixed(2)}`;
}

function switchPage(pageId) {
  document
    .querySelectorAll(".container, .search-container")
    .forEach(function (page) {
      page.classList.remove("active");
    });
  document.getElementById(pageId).classList.add("active");
  if (pageId === "statisticsPage") {
    calcStats();
  }
  page.classList.remove("active", "fade-in"); // Remove both active and fade-in classes

  const activePage = document.getElementById(pageId);
  activePage.classList.add("active");

  // Delay the fade-in animation slightly to ensure it triggers upon visibility
  setTimeout(() => {
    activePage.classList.add("fade-in");
  }, 10);
}

switchPage("searchPage");

// Example implementation for the Edit Index page
function addTerm() {
  const term = document.getElementById("newTerm").value;
  const docIds = document.getElementById("docIds").value;
  let message = document.getElementById("addMessage");
  console.log(term);
  console.log(docIds);
  fakeDatabase[term] = docIds.split(",").map((link) => link.trim());
  console.log(fakeDatabase);
  // Here you would add the term to your database
  message.innerHTML = `Term ${term} added successfully`;
  message.style.color = "green";
  // For demonstration, just reload the terms table
  // loadTerms();
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

function editTerm() {
  const term = document.getElementById("editTerm").value;
  const docIds = document.getElementById("editdocIds").value;
  let message = document.getElementById("editMessage");
  console.log(term);
  console.log(docIds);
  if (!fakeDatabase[term]) {
    message.innerHTML = `Term ${term} does not exist`;
    message.style.color = "red";
  } else {
    fakeDatabase[term] = docIds.split(",").map((link) => link.trim());
    message.innerHTML = `Term ${term} updated successfully`;
    message.style.color = "green";
  }

  // For demonstration, just reload the terms table
  // loadTerms();
}

function deleteTerm(term) {
  console.log(`Deleting term: ${term}`);
  // Here you would remove the term from your database
  loadTerms(); // Reload the terms list
}

function toggleLinksPerPageVisibility() {
  const linksPerPageContainer = document.getElementById(
    "linksPerPageContainer"
  );
  linksPerPageContainer.style.display = "block"; // Change 'show' to 'block'
}

function changeFontSize(action) {
  const body = document.body;
  const currentSize = parseInt(window.getComputedStyle(body).fontSize);

  if (action === "increase") {
    body.style.fontSize = `${currentSize + 2}px`;
  } else if (action === "decrease") {
    body.style.fontSize = `${Math.max(currentSize - 2, 10)}px`;
  }

  // Initially load terms when the page loads
  window.onload = function () {
    loadTerms();
  };
}
