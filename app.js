const express = require("express")

const email_obfuscator = require("./email_obfuscator.js")

const app = express()
const port = 3000

app.use(email_obfuscator(use_defaults = 0))

app.use(express.static(__dirname + "/public"))

app.listen(port, () => {
  console.log("Server listening on port", port)
})