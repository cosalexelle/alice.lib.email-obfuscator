const express = require("express")

const email_obfuscator = require("./email_obfuscator.js")

const app = express()
const port = 3000

app.use(email_obfuscator(use_defaults = 0))

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html")
})

app.listen(port, () => {
  console.log("Server listening on port", port)
})