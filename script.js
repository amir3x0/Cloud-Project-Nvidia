// This is the main script file for the project

let currentPage = 1;
let linksPerPage = 5; // Default links per page
let allMatchingLinks = []; // Moved to a global scope
let currentTermId = null; // This will hold the ID of the currently edited term

async function search() {
  currentPage = 1; // Reset to first page for every new search
  const query = document
    .getElementById("searchQuery")
    .value.trim()
    .toLowerCase();
  const resultsContainer = document.getElementById("searchResults");
  resultsContainer.innerHTML = "";

  linksPerPage = parseInt(document.getElementById("linksPerPage").value) || 5;
  allMatchingLinks = []; // Reset for new search

  const results = await searchTerms(query);

  if (results.length > 0) {
    results.forEach((result) => {
      allMatchingLinks = allMatchingLinks.concat(result);
    });

    // Sort allMatchingLinks by occuranceNumber, highest first
    allMatchingLinks.sort((a, b) => b.occuranceNumber - a.occuranceNumber);

    const totalPages = Math.ceil(allMatchingLinks.length / linksPerPage);
    displayPage(currentPage); // Now only currentPage is needed as parameter
    setupPagination(totalPages);
  } else {
    resultsContainer.innerHTML = `<div>No results found for "<span class=\"term\">${query}</span>".</div>`;
    document.getElementById("pagination").innerHTML = ""; // Clear pagination if no results
  }
}

function displayPage(page) {
  const start = (page - 1) * linksPerPage;
  const end = start + linksPerPage;
  const pageLinks = allMatchingLinks.slice(start, end);

  const resultsContainer = document.getElementById("searchResults");
  resultsContainer.innerHTML = ""; // Clear previous results

  pageLinks.forEach(({ terms, title, url, totalOccurrences }) => {
    const docHtml = `<div class="doc">
                       <a href="${url}" target="_blank" class="doc-url">
                        <div class="doc-info"><span class="doc-title">${title}</span> <span class="doc-term">[${terms}]</span> <span class="doc-occurrences">(${totalOccurrences} occurrences)</span></div>
                        <div>${url}</div>
                       </a>
                     </div>`;
    resultsContainer.innerHTML += docHtml;
  });
}

function setupPagination(totalPages) {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = ""; // Clear previous pagination

  for (let i = 1; i <= totalPages; i++) {
    const pageLink = document.createElement("button");
    pageLink.className = "pagination-btn";
    pageLink.textContent = i;
    pageLink.onclick = function () {
      currentPage = i;
      displayPage(currentPage);
      updateActiveButton(currentPage);
    };
    paginationContainer.appendChild(pageLink);
  }
}

function updateActiveButton(activePageNumber) {
  const buttons = paginationContainer.querySelectorAll("pagination-btn");
  buttons.forEach((button) => {
    if (parseInt(button.textContent) === activePageNumber) {
      button.classList.add("activebtn");
    } else {
      button.classList.remove("activebtn");
    }
  });
}

// Clear Search function
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

