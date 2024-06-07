describe("Note Creation Testing", () => {
  it("should create a note successfully", () => {
    // Step 1: Intercept the POST request to /notes and give it an alias
    cy.intercept("POST", "/notes", (req) => {
      //3rd argument
      expect(req.body.note).eq("This is a test note!")
      expect(req.body.tag).eq("test")
      console.log("Intercepted request:", req) // Log the intercepted request
      req.continue() // Let the request proceed as normal, otherwise request will hang and not reach server
    }).as("createNote")

    // Step 2: Visit the page that will trigger the network request
    cy.visit("http://127.0.0.1:5500/")

    // Step 3: Perform actions on the UI to trigger the POST request
    cy.get('[data-cy="create-note"]').type("This is a test note!")
    cy.get('[data-cy="create-tag"]').type("test")
    cy.get('[data-cy="create-button"]', { force: true }).click()

    // Step 4: Wait for the POST request to be made and assert on the response
    cy.wait("@createNote").then((interception) => {
      console.log("Interception:", interception) // Log the interception object

      // Step 5: Perform assertions on the intercepted REQUEST and RESPONSE
      expect(interception.response.statusCode).to.eq(200)
      expect(interception.response.body).to.have.property(
        "note",
        "This is a test note!"
      )
      expect(interception.response.body).to.have.property("tag", "test")
    })
  })

  it("should handle 500 server response ", () => {
    cy.intercept("POST", "/notes", (req) => {
      req.reply({
        statusCode: 500,
        body: {
          error: "Internal Server Error",
        },
      })
    }).as("clientNote")

    cy.visit("http://127.0.0.1:5500/")
    cy.get('[data-cy="create-note"]').type("test")
    cy.get('[data-cy="create-tag"]').type("tag")
    cy.get('[data-cy="create-button"]').click()

    cy.wait("@clientNote").then((interception) => {
      expect(interception.response.statusCode).to.eq(500)
      expect(interception.response.body.error).to.eq("Internal Server Error")
    })
  })

  it("should test using a modified request", () => {
    // Intercept the POST request and modify the body
    cy.intercept("POST", "http://localhost:3000/notes", (req) => {
      req.body.note = "This is NOT a test!"
      req.body.tag = "You are NOT it"
      req.continue()
    }).as("clientNote")

    cy.visit("http://127.0.0.1:5500/")
    cy.get('[data-cy="create-note"]').type("This is a test.")
    cy.get('[data-cy="create-tag"]').type("Tag. You are it")
    cy.get('[data-cy="create-button"]').click({ force: true })

    // Wait for the intercepted request and perform assertions
    cy.wait("@clientNote").then((interception) => {
      console.log("Are we here?")
      console.log(interception)

      // Check if the modified request body was sent
      expect(interception.request.body.note).to.eq("This is NOT a test!")
      expect(interception.request.body.tag).to.eq("You are NOT it")

      // Check the response body
      expect(interception.response.body.note).to.not.eq("Does not matter")
      expect(interception.response.body.tag).to.not.eq("Still does not matter")
    })
  })

  it("should handle a delayed response", () => {
    cy.intercept("POST", "/notes", (req) => {
      req
        .reply((res) => {
          setTimeout(() => {
            res.send({
              statusCode: 200,
              body: {
                note: "Modified note",
                tag: "Modified tag",
              },
            })
          }, 5000)
        })
        .as("clientNote")

      cy.visit("http://127.0.0.1:5500/")

      cy.get('[data-cy="create-note"]').type("Original note")
      cy.get('[data-cy="create-tag"]').type("Original tag")
      cy.get('[data-cy="create-button"]').click({ force: true })

      cy.wait("@clientNote", { timeout: 10000 }).then((res) => {
        expect(res.response.body.note).to.eq("Modified note")
        expect(res.response.body.tag).to.eq("Modified tag")
      })
    })

    it("should handle request abort", () => {
      cy.intercept("POST", "/notes", (req) => {
        req.abort()
      }).as("createNote")

      // Trigger the request...
      cy.visit("http://127.0.0.1:5500/")
      cy.get('[data-cy="create-note"]').type("This is a test.")
      cy.get('[data-cy="create-tag"]').type("Tag. You are it")
      cy.get('[data-cy="create-button"]').click()

      // Assert on the error handling...
      cy.wait("@createNote").then((interception) => {
        expect(interception.error.message).to.include("Request aborted")
      })

      // Check that an error message is displayed to the user
      cy.get("#error-message").should("contain", "Request aborted")
    })
  })
}) //describe

/* cy.interception ('','', (res)=>{})
This function can modify the request, delay, stub the response, or even abort the request. 
If you don't call req.continue(), req.reply(), or req.abort(), the request will hang and never reach the server. */
