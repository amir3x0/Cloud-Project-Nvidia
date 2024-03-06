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
let linksPerPage = 5;
let allMatchingLinks = [];

async function search() {
  currentPage = 1; // Reset to first page for every new search
  const query = document.getElementById("searchQuery").value.trim().toLowerCase();
  const resultsContainer = document.getElementById("searchResults");
  resultsContainer.innerHTML = "";

  linksPerPage = parseInt(document.getElementById("linksPerPage").value) || 5;
  allMatchingLinks = []; // Reset for new search

  const results = await searchTerms(query);

  if (results.length > 0) {
    results.forEach((result) => {
      let docs = result.DocsIDs.map((doc) => ({
        term: result.Term,
        title: doc.title,
        url: doc.url,
        occuranceNumber: doc.occuranceNumber,
      }));
      allMatchingLinks = allMatchingLinks.concat(docs);
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

  pageLinks.forEach(({ term, title, url, occuranceNumber }) => {
    const docHtml = `<div class="doc">
                       <a href="${url}" target="_blank" class="doc-url">
                        <div class="doc-info"><span class="doc-title">${title}</span> <span class="doc-term">[${term}]</span> <span class="doc-occurrences">(${occuranceNumber} occurrences)</span></div>
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
  const allData = await searchTerms("__all");
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
      termFrequencies[entry.Term] = (termFrequencies[entry.Term] || 0) + doc.occuranceNumber;
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
      labels: commonLinksData.map(data => {
        // Split title into words, take the first three, and join them back into a string
        const trimmedTitle = data.title.split(" ").slice(0, 2).join(" ");
        // Optional: Add an ellipsis if the original title had more than three words
        return data.title.split(" ").length > 3 ? `${trimmedTitle}...` : trimmedTitle;
      }),
      datasets: [
        {
          label: "Link Appearances",
          data: commonLinksData.map(data => data.count),
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
      <tr><th>Average Links per Term</th><td>${avgLinksPerTerm.toFixed(
        2
      )}</td></tr>
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

// Function to search a query in database. Returns a dict of matches.
async function searchTerms(searchQueryString) {
  const results = [];

  // Convert the search query string to lowercase and match words, ignoring non-word characters
  const words = searchQueryString.toLowerCase().match(/\w+/g);
  //print the words in the words array
  console.log(words);

  if (!words) {
    return results; // Return an empty array if no words are found
  }

  // get all index from DB
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

        // Check if any word in the search query matches the Term, ignoring case
        // Convert both to lowercase for case-insensitive comparison
        if (data && data.Term && words.includes(data.Term.toLowerCase())) {
          if (data.DocsIDs && data.DocsIDs.length > 0) {
            // Push the whole data object if a match is found
            results.push(data);
          }
        }
      });
    }
  }
  return results;
}
