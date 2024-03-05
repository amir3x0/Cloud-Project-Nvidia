async function searchTerms(searchQueryString) {
  const results = [];

  // remove all non word from string
  const words = searchQueryString.toLowerCase().match(/\w+/g);
  console.log(words);

  if (!words) {
    return results; // Return an empty array if no words are found
  }

  // get all index from DB
  const snapshot = await db.ref("/test").once("value");

  if (snapshot.exists()) {
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

  return results;
}

document.getElementById("searchButton").addEventListener("click", async () => {
  search();
});

let currentPage = 1;
let linksPerPage = 5; // Default links per page

async function search() {
  const searchQueryString = document.getElementById("searchQuery").value;
  const allMatchingLinks = await searchTerms(searchQueryString);
  const resultsContainer = document.getElementById("searchResults");
  resultsContainer.innerHTML = "";

  linksPerPage = parseInt(document.getElementById("linksPerPage").value);
  if (!allMatchingLinks || allMatchingLinks.length === 0) {
    // Display a prepared message when no results are found
    resultsContainer.innerHTML = `<div class="no-results">We couldn't find any results for "${searchQueryString}". Please try another search.</div>`;
    document.getElementById("pagination").innerHTML = ""; // Clear pagination if no results
  } else {
    var totalLinks = 0;
    for (result of allMatchingLinks) {
      for (link of result.DocsIDs) {
        totalLinks++;
      }
    }
    var totalPages = Math.ceil(totalLinks / linksPerPage);
    setupPagination(totalPages);
    displayPage(allMatchingLinks, currentPage, linksPerPage);
  }
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

function displayPage(allMatchingLinks, page, linksPerPage) {
  const start = (page - 1) * linksPerPage;
  const end = start + linksPerPage;
  const pageLinksInfo = [];
  console.log(allMatchingLinks);
  for (result of allMatchingLinks) {
    const term = result.Term;
    const linksInfo = result.DocsIDs;
    console.log(linksInfo);
    linksInfo.forEach((link) =>
      pageLinksInfo.push({ Term: term, Title: link.title, Link: link.url })
    );
    console.log(pageLinksInfo);
    pageLinks = pageLinksInfo.slice(start, end);
    console.log(pageLinks);
    const resultsContainer = document.getElementById("searchResults");
    resultsContainer.innerHTML = "";
    pageLinks.forEach((linkInfo) => {
      const linkElement = document.createElement("a");
      linkElement.href = linkInfo.Link;
      linkElement.target = "_blank";
      linkElement.innerHTML = `<span class="result-title">${linkInfo.Term}:</span> ${linkInfo.Link}`;
      const linkTitle = document.createElement("p");
      linkTitle.innerHTML = `<span class="result-title">${linkInfo.Title}:</span>`;
      resultsContainer.appendChild(linkTitle);
      resultsContainer.appendChild(linkElement);
    });
  }
}
