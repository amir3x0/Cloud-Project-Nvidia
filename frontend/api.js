async function searchTerms(searchQueryString) {
  const results = [];

  // Convert the search query string to lowercase and match words, ignoring non-word characters
  const words = searchQueryString.toLowerCase().match(/\w+/g);
  
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

async function search2() {
  const query = document.getElementById("searchQuery").value.trim().toLowerCase();
  const resultsContainer = document.getElementById("searchResults");
  resultsContainer.innerHTML = "";
  const results = await searchTerms(query); // Assuming this returns an array of result objects

  if (results.length > 0) {
    results.forEach((result) => {
      let docsHtml = "";
      result.DocsIDs.forEach((doc) => {
        docsHtml += `<div class="doc">
                       <a href="${doc.url}" target="_blank" class="doc-url">
                        <div class="doc-info">${doc.title} <span class="doc-term">[${result.Term}] </span> <span class="doc-occurrences">(${doc.occuranceNumber} occurrences)</span></div>
                        <div class="doc-url"> ${doc.url} </div> 
                       </a>
                     </div>`;
      });

      resultsContainer.innerHTML += `<div>${docsHtml}</div>`;
    });
  } else {
    resultsContainer.innerHTML += `<div>No results found for "<span class="term">${query}</span>".</div>`;
  }
}