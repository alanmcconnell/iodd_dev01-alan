var _CONFIG =
{ "IODD_VERSION":   "2.05"
, "CLIENT_PATH":    "http://localhost:54332/client3/c32_iodd-app"
, "SERVER_PORT":    "54382"
, "SERVER_API_URL": "http://localhost:54382/api2"
, "SECURE_PATH":    "http://localhost:54333"
, "SECURE_API_URL": "http://localhost:54383/api"
//"REMOTE_API_URL": "https://iodd.com/api2"                                             //#.(51121.01.2 RAM We have a domain now)
//"REMOTE_API_URL": "http://92.112.184.206:54382/api2"                                  //#.(51121.01.2)
, "REMOTE_API_URL": "http://localhost:54382/api2"                                       // .(51121.01.2)
, "SERVER_LOCATION":"Remote"

//"LOGIN_PAGE":     "{SECURE_PATH}/login_client.html"                                   //#.(51015.02.3)
, "LOGIN_PAGE":     "{SECURE_PATH}/client/c01_client-first-app/login_client.html"       // .(51015.02.3 RAM Needs full path for Live Server)
, "LOGIN_SUCCESS":  "{CLIENT_PATH}/member-profile.html"
, "LOGIN_FAILURE":  "{CLIENT_PATH}/index.html"
   }
   if (typeof(window ) != 'undefined') { window.fvaRs  = _CONFIG; var aGlobal = "window"  }
   if (typeof(process) != 'undefined') { process.fvaRs = _CONFIG; var aGlobal = "process" }

// Process multiple times to handle nested replacements
for (let i = 0; i < 3; i++) { Object.entries(_CONFIG).forEach( replaceKey ); }

function replaceKey([aKey, aValue]) {
    if (typeof aValue === 'string') {
        Object.keys(_CONFIG).forEach(key => {
            _CONFIG[aKey] = _CONFIG[aKey].replace( new RegExp(`\\{${key}\\}`, 'g' ), _CONFIG[key]);
        if (_CONFIG?.SERVER_LOCATION?.match( /remote/i )) {
        var aREMOTE_HOST  = _CONFIG.REMOTE_API_URL.match(/^https?:\/\/[^\/]+/)[0].replace( /:[0-9]+/, "" );
            _CONFIG[aKey] = _CONFIG[aKey].replace( /http:\/\/localhost/, aREMOTE_HOST )
        if (_CONFIG.REMOTE_PORT) { _CONFIG.SERVER_PORT = _CONFIG.REMOTE_PORT }          // .(51121.01.3)
        if (_CONFIG.REMOTE_API_URL.match( /\.[0-9]+/ ) == null) {
            _CONFIG[aKey] = _CONFIG[aKey].replace( /:[0-9]{5}/, '' ) } } // Remove port too if not an IP
            } );
    }   }

  console.log( `${aGlobal}.fvaRs:`, JSON.stringify( _CONFIG, "", 2 ) );