async function calcStats() {
  const allData = await searchAll();
  let totalTerms = allData.length;
  let totalLinks = 0;
  let termWithMostLinks = "";
  let maxLinksCount = 0;
  let termFrequencies = {};
  let linkOccurrences = {};
  // Runs on all of the index
  allData.forEach((entry) => {
    const linksCount = entry.DocsIDs.length; // Assuming the property is DocsIDs
    totalLinks += linksCount;
    termFrequencies[entry.Term] =
      (termFrequencies[entry.Term] || 0) + linksCount;
    if (linksCount > maxLinksCount) {
      maxLinksCount = linksCount;
      termWithMostLinks = entry.Term; // Corrected to use entry.Term
    }

    // Runs on every link for every term
    entry.DocsIDs.forEach((doc) => {
      termFrequencies[entry.Term] =
        (termFrequencies[entry.Term] || 0) + doc.occuranceNumber;
      if (!linkOccurrences[doc.url]) {
        linkOccurrences[doc.url] = { count: 0, title: doc.title };
      }
      linkOccurrences[doc.url].count += doc.occuranceNumber;
    });
  });

  // Calculate the average links per term, ensuring not to divide by zero
  let avgLinksPerTerm = totalTerms > 0 ? totalLinks / totalTerms : 0;

  // Convert termFrequencies and linkOccurrences to arrays and sort them
  let sortedTermFrequencies = Object.entries(termFrequencies)
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count) // Corrected sorting function
    .slice(0, 10); // Get top 10 most common terms by occurrences

  let sortedLinkOccurrences = Object.entries(linkOccurrences)
    .map(([url, data]) => ({ url, count: data.count, title: data.title }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Get top 10 most common links

  const statsData = {
    totalTerms,
    totalLinks,
    termWithMostLinks,
    maxLinksCount,
    avgLinksPerTerm,
  };
  renderStatsTable(statsData);
  renderCommonTermsChart(sortedTermFrequencies);
  renderCommonLinksChart(sortedLinkOccurrences);
}

async function searchAll() {
  const results = [];

  // get all index from DB
  const snapshot = await db.ref("/test").once("value");

  if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      results.push(data);
    });
  }

  return results;
}

function renderCommonTermsChart(commonTermsData) {
  const ctx = document.getElementById("commonTermsChart").getContext("2d");
  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: commonTermsData.map((data) => data.term),
      datasets: [
        {
          label: "Appearances",
          data: commonTermsData.map((data) => data.count),
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Most Common Terms",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function renderCommonLinksChart(commonLinksData) {
  const ctx = document.getElementById("commonLinksChart").getContext("2d");
  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: commonLinksData.map((data) => {
        // Split title into words, take the first three, and join them back into a string
        const trimmedTitle = data.title.split(" ").slice(0, 2).join(" ");
        // Optional: Add an ellipsis if the original title had more than three words
        return data.title.split(" ").length > 3
          ? `${trimmedTitle}...`
          : trimmedTitle;
      }),
      datasets: [
        {
          label: "Link Appearances",
          data: commonLinksData.map((data) => data.count),
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          borderColor: "rgba(255, 159, 64, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Most Common Links",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function renderStatsTable({
  totalTerms,
  totalLinks,
  termWithMostLinks,
  maxLinksCount,
  avgLinksPerTerm,
}) {
  const tableHtml = `
    <table>
      <tr><th>Total Terms</th><td>${totalTerms}</td></tr>
      <tr><th>Total Links</th><td>${totalLinks}</td></tr>
      <tr><th>Term with Most Links</th><td>${termWithMostLinks} (${maxLinksCount} links)</td></tr>
      <tr><th>Average Links per Term</th><td>${avgLinksPerTerm.toFixed(2)}</td></tr>
    </table>
  `;
  document.getElementById("statsTable").innerHTML = tableHtml;
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

function loadTerms() {
  // This function would fetch terms from the database and display them
  // For demonstration, let's just clear the table and add a placeholder row
  const tableBody = document
    .getElementById("termsTable")
    .getElementsByTagName("tbody")[0];
  tableBody.innerHTML = "";

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

// Function to search a query in database. Returns a dict of matches.
async function searchTerms(searchQueryString) {
  const results = {};

  const words = searchQueryString.toLowerCase().match(/\w+/g);

  if (!words || words.length === 0) {
    return []; // Return an empty array if no words are found
  }

  const snapshot = await db.ref("/test").once("value");

  if (snapshot.exists()) {
    if (searchQueryString === "__all") {
      // Return all entries
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        results.push(data);
      });
    } else {
      // Searchs for matches
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();

        // Check and accumulate occurrences for each document based on the search terms
        if (data && data.DocsIDs && data.DocsIDs.length > 0) {
          data.DocsIDs.forEach((doc) => {
            words.forEach((word) => {
              if (data.Term.toLowerCase() === word) {
                // Initialize or update the document entry
                if (!results[doc.url]) {
                  results[doc.url] = {
                    url: doc.url,
                    title: doc.title,
                    totalOccurrences: 0,
                    terms: new Set(), // Use a Set to store unique terms
                  };
                }
                // Update total occurrences and add the term to the Set
                results[doc.url].totalOccurrences += doc.occuranceNumber;
                results[doc.url].terms.add(data.Term); // Add the matching term
              }
            });
          });
        }
      });
    }
  }
  const sortedResults = Object.values(results)
    .map((doc) => ({
      ...doc,
      terms: Array.from(doc.terms), // Convert Set to Array
    }))
    .sort((a, b) => {
      // Compare the lengths of the terms array first
      if (a.terms.length !== b.terms.length) {
        return b.terms.length - a.terms.length; // Descending order by length of terms
      }
      // If the lengths are equal, then sort by totalOccurrences (descending order)
      return b.totalOccurrences - a.totalOccurrences;
    });

  return sortedResults;
}

//////////////////////////////////edit section///////////////////////////////////////////////////////

async function searchTermsforEdit(searchQueryString) {
  const results = [];
  const words = searchQueryString.toLowerCase().match(/\w+/g);

  if (!words) {
    return results;
  }

  const snapshot = await db.ref("/test").once("value");

  if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      if (data.Term && words.includes(data.Term.toLowerCase())) {
        results.push({ ...data, id: childSnapshot.key });
      }
    });
  }

  return results;
}

