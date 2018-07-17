// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { remote, ipcRenderer } = require('electron');
const { handleForm } = remote.require('./main');
const currentWindow = remote.getCurrentWindow();

const mainForm = document.querySelector("#mainForm");
const statusList = document.getElementById('status');
let statusHTML = '';
var messageBody = document.querySelector('#status-box');

mainForm.addEventListener("submit", function(event){
    event.preventDefault();   // stop the form from submitting
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let customURL = document.getElementById("custom-url").value;
    let hostname = document.getElementById("hostname").value;
    statusHTML = '';
    handleForm(currentWindow, username, password, hostname, customURL);
});

ipcRenderer.on('form-received', function(event, args){
    statusHTML += args + '<br>';
    statusList.innerHTML = statusHTML;
    messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
});

ipcRenderer.on('update-status', function(event, args){
    document.getElementById("cur-status").innerHTML = args;
    if(args == 'Running') {
        document.getElementById("submit").disabled = true;
    } else if(args == 'Idle') {
        document.getElementById("submit").disabled = false;
    }
    document.querySelector('#openPath').addEventListener('click', function() {
        ipcRenderer.send('open-backup-path')
    });
});
