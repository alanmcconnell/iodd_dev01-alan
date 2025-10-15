var _CONFIG =
{ "IODD_VERSION":   "2.02"
, "CLIENT_PATH":    "http://localhost:54332/client3/c32_iodd-app"
, "SERVER_API_URL": "http://localhost:54382/api2"
, "AUTH_API_URL":   "http://localhost:54032/api2"
, "SECURE_PATH":    "http://localhost:55301"
, "SECURE_API_URL": "http://localhost:55351/api"
, "REMOTE_HOST":    "https://iodd.com"
, "SERVER_LOCATION":"Local"

, "LOGIN_PAGE":     "{SECURE_PATH}/login_client.html"
, "LOGIN_SUCCESS":  "{CLIENT_PATH}/member-profile.html"
, "LOGIN_FAILURE":  "{CLIENT_PATH}/index.html"
   }
   if (typeof(window ) != 'undefined') { window.fvaRs  = _CONFIG; aGlobal = "window"  }
   if (typeof(process) != 'undefined') { process.fvaRs = _CONFIG; aGlobal = "process" }

// Process multiple times to handle nested replacements
for (let i = 0; i < 3; i++) { Object.entries(_CONFIG).forEach( replaceKey ); }

function replaceKey([aKey, aValue]) {
    if (typeof aValue === 'string') {
        Object.keys(_CONFIG).forEach(key => {
            _CONFIG[aKey] = _CONFIG[aKey].replace(new RegExp(`\\{${key}\\}`, 'g'), _CONFIG[key]);
        if (_CONFIG.SERVER_LOCATION === "Remote") {
            _CONFIG[aKey] = _CONFIG[aKey].replace( /http:\/\/localhost/, _CONFIG.REMOTE_HOST )
            _CONFIG[aKey] = _CONFIG[aKey].replace( /:[0-9]{5}/, '' ) }  // Remote port too
            } );
    }   }

  console.log( `${aGlobal}.fvaRs:`, JSON.stringify( _CONFIG, "", 2 ) );
