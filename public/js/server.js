const express = require("express")
const bodyParser = require("body-parser")
const sqlite3 = require("sqlite3").verbose()
const cors = require("cors")
const { v4: uuidv4 } = require("uuid")
const path = require('path'); // Add this line

const app = express()
app.use(cors())
app.use(bodyParser.json())

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "..", "public")))

let db = new sqlite3.Database(":memory:", (err) => {
  if (err) {
    console.error("Failed to connect to the SQLite database:", err.message)
    process.exit(1)
  }
  console.log("Connected to the in-memory SQLite database.")
})

db.run(
  "CREATE TABLE notes(id TEXT PRIMARY KEY, note TEXT, tag TEXT)",
  (err) => {
    if (err) {
      console.error("Failed to create the notes table:", err.message)
      process.exit(1)
    }
  }
)

const postNotes = (req, res) => {
  const id = uuidv4()
  const { note, tag } = req.body

  if (!note || !tag) {
    return res.status(400).json({ error: "Note and tag are required" })
  }

  db.run(
    `INSERT INTO notes(id, note, tag) VALUES(?, ?, ?)`,
    [id, note, tag],
    function (err) {
      if (err) {
        return res.status(400).json({ error: err.message })
      }
      console.log(`Note created with ID: ${id}`)
      return res.status(201).json({ id: id, note: note, tag: tag })
    }
  )
}

const getNotes = (req, res) => {
  db.all(`SELECT * FROM notes`, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message })
    }
    return res.json(rows)
  })
}

app.post("/notes", postNotes)
app.get("/notes", getNotes)

app.get("/notes/:id", (req, res) => {
  const { id } = req.params
  console.log(`Received GET request for note with ID: ${id}`)
  db.get(`SELECT * FROM notes WHERE id = ?`, id, (err, row) => {
    if (err) {
      return res.status(400).json({ error: err.message })
    }
    if (row) {
      return res.json(row)
    } else {
      return res.status(404).json({ error: "Note not found" })
    }
  })
})

app.put("/notes/:id", (req, res) => {
  const { id } = req.params
  const { note, tag } = req.body

  if (!note || !tag) {
    return res.status(400).json({ error: "Note and tag are required" })
  }

  console.log(`Received PUT request for note with ID: ${id}`)
  db.run(
    `UPDATE notes SET note = ?, tag = ? WHERE id = ?`,
    [note, tag, id],
    function (err) {
      if (err) {
        return res.status(400).json({ error: err.message })
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Note not found" })
      }
      return res.json({ id, note, tag })
    }
  )
})

app.delete("/notes/:id", (req, res) => {
  const { id } = req.params
  console.log(`Received DELETE request for note with ID: ${id}`)
  db.run(`DELETE FROM notes WHERE id = ?`, id, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message })
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Note not found" })
    }
    return res.json({ id })
  })
})

// Use the PORT environment variable provided by Heroku or default to 3000
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
