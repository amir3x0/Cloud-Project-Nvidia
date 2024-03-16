var admin = require("firebase-admin");

var serviceAccount = require("./class-presentation-79426-firebase-adminsdk-151s7-97e577e16c.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://class-presentation-79426-default-rtdb.europe-west1.firebasedatabase.app",
});
const db = admin.database();

async function searchTerms(searchQueryString) {
  const results = {};

  const words = searchQueryString.toLowerCase().match(/\w+/g);
  console.log(words);

  if (!words || words.length === 0) {
    return []; // Return an empty array if no words are found
  }

  const snapshot = await db.ref("/test").once("value");

  if (snapshot.exists()) {
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

//test
const searchQueryString = "ai detect";
searchTerms(searchQueryString).then((results) => {
  for (const result of results) {
    console.log(result);
  }
});
