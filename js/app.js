document.addEventListener("DOMContentLoaded", (event) => {
  // Function to create a note
  function createNote() {
    var item = document.getElementById("create-note").value;
    var tag = document.getElementById("tag").value;

    var data = {
      note: item,
      tag: tag,
    };

    console.log("Data sent to server:", data);

    // Send a POST request to create the note
    fetch("http://localhost:3000/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response data:", data);
        console.log("Note created:", data);
        // Optionally, clear the input fields after creating a note
        document.getElementById("create-note").value = "";
        document.getElementById("tag").value = "";
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  // Function to retrieve notes by tag
  function retrieveNotes() {
    var tag = document.getElementById("retrieve-input").value;
    console.log("Tag for retrieval:", tag);

    // Send a GET request to retrieve notes
    fetch("http://localhost:3000/notes")
      .then((response) => response.json())
      .then((data) => {
        console.log("Notes retrieved:", data);

        // Filter notes by tag
        const filteredNotes = data.filter((note) => note.tag === tag);
        console.log("Filtered notes:", filteredNotes);

        // Display the notes
        var notesPlaceholder = document.getElementById("notes-placeholder");
        notesPlaceholder.innerHTML = ""; // Clear previous notes

        // if (filteredNotes.length === 0) {
        //   noNotesMessage.className = "no-notes-message";
        //   notesPlaceholder.textContent = "No notes found for this tag.";
        //   return;
        // }

        if (filteredNotes.length === 0) {
          const noNotesMessage = document.createElement("div");
          noNotesMessage.className = "no-notes-message";
          noNotesMessage.textContent = "No notes found for this tag.";
          notesPlaceholder.appendChild(noNotesMessage);
          return;
        }

        filteredNotes.forEach((note) => {
          // Create a new note element
          let noteElement = document.createElement("div");
          noteElement.className = "note";

          // Create a note content element
          let noteContent = document.createElement("p");
          noteContent.textContent = note.note;

          // Create a tag element
          let noteTag = document.createElement("span");
          noteTag.className = "tag";
          noteTag.textContent = `Tag: ${note.tag}`;

          // Append content and tag to note element
          noteElement.appendChild(noteContent);
          noteElement.appendChild(noteTag);

          // Append note element to the notes placeholder
          notesPlaceholder.appendChild(noteElement);
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  // Add event listeners
  document
    .getElementById("create-form")
    .addEventListener("submit", function (event) {
      console.log("Create form submit event");
      event.preventDefault(); // Prevent the form from submitting
      createNote();
    });

  document
    .getElementById("item-form")
    .addEventListener("submit", function (event) {
      console.log("Item form submit event");
      event.preventDefault(); // Prevent the form from submitting
      retrieveNotes();
    });
});