async function fetchTermDetails() {
  const termInput = document.getElementById("editTerm");
  const term = termInput.value.trim().toLowerCase();
  const results = await searchTermsforEdit(term);
  const docIdsContainer = document.getElementById("docIdsContainer");

  // Reset the container and setup the table
  docIdsContainer.innerHTML = `<table class="docs-table">
                                  <thead>
                                    <tr>
                                      <th>Title</th>
                                      <th>URL</th>
                                      <th>Occurrences</th>
                                      <th>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody id="docsTableBody">
                                  </tbody>
                                </table>`;
  const docsTableBody = document.getElementById("docsTableBody");

  if (results.length === 0) {
    alert("No details found for term: " + term);
    currentTermId = null;
    return;
  }

  currentTermId = results[0].id;

  results[0].DocsIDs.forEach((doc, index) => {
    const row = document.createElement("tr");
    row.setAttribute("data-index", index);

    const titleCell = document.createElement("td");
    titleCell.innerText = doc.title;

    const urlCell = document.createElement("td");
    urlCell.innerText = doc.url;

    const occurrencesCell = document.createElement("td");
    occurrencesCell.innerText = doc.occuranceNumber;

    const actionCell = document.createElement("td");

    const editBtn = document.createElement("button");
    editBtn.innerText = "Edit";
    editBtn.className = "edit-btn";
    editBtn.onclick = function() { toggleEditSave(this, row, doc, index); };

    const removeBtn = document.createElement("button");
    removeBtn.innerText = "Remove";
    removeBtn.className = "remove-btn";
    removeBtn.onclick = () => removeDocId(currentTermId, index);

    actionCell.appendChild(editBtn);
    actionCell.appendChild(removeBtn);

    row.appendChild(titleCell);
    row.appendChild(urlCell);
    row.appendChild(occurrencesCell);
    row.appendChild(actionCell);

    docsTableBody.appendChild(row);
  });

  document.getElementById("editDetails").style.display = "block";
}

function toggleEditSave(button, row, doc, index) {
  const isEditing = button.innerText === "Edit";

  if (isEditing) {
    // Entering edit mode, make cells editable
    button.innerText = "Save";
    toggleEditableCells(row, true);
  } else {
    // Attempting to save changes, validate first
    const updatedDoc = {
      title: row.cells[0].innerText,
      url: row.cells[1].innerText,
      occuranceNumber: parseInt(row.cells[2].innerText, 10)
    };

    const validationError = validateDocInput(updatedDoc.occuranceNumber, updatedDoc.url);
    if (validationError) {
      alert(validationError);
      return; 
    }

    saveDocChanges(currentTermId, index, updatedDoc).then(() => {
      button.innerText = "Edit";
      toggleEditableCells(row, false);
    }).catch(error => {
      console.error("Error saving DocID changes: ", error);
      alert("Failed to save DocID changes.");
    });
  }
}

