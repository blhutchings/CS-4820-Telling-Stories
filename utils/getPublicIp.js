var http = require('http');
//this uses a 3rd party site to lookup our public ip, see this site: https://www.ipify.org/ for details and limitations
function getIP() {
    http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'},(resp) => {
    resp.on('data', (ip) => {
        console.log("My public IP address is: " + ip);
        return ip;
    });
    });
    
}

module.exports = getIP;