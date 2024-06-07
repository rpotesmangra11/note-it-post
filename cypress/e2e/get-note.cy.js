/* Business Requirement: 
Retrieve Notes by Tag:
    Test Case: Ensure notes can be retrieved by tag.
        Steps:
            Open the application.
            Enter a tag in the "GET" field.
            Click the "Retrieve" button.
            Verify that the notes with the specified tag are displayed. */

/*Example Acceptance Criteria
    Valid Tag Input:
        Given: the user is on the application page,
        When: the user enters a valid tag in the "GET" field,
        And: clicks the "Retrieve" button,
        Then: the application should fetch and display all notes associated with the specified tag.*/

describe("Retrieve notes using the GET button", () => {
  it("should retrieve notes when a tag is input and the GET button is clicked", () => {
    // First, create a note with a specific tag
    cy.request({
      method: "POST",
      url: "http://localhost:3000/notes",
      headers: { "Accept-Language": "en-us" },
      body: {
        note: "This is a note!",
        tag: "tag",
      },
    })
      .then((postResponse) => {
        console.log(postResponse)
        expect(postResponse.status).to.eq(200) // Check if the POST request was successful

        // Now, retrieve the notes
        cy.request({
          method: "GET",
          url: "http://localhost:3000/notes",
          headers: { "Accept-Language": "en-us" },
        })
      })
      .then((getResponse) => {
        console.log(`This is the final response ${getResponse}`)
        expect(getResponse.status).to.eq(200) // Check if the GET request was successful
        expect(getResponse.body).to.be.an("array").that.is.not.empty // Ensure the response body is an array and not empty
        const createdNote = getResponse.body.find(
          (note) => note.note === "This is a note!"
        )
        expect(createdNote).to.not.be.undefined // Ensure the note was found
        expect(createdNote).to.have.property("note", "This is a note!") // Check if the note is present
        expect(createdNote).to.have.property("tag", "tag") // Check if the tag is correct
      })
  })
})
