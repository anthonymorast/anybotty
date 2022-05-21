const execFile = require('child_process').execFile;
var express = require('express');
var app = express();
let fs = require('fs');
let formidable = require('formidable');
let cors = require('cors');
let ash = require('express-async-handler');

app.use(cors());    // since we're not listening on port 80
app.post('/abadd', ash(async (req, res) => {
    // parse the form with formidable
    let form = new formidable.IncomingForm();
    res.setHeader("Content-Type", "application/json");      // response format 
    let formData = await new Promise((resolve, reject) => {
        form.parse(req, function(error, fields, file) {
            // get the command data 
            let cname = fields["cname"];
            let rtext = fields["rtext"];
            let hmessage = fields["hmessage"];
            let baseDir = "<BOT_DIR>";              // TODO: change this to your bot's directory
            if(hmessage === "" || cname === "") {
                // these fields are required
                res.status(500).send({"error": "ERROR: Command name and help message are required."}); 
                resolve("success");
                return;
            }
        
            if(Object.keys(file).length > 0) {      // if a file is uploaded
                let filepath = file.ifile.filepath; 
                let newpath = baseDir + "imgs/" + file.ifile.originalFilename;
   
                if(!fs.existsSync(newpath)) {
                    // these are for if the file does exist, decided not to error so I
                    // changed the check to !exist and copy the file if need be, otherwise
                    // ignore the file. This way two commands can use the same file.
                   // ires.status(500).send({"error": "ERROR: File " + file.ifile.originalFilename + " already exists on server."});
                    //return;
                    fs.rename(filepath, newpath, function() {});
                }
            }
        
            // if we got this far we have the necessary data and the file was copied if need be
            let hJson = require(baseDir + 'help.json');     // cmd -> help messages
            let mJson = require(baseDir + 'messages.json'); // cmd -> response messages
            let fJson = require(baseDir + 'files.json');    // cmd -> imgs

            if(hJson.hasOwnProperty(cname)) {   // does this command exist?
                res.status(500).send({"error": "ERROR: Command exists"});
                resolve("success");
                return;
            }

            // append the data to the JSON files
            hJson[cname] = hmessage;
            mJson[cname] = rtext;
            if(Object.keys(file).length > 0) {
                fJson[cname] = baseDir + "imgs/" + file.ifile.originalFilename;
            }
            // rewrite the JSON files
            fs.writeFileSync(baseDir + 'files.json', JSON.stringify(fJson));
            fs.writeFileSync(baseDir + 'help.json', JSON.stringify(hJson));
            fs.writeFileSync(baseDir + 'messages.json', JSON.stringify(mJson));
            
            res.status(200).send({"success": "Good job adding a command."});
            resolve("success");
        });
    });
 
    // Once processing is complete, restart the bot so the command is available
    var command = baseDir + "restart_anybotty.sh";
    var params = [];
    const proc = execFile(command, params, (error, stdout, stderr) => {
//        console.log(error, stdout, stderr);
    });
}));

var port = 9009;
app.listen(port, () => console.log("Started AnyBotty API on port " + port))
