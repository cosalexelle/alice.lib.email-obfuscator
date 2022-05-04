# alice.lib.email-obfuscator
Reduce email spam by preventing bots from scraping your email address!
Use this (NodeJS) Express middleware app to XOR and Base64 encode email addresses before sending to client.
**Important: this is potentially buggy software, do not use in production!**

## Why?
Some basic web scraping bots will download your source code and pull out email addresses from your page. This tool can be used to encode your email addresses server-side, and then deobfuscate them using Javascript inside the client's browser. This will not prevent bots that run provided Javascript. 

It's inspired by other similar systems, such as that offered by Cloudflare (not affiliated). Their implementation is probably more reliable :)

## Known Issues

1. Some characters, mainly those with accents or emojis will not decode correctly. Therefore the decoded text may appear broken or it may contain the wrong characters.

## Usage
See **app.js** for full example. 

### Example

```javascript
//...
const express = require("express")
const email_obfuscator = require("./email-obfuscator.js");

const app = express()

app.use(email_obfuscator())

// Responses will be obfuscated
app.get("/", (req, res) => {
    res.sendFile("index.html")
})
// ...
```

## Methods

Build the middleware function to obfuscate email addresses.
```javascript
// use_defaults will use a static default key and id for each request
// otherwise use random values for the key and id
email_obfuscator(use_defaults = false)
/*
    (req, res, fn) => {
        // middleware
    }
*/
```

## Under the Hood

The middleware intercepts and modifies the ```res.write``` function to replace email addresses with an obfuscated version.

Any email address in your HTML source code will be replaced with a string with the following pattern: ```{id:base64_encode(email XOR key)}```. This also appends a ```<script>``` tag, which adds a ```DOMContentLoaded``` event listener to the document which decodes the obfuscated string.

For example, obfuscating **example@example.com** with the default key and id equals **{email-obfuscator:Z2pjY2BPanduYn9jaiFsYGI=}**.

## TODO:
Basically everything... Pull requests are welcome!

## License
MIT
