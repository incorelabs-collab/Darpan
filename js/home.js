var pageHome = {
    pushNotification: window.plugins.pushNotification,
    initPush: function() {
        if (device.platform == 'android' || device.platform == 'Android' || device.platform == 'amazon-fireos') {
            // Device is Android.
            pageHome.pushNotification.register(pageHome.successHandler, pageHome.errorHandler, {
                "senderID" : "893688223674",
                "ecb" : "pageHome.onNotificationGCM"
            });
        } else {
            // Device is iOS.
            pageHome.pushNotification.register(pageHome.tokenHandlerAPN, pageHome.errorHandler, {
                "badge" : "true",
                "sound" : "true",
                "alert" : "true",
                "ecb" : "pageHome.onNotificationAPN"
            });
        }
    },
    tokenHandlerAPN: function(token) {
        console.log("Apple APNS Token :: " +token);
        var pushToken = localStorage.getItem("pushToken");
        // deviceType = 1 for iOS.
        if(pushToken == null || pushToken != token) {
            $.ajax({
                url: 'http://incorelabs.com/darpan/notification/register.php',
                type: 'POST',
                dataType: 'json',
                data: {uid : localStorage.getItem("login_user_id"), regId : token, deviceType : '1'},
                success: function(data) {
                    localStorage.setItem("pushToken", token);
                    // TODO : Add functionality to check if the registration was successful for Apple iOS.
                },
                error: function(error) {
                    alert(error);
                }
            });
        }
    },
    onNotificationAPN: function(e) {
        if (e.alert) {
            // showing an alert also requires the org.apache.cordova.dialogs plugin
            navigator.notification.alert(e.alert);
        }

        if (e.badge) {
            pageHome.pushNotification.setApplicationIconBadgeNumber(pageHome.successHandler, e.badge);
        }
    },
    onNotificationGCM: function(e) {
        switch(e.event) {
            case 'registered':
                if (e.regid.length > 0) {
                    console.log("GCM Registration Id :: " + e.regid);
                    var pushToken = localStorage.getItem("pushToken");
                    // deviceType = 0 for Android.
                    if(pushToken == null || pushToken != e.regid) {
                        // If the device has NOT registered or the device id has changed then only register again.
                        $.ajax({
                            url: 'http://incorelabs.com/darpan/notification/register.php',
                            type: 'POST',
                            dataType: 'json',
                            data: {uid : localStorage.getItem("login_user_id"), regId : e.regid, deviceType : '0'},
                            success: function(data) {
                                localStorage.setItem("pushToken", e.regid);
                                // TODO : Add functionality to check if the registration was successful for Google Android.
                            },
                            error: function(error) {
                                alert(error);
                            }
                        });
                    }
                }
                break;

            case 'message':
                navigator.notification.alert(JSON.stringify(e), app.alertDismissed, 'Darpan', 'Dismiss');
                //$("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
                //android only
                //$("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
                //amazon-fireos only
                //$("#app-status-ul").append('<li>MESSAGE -> TIMESTAMP: ' + e.payload.timeStamp + '</li>');
                break;

            case 'error':
                alert(e.msg);
                //$("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
                break;

            default:
                alert("An error has occurred with our Server. Sorry for the inconvenience.");
                //$("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
                break;
        }
    },
    successHandler: function(result) {
    },
    errorHandler: function(error) {
        alert("An Error has occurred.");
        //$("#app-status-ul").append('<li>error:' + error + '</li>');
    },
    changePage : function(url) {
        app.setBackPage("home.html");
        app.displayPage(url);
    }
}

$(document).ready(function() {
    app.setCurrentPage("home.html");
    pageHome.initPush();
});