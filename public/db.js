if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
};

let db;
const request = indexedDB.open("budgetApp", 1);

// Request functions that creates the database
request.onupgradeneeded = (event) => {
  let db = event.target.result;
  db.createObjectStore("pending_update", { autoIncrement: true });
};

// confirms that an event was successful 
request.onsuccess = (event) => {
  db = event.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};
// console logs out an error 
request.onerror = function(event) {
  console.log(error);
};

// adds the record to the cached database
function saveRecord(record) {
  const transaction = db.transaction(["pending_update"], "readwrite");
  const store = transaction.objectStore("pending_update");
  store.add(record);
};

// gets all info from cached database and sends it to actual database then deletes it
function checkDatabase() {
    const transaction = db.transaction(["pending_update"], "readwrite");
    const store = transaction.objectStore("pending_update");
    const getAll = store.getAll();
  
    getAll.onsuccess = function() {
      if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
        .then(response => {        
          return response.json();
        })
        .then(() => {
          // delete records if successful
          const transaction = db.transaction(["pending_update"], "readwrite");
          const store = transaction.objectStore("pending_update");
          store.clear();
        });
      }
    };
  }
// constantly look if the app is online
window.addEventListener("online", checkDatabase);