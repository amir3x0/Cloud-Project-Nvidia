// This is the main script file for the project

let currentPage = 1;
let linksPerPage = 5; // Default links per page
let allMatchingLinks = []; // Moved to a global scope
let currentTermId = null; // This will hold the ID of the currently edited term

toggleLinks(); // need to toggle the links base on if user uis logged in or not
// Function to get the query and call search in db.
async function search() {
  currentPage = 1; // Reset to first page for every new search
  const query = document.getElementById("searchQuery").value.trim().toLowerCase();
  const resultsContainer = document.getElementById("searchResults");
  resultsContainer.innerHTML = "";

  linksPerPage = parseInt(document.getElementById("linksPerPage").value) || 5;
  allMatchingLinks = []; // Reset for new search

  const results = await searchTerms(query);
  console.log(results);
  // start save the history search
  const username = localStorage.getItem("username");

  if (username !== null) 
  {
    const usersRef = db.ref("users");
    const snapshot = await usersRef.orderByChild("userName").equalTo(username).once("value");
    const search = {
      querySearched: query,
      result: results
    };
  
    if (snapshot.exists()) {
      const userData = snapshot.val();
      const userId = Object.keys(userData)[0]; // Assuming there's only one user
  
      // Push the search data to the user's history
      const newSearchRef = usersRef.child(`${userId}/history`).push();
      await newSearchRef.set(search);
  
      console.log("Search added to user history.");
    }
  }
  // end of save history search

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

// Function to display a page given index.
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

// Function to set up the search results pages.
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

// Function to update the active button of the pagination.
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
logout();
switchPage("login");  

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

// Returns all the db in array.
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

// Displays the Common terms chart.
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

// Displays the Common links chart.
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

// Displays the Statistics table.
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

  const activePage = document.getElementById(pageId);
  activePage.classList.add("active");

  // Delay the fade-in animation slightly to ensure it triggers upon visibility
  setTimeout(() => {
    activePage.classList.add("fade-in");
  }, 10);
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

/// Chatbot ///
async function call(function_name) {
  args = [...arguments].splice(1)
  var res = await google.colab.kernel.invokeFunction(function_name, args, {})
  if (res == null) { return }
  const outputString = res.data['text/plain'].split("'").join("").trim();
  if (outputString === 'True') {
    return true;
  } else if (outputString === 'False') {
    return false;
  } else if (outputString === 'None'){
    return null;
   }
  return outputString;
}

async function chat(msg) {
  let response = await call('chat', msg)
  return response;
}

class Chatbox {
  constructor() {
      this.args = {
          openButton: document.querySelector('.chatbox__button'),
          chatBox: document.querySelector('.chatbox__support'),
          sendButton: document.querySelector('.send__button'),
          logoutButton: document.querySelector('logoutLink')
      }

      this.state = false;
      this.messages = [];
  }

  display() {
      const {openButton, chatBox, sendButton, logoutButton} = this.args;

      openButton.addEventListener('click', () => this.toggleState(chatBox))

      sendButton.addEventListener('click', () => this.onSendButton(chatBox))

      logoutButton.addEventListener('click', () => this.onLogoutButton())

      const node = chatBox.querySelector('input');
      node.addEventListener("keyup", ({key}) => {
          if (key === "Enter") {
              this.onSendButton(chatBox)
          }
      })
  }

  toggleState(chatbox) {
      this.state = !this.state;

      // show or hides the box
      if(this.state) {
          chatbox.classList.add('chatbox--active')
      } else {
          chatbox.classList.remove('chatbox--active')
      }
  }

  async onSendButton(chatbox) {
      var textField = chatbox.querySelector('input');
      let text1 = textField.value
      if (text1 === "") {
          return;
      }

      let msg1 = { name: "User", message: text1 }
      this.messages.push(msg1);

      let response = await chat(msg1.message);
      let msg2 = { name: "Sam", message: response };
      this.messages.push(msg2);
      this.updateChatText(chatbox)
      textField.value = ''
  }

  onLogoutButton() {
    this.messages = []
  }

  updateChatText(chatbox) {
      var html = '';
      this.messages.slice().reverse().forEach(function(item, index) {
          if (item.name === "Sam")
          {
              html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>'
          }
          else
          {
              html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
          }
        });

      const chatmessage = chatbox.querySelector('.chatbox__messages');
      chatmessage.innerHTML = html;
  }
}

const chatbox = new Chatbox();
chatbox.display();



////////////////////////////history login register section/////////////////////////////////////////////
async function login() {
  var username = document.getElementById("username1").value;
  var password = document.getElementById("password").value;

  try {
    // Reference to the user document in the database based on username
    const userRef = db.ref("users").orderByChild("userName").equalTo(username);
    
    // Fetch the user data
    userRef.once("value", function(snapshot) {
      // Check if any user documents exist with the given username
      if (snapshot.exists()) {
        // Get the first user document (assuming usernames are unique)
        const userId = Object.keys(snapshot.val())[0]; // Get the userId of the first matching user
        const userData = snapshot.child(userId).val();
        const storedPassword = userData.password;
        const storedPasswordString = String(storedPassword);
        const enteredPasswordString = String(password);
        toggleLinks();

        // Check if the provided password matches the stored password
        if (enteredPasswordString === storedPasswordString) {
          // Passwords match, user authentication successful
          console.log("Login successful. User:", username);
          document.getElementById("loginForm").reset();
          localStorage.setItem("username", username);
          localStorage.setItem("admin", userData.admin);
          toggleLinks();
          switchPage("searchPage");
          // Do something to indicate successful login, such as redirecting the user to another page
        } else {
          // Passwords do not match, display an error message
          console.log("Incorrect password.");
          document.getElementById("loginMessage").textContent = "Incorrect password.";
        }
      } else {
        // No user found with the given username, display an error message
        console.log("User not found.");
        document.getElementById("loginMessage").textContent = "User not found.";
      }
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    // Handle error, such as displaying an error message to the user
    document.getElementById("loginMessage").textContent = "Error logging in. Please try again later.";
  }
}

function toggleLinks() {
  const username = localStorage.getItem("username");

  var loginLink = document.getElementById("loginLink");
  var registerLink = document.getElementById("registerLink");
  var searchLink = document.getElementById("searchLink");
  var editIndexLink = document.getElementById("editIndexLink");
  var statisticsLink = document.getElementById("statisticsLink");
  var logoutLink = document.getElementById("logoutLink");

  if (username !== null) {
    document.getElementById("welcomeMsg").textContent = "Hi "+username;
    const admin = localStorage.getItem("admin");
    console.log(admin);
    // User is logged in
    console.log("user is logged in as : ",username);
    loginLink.style.display = "none";
    registerLink.style.display = "none";
    searchLink.style.display = "inline";
    if (admin === "true") {
      // If admin is true, display editIndexLink
      editIndexLink.style.display = "inline";
    } else {
      // If admin is not true, hide editIndexLink
      editIndexLink.style.display = "none";
    }
    statisticsLink.style.display = "inline";
    logoutLink.style.display = "inline"; // Show logout link
  } else {
    console.log("user is not logged in")
    // User is logged out
    loginLink.style.display = "inline";
    registerLink.style.display = "inline";
    searchLink.style.display = "none";
    editIndexLink.style.display = "none";
    statisticsLink.style.display = "none";
    logoutLink.style.display = "none"; // Hide logout link
  }
}


async function register() {
  var username = document.getElementById("username2").value;
  var password1 = document.getElementById("password1").value;
  var password2 = document.getElementById("password2").value;

  try {
    // Reference to the users collection in the database
    const usersRef = db.ref("users");

    // Check if the username already exists
    const snapshot = await usersRef.orderByChild("userName").equalTo(username).once("value");
    if (snapshot.exists()) {
      // Handle the case where the username already exists
      document.getElementById("registerMessage").textContent = "Username already exists.";
    } 
    else 
    {
      if (password1 !== password2) {
        document.getElementById("registerMessage").textContent = "Passwords do not match.";
      } else {
        // Create the user object with the provided data
        const newUser = {
          userName: username,
          password: password1,
          admin: false, // Assuming new users are not admins by default
          history: {search0:""},
        };

        // Set the user data in the database under the username
        await usersRef.child(username).set(newUser);
        window.alert("you are seccessfuly registred");
        switchPage("login");
        
      }
    }
  } catch (error) {
    console.error("Error registering user:", error);
    // Handle error, such as displaying an error message to the user
    document.getElementById("registerMessage").textContent = "Error registering user. Please try again later.";
  }
}



function logout()
{
  localStorage.removeItem("username");
  localStorage.removeItem("admin");
  document.getElementById("welcomeMsg").textContent = "";
  toggleLinks();
  switchPage("login");;
}



window.addEventListener("beforeunload", function(event) {
  // Perform your action here
  localStorage.removeItem("username");
  localStorage.removeItem("admin");
  // The browser will handle showing a confirmation dialog to the user
});
