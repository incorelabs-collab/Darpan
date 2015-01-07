var app = {
    requestStatus: [],
    backLog: [],
    backURL: "",
    db: (function() {
        if(localStorage.getItem('dbLocalVersion') == null) {
            localStorage.setItem('dbLocalVersion','-1');
        } else {
            localStorage.setItem('dbAlreadyPresent','true');
        }
        return openDatabase('dbDarpan', localStorage.getItem('dbLocalVersion'), 'dbDarpan', (5 * 1022 * 1022));
    })(),
    initialize: function() {
        document.addEventListener('deviceready', app.onDeviceReady, false);
        //app.onDeviceReady();
    },
    onDeviceReady: function() {
        document.addEventListener('resume', app.onResume, false);
        document.addEventListener('backbutton', app.onBackKeyDown, false);
        localStorage.removeItem('backLog');

        $('#app').toggleClass('hidden');

        setTimeout(function() {
            navigator.splashscreen.hide();
        }, 3000);

        setTimeout(function () {
            $('#startup_splash').remove();
        }, 5000);

        app.checkConnection();
    },
    onResume: function () {
        localStorage.setItem("hasAppResumed",true);
        app.checkConnection();
    },
    checkConnection: function () {
        if(app.isConnectionAvailable()) {
            app.doOnlineTasks();
        } else {
            app.doOfflineTasks();
        }
    },
    doOnlineTasks: function() {
        var url = 'http://incorelabs.com/clubApp/temp_dbVersion.php';
        if(localStorage.getItem('dbLocalVersion') == -1) {
            $.getJSON(url).done(app.checkWithLocalDB);
        } else {
            var request = $.ajax({
                dataType: "json",
                url: url,
                timeout: 4000
            });
            request.done(app.checkWithLocalDB);
            request.fail(function(jqXHR, textStatus) {
                // Internet BUT Cannot Connect to server, hence Timeout.
                if(app.getBoolean(localStorage.getItem("hasAppResumed")) == false) {
                    if(app.getBoolean(localStorage.getItem("isUserLoggedIn")) != true) {
                        app.displayPage("login.html");
                    } else {
                        app.displayPage("home.html");
                    }
                    $('#app').toggleClass('hidden');
                }
                localStorage.removeItem("hasAppResumed");
                //console.log( "Request failed: " + textStatus );
                //console.log("Internet BUT Cannot Connect to server, hence Timeout.");
            });
        }
    },
    checkWithLocalDB: function(json) {
        if (localStorage.getItem("dbLocalVersion") != json.version) {
            // TODO :: Change the parameters to the $.getJSON methods. That is, the resultant callbacks.

            // TODO :: If the request to the server takes more than 5 seconds. Tell the user the network is slow.

            $('#app').empty();                          // Removes everything from the app div.
            $('#loading').toggleClass('hidden');        // Shows the loading screen.

            localStorage.setItem('dbCurrentOnline',json.version);

            app.requestStatus = [false, false, false, false, false, false, false];

            /*$.getJSON('users.php', function(userData) {
                app.createTable(userData,"users",0);
            });
            $.getJSON('male.php', function(maleData) {
                app.createTable(maleData,"male",1);
            });
            $.getJSON('female.php', function(femaleData) {
                app.createTable(femaleData,"female",2);
            });
             $.getJSON('common.php', function(commonData) {
             app.createTable(commonData,"common",3);
             });
            $.getJSON('kids.php', function(kidsData) {
                app.createTable(kidsData,"kids",4);
            });
            $.getJSON('directors.php', function(directorsData) {
                app.createTable(directorsData,"directors",5);
            });
            $.getJSON('events.php', function(eventsData) {
                app.createTable(eventsData,"events",6);
            });*/

            // Production URL.

            $.getJSON('http://incorelabs.com/clubApp/users.php', function(userData) {
                app.createTable(userData,"users",0);
            });
            $.getJSON('http://incorelabs.com/clubApp/male.php', function(maleData) {
                app.createTable(maleData,"male",1);
            });
            $.getJSON('http://incorelabs.com/clubApp/female.php', function(femaleData) {
                app.createTable(femaleData,"female",2);
            });
            $.getJSON('http://incorelabs.com/clubApp/common.php', function(commonData) {
                app.createTable(commonData,"common",3);
            });
            $.getJSON('http://incorelabs.com/clubApp/kids.php', function(kidsData) {
                app.createTable(kidsData,"kids",4);
            });
            $.getJSON('http://incorelabs.com/clubApp/directors.php', function(directorsData) {
                app.createTable(directorsData,"directors",5);
            });
            $.getJSON('http://incorelabs.com/clubApp/events.php', function(eventsData) {
                app.createTable(eventsData,"events",6);
            });

        } else {
            // Internet BUT Data is Up to Date.
            if(app.getBoolean(localStorage.getItem("hasAppResumed")) == false) {
                if(app.getBoolean(localStorage.getItem("isUserLoggedIn")) != true) {
                 app.displayPage("login.html");
                 } else {
                 app.displayPage("home.html");
                 }
                $('#app').toggleClass('hidden');
            }
            localStorage.removeItem("hasAppResumed");
            //console.log("Internet BUT Data is Up to Date.");
        }
    },
    doOfflineTasks: function() {
        // TODO :: In offline mode. if there is no data. Ask the user. to connect to internet. Give Refresh button.
        if(localStorage.getItem('dbLocalVersion') == -1) {
            // NO Internet NO Data.
            if(app.getBoolean(localStorage.getItem("hasAppResumed")) == false) {
                $("#app").append("Please Connect to the internet. You have NO data.");
                $('#app').toggleClass('hidden');
                //console.log("NO Internet NO Data.");
            }
            localStorage.removeItem("hasAppResumed");
        } else {
            // No Internet BUT Data is there.
            if(app.getBoolean(localStorage.getItem("hasAppResumed")) == false) {
                if(app.getBoolean(localStorage.getItem("isUserLoggedIn")) != true) {
                 app.displayPage("login.html");
                 } else {
                 app.displayPage("home.html");
                 }
                $('#app').toggleClass('hidden');
            }
            localStorage.removeItem("hasAppResumed");
            //console.log("NO internet BUT Data Present.");
        }
    },
    isConnectionAvailable: function() {
        return navigator.connection.type === Connection.NONE ? false : true;
        //return true;
    },
    createTable: function (data, tableName, index) {
        // TODO :: Add dbSuccess and dbError to the executeSql statements.
        data = data.split("&#");
        app.db.transaction(function (tx) {
            tx.executeSql("DROP TABLE IF EXISTS "+tableName,[]);
            tx.executeSql(data[0], []);
            for(var i=1;i<data.length;i++) {
                tx.executeSql(data[i], []);
            }
            app.requestStatus[index] = true;
            if(app.requestStatus.every(app.validateRequest)) {
                app.dbChangeVersion(localStorage.getItem('dbLocalVersion'), localStorage.getItem('dbCurrentOnline'));
                $('#loading').toggleClass('hidden');        // hides the loading screen again
                // Since onResume the entire app div is emptied thus there is not need for hiding it.
                if(app.getBoolean(localStorage.getItem("isUserLoggedIn")) != true) {
                    app.displayPage("login.html");
                } else {
                    app.displayPage("home.html");
                }
                if(app.getBoolean(localStorage.getItem("hasAppResumed")) == false) {
                    $('#app').toggleClass('hidden');            // Show the app div now after data has loaded.
                }
            }
        },app.dbTxError);
    },
    dbChangeVersion: function(dbOldVersion, dbUpdatedVersion) {
        try {
            app.db.changeVersion(dbOldVersion, dbUpdatedVersion, app.dbChangeVersionTx, app.dbChangeVersionError, app.dbChangeVersionSuccess(dbUpdatedVersion));
        } catch(e) {
            alert('An error occurred while updating the app data. Try AGAIN.');
        }
    },
    dbChangeVersionTx: function(tx) {},
    dbChangeVersionError: function(error) {
        alert('Error in Version Change. Error was :: '+error.message);
        return true;
    },
    dbChangeVersionSuccess: function(dbUpdatedVersion) {
        localStorage.setItem('dbLocalVersion', dbUpdatedVersion);
    },
    dbTxError: function (error) {
        alert('Oops.  Error was '+error.message+' (Code '+error.code+')');
    },
    dbQueryError: function(tx, error) {
        alert('Oops.  Error was '+error.message+' (Code '+error.code+')');
    },
    validateRequest: function(element, index, array) {
        return (element == true);
    },
    getBoolean: function(boolString) {
        return ((boolString == "true") ? true : false);
    },
    setCurrentPage: function(url) {
        localStorage.setItem("currentPage", url);
    },
    getCurrentPage: function() {
        return localStorage.getItem("currentPage");
    },
    setBackPage: function(url) {
        if(localStorage.getItem("backLog") == null) {
            localStorage.setItem("backLog",url);
        }
        else {
            app.backLog = localStorage.getItem("backLog").split(",");
            app.backLog.push(url);
            localStorage.setItem("backLog", app.backLog.toString());
            app.backLog = [];
        }
    },
    getBackPage: function() {
        if(localStorage.getItem("backLog") != null) {
            app.backLog = localStorage.getItem("backLog").split(",");
            app.backURL = app.backLog.pop();
            if(app.backLog.length > 0) {
                localStorage.setItem("backLog", app.backLog);
            }
            else {
                localStorage.removeItem("backLog");
            }
        }
        else {
            app.backURL = "";
        }
        return app.backURL;
    },
    displayPage: function(url) {
        $("#app").empty();
        $.get(url, function(data) {
            $("#app").html(data);
        });
    },
    onBackKeyDown: function() {
        var url = app.getBackPage();
        if(url != "") {
            app.displayPage(url);
        } else {
            var wantToExit = confirm("Do you want to exit ?");
            if(wantToExit)
                navigator.app.exitApp();
            else
                return;
            //navigator.notification.confirm('Do you want to exit ?', app.onConfirm, 'Confirmation', ['Yes','No']);
        }
    }
    /*onConfirm: function(buttonIndex) {
      if(buttonIndex == 1) {
            navigator.app.exitApp();
        } else {
            return;
        }
    }*/
};

app.initialize();