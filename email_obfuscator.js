/*
    email_obfuscator.js
*/

// IMPORTANT!
// DO NOT RELY ON USER INPUT FOR KEY AND ID VALUES
// The key and ID are embedded into client deobfuscation javascript
// and could allow unauthorised code execution on your webpage.

const DEFAULT_OBFUSCATION_KEY = 0x0F
const DEFAULT_OBFUSCATION_ID = "email-obfuscator"

var fn_obfuscate = (str, key, id) => {
    const regex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi
    return str.replace(regex, (str) => {
        str = Buffer.from(str).map(byte => byte ^ key).toString("base64")
        return "{" + id + ":" + str + "}"
    })
}

// base64 regex

// 1) seems to select most base64 strings but excludes some,
// /\{id:((?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=))\}/g

// 2) is more generic
// /\{id:((?:[A-Za-z0-9+/]*={0,2}))\}/g

var fn_deobfuscate = (str, key, id) => {
    const regex = new RegExp("\{" + id + ":((?:[A-Za-z0-9+/]*={0,2}))\}", "g");
    return str.replace(regex, (a, b) => {
        return Buffer.from(b, "base64").map(byte => byte ^ key).toString("utf8")
    })
}

var fn_attach_debofuscator = (str, key, id) => {
    
    return str.replace(/(<\/head>)/, (a, b) => {

        return `
        <script id="email_obfuscation_js_` + id + `">

            // email_obfuscation.js
            document.addEventListener("DOMContentLoaded", () => {
                function fn_base64_to_bytes(base64) {
                    const binary_string = window.atob(base64);
                    var bytes = [];
                    for (var i = 0; i < binary_string.length; i++) {
                        bytes.push(binary_string.charCodeAt(i)) ;
                    }
                    return bytes;
                }
                function fn_bytes_to_string(bytes){
                    return bytes.map(x => String.fromCharCode(x)).join("")
                }
                function fn_deobfuscate(str, key = "` + key + `", id = "` + id + `"){
                    const regex = new RegExp("\{" + id + ":((?:[A-Za-z0-9+/]*={0,2}))\}", "g");
                    return str.replace(regex, (a, b) => {
                        return fn_bytes_to_string(fn_base64_to_bytes(b).map(byte => byte ^ key))
                    })
                }
                var el = document.getElementsByTagName("head");
                var script_el = document.getElementById("email_obfuscation_js_` + id + `")
                el && el.length > 0 && el[0].removeChild(script_el)

                document.write(fn_deobfuscate(document.documentElement.innerHTML))
                document.close()
                
            })
        </script>` + "\n\n" + b
    });

}

module.exports = function(use_defaults = false){

    return (req, res, fn) => {

        const random_key = Math.floor(Math.random() * 255)
        const random_id = Math.floor(Math.random() * new Date().getTime())

        var key = use_defaults ? DEFAULT_OBFUSCATION_KEY : random_key
        var id = use_defaults ? DEFAULT_OBFUSCATION_ID : random_id

        const res_write = res.write;
        res.write = function (chunk) {
            const content_type = res.getHeader("Content-Type")
            if(content_type.indexOf("text/html") > -1) {
                chunk instanceof Buffer && (chunk = chunk.toString())
    
                chunk = fn_obfuscate(chunk, key, id)
    
                chunk = fn_attach_debofuscator(chunk, key, id)
    
                res.setHeader("Content-Length", chunk.length);
            }
            res_write.apply(this, arguments);
        };
        fn();
    }
}
