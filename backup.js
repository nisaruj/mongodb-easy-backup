const fsx = require('fs-extra');
const MongoClient = require('mongodb').MongoClient;

let backupPath = __dirname + '/backup-data/';

async function getInfo(db, targetWindow) {
    let collections = await db.listCollections().toArray();
    let promises = [];
    collections.forEach(e => {
        promises.push(db.collection(e.name).find({}).toArray());
    });
    let res = await Promise.all(promises);
    promises = [];
    for(let i=0;i<res.length;i++) {
        /*console.log('-------------------------------------' + collections[i].name + '-------------------------------------');
        console.log(res[i]);*/
        promises.push(fsx.outputFile(backupPath + collections[i].name + '.txt', JSON.stringify(res[i])));
    }
    res = await Promise.all(promises);
    console.log('All files were saved successfully.');
    targetWindow.webContents.send('form-received', "All files were saved successfully at :<br>" + backupPath + '  <a href="#" class="badge badge-success" id="openPath">Open</a>');
    targetWindow.webContents.send('update-status', 'Idle');
}

exports.backup = function(username, password, hostname, dbName, targetWindow, customURL) {
    // Connection URL
    const url = customURL ? customURL : ('mongodb+srv://' + username + ':' + password + '@' + hostname + '/test?retryWrites=true');
    // Use connect method to connect to the server
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
        if (err) {
            console.log(err);
            targetWindow.webContents.send('form-received', '<span style="color: red;">' + err + '</span>');
            targetWindow.webContents.send('update-status', 'Idle');
            return;
        }

        console.log("Connected successfully to server");
        targetWindow.webContents.send('form-received', '<span style="color: lime;">Connected successfully to server.</span>');
        
        const db = client.db(dbName);

        // Get all collections from specific db
        getInfo(db, targetWindow).then(() => {
            client.close();
        });
    });
}

exports.getBackupPath = function() {
    return backupPath;
}

