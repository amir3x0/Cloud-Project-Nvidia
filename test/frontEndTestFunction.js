

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

module.exports = searchTerms;
// test
// const searchQueryString = "ai detect";
// searchTerms(searchQueryString).then((results) => {
//   for (const result of results) {
//     console.log(result);
//   }
// });