function toggleEditableCells(row, makeEditable) {
  const cells = row.querySelectorAll("td:not(:last-child)"); // Exclude action cell
  cells.forEach(cell => {
    cell.contentEditable = makeEditable;
  });
}

function validateDocInput(occurrence, url) {
  if (!Number.isInteger(occurrence) || occurrence < 1) {
    return "Occurrences must be a positive integer.";
  }

  if (!url.startsWith("https://www.nvidia.com/")) {
    return "URL must start with 'https://www.nvidia.com/'.";
  }

  return null; // No error, input is valid
}

async function saveDocChanges(termId, index, updatedDoc) {
  try {
    const docsRef = db.ref(`test/${termId}/DocsIDs`);
    const snapshot = await docsRef.once("value");
    let currentDocs = snapshot.exists() ? snapshot.val() : [];

    if (currentDocs.length > index) {
      currentDocs[index] = updatedDoc;
      await docsRef.set(currentDocs);
      alert("Changes saved successfully.");   
      fetchTermDetails();
    } else {
      alert("Error: Document to update does not exist.");
    }
  } catch (error) {
    console.error("Error saving DocID changes: ", error);
    alert("Failed to save DocID changes.");
  }
}

async function removeDocId(termId, index) {
  try {
    // Fetch current DocsIDs directly within the remove function
    const docsRef = db.ref(`/test/${termId}/DocsIDs`);
    const snapshot = await docsRef.once("value");

    if (snapshot.exists()) {
      let currentDocIds = snapshot.val();

      // Check if the index is valid for the current list of DocIDs
      if (currentDocIds.length > index) {
        // Remove the DocID at the specified index
        currentDocIds.splice(index, 1);

        // Update the database with the new list of DocIDs
        await docsRef.set(currentDocIds);
        alert("DocID removed successfully.");
        fetchTermDetails(); // Refresh the displayed list of DocIDs
      } else {
        alert("Invalid DocID index. Unable to remove.");
      }
    } else {
      alert("No DocIDs found for the specified term.");
    }
  } catch (error) {
    console.error("Error removing DocID: ", error);
    alert("Failed to remove DocID.");
  }
}

async function addNewDocId() {
  if (!currentTermId) {
    alert("No term selected for adding a new DocID.");
    return;
  }
  const newDocTitle = document.getElementById("newDocTitle").value.trim();
  const newDocURL = document.getElementById("newDocUrl").value.trim();
  const newDocOccurrence = parseInt(
    document.getElementById("newDocOccurrence").value.trim(),
    10
  );

  if (!newDocURL || !newDocTitle || isNaN(newDocOccurrence)) {
    alert("Please enter valid DocID information.");
    return;
  }

  const validationError = validateDocInput(newDocOccurrence, newDocURL);
  if (validationError) {
    alert(validationError);
    return;
  }

  const newDoc = {
    occuranceNumber: newDocOccurrence,
    title: newDocTitle,
    url: newDocURL,
  };

  // Correct reference to fetch current DocsIDs
  const docsRef = db.ref(`test/${currentTermId}/DocsIDs`);

  try {
    // Fetch current DocsIDs
    const snapshot = await docsRef.once("value");
    let currentDocs = snapshot.exists() ? snapshot.val() : [];
    currentDocs.push(newDoc);
    await docsRef.set(currentDocs);
    alert("DocID added successfully.");
    fetchTermDetails();
    // Clear input fields
    document.getElementById("newDocTitle").value = "";
    document.getElementById("newDocUrl").value = "";
    document.getElementById("newDocOccurrence").value = "";
  } catch (error) {
    console.error("Error adding DocID: ", error);
    alert("Failed to add DocID.");
  }
}
////////////////////////////edit section/////////////////////////////////////////////
