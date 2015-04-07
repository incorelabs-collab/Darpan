var pageHome = {
    pushNotification: window.plugins.pushNotification,
    initPush: function() {
        if (device.platform == 'android' || device.platform == 'Android') {
            pageHome.pushNotification.register(pageHome.successHandler, pageHome.errorHandler, {
                "senderID" : "893688223674",
                "ecb" : "pageHome.onNotificationGCM"
            });
        } else {
            pageHome.pushNotification.register(pageHome.tokenHandlerAPN, pageHome.errorHandler, {
                "badge" : "true",
                "sound" : "true",
                "alert" : "true",
                "ecb" : "pageHome.onNotificationAPN"
            });
        }
    },
    tokenHandlerAPN: function(token) {
        var pushToken = localStorage.getItem("pushToken");
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
                }
            });
        }
    },
    onNotificationAPN: function(e) {
        if (e.alert) {
            navigator.notification.alert(e.alert, app.alertDismissed, e.acme, 'Dismiss');
        }
        if (e.badge) {
            pageHome.pushNotification.setApplicationIconBadgeNumber(pageHome.successHandler, e.badge);
        }
    },
    onNotificationGCM: function(e) {
        switch(e.event) {
            case 'registered':
                if (e.regid.length > 0) {
                    var pushToken = localStorage.getItem("pushToken");
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
                            }
                        });
                    }
                }
                break;

            case 'message':
                navigator.notification.alert(e.payload.message, app.alertDismissed, e.payload.title, 'Dismiss');
                break;

            case 'error':
                alert(e.msg);
                break;

            default:
                alert("An error has occurred with our Server. Sorry for the inconvenience.");
                break;
        }
    },
    successHandler: function(result) {
    },
    errorHandler: function(error) {
        alert("An ERROR has occurred while setting up PUSH notifications.");
    },
    changePage: function(url) {
        app.setBackPage("home.html");
        app.displayPage(url);
    },
    launchAlbumsPage: function() {
        if(app.isConnectionAvailable()) {
            if (device.platform == 'android' || device.platform == 'Android') {
                window.open("http://darpan.incorelabs.com/gallery/index.php", "_blank","location=no");
            } else {
                window.open("http://darpan.incorelabs.com/gallery/index.php", "_blank","location=no,closebuttoncaption=Close");
            }
        } else {
            navigator.notification.confirm("You don't have a working internet connection.", pageHome.onOfflineConfirm, 'Offline', ['Try Again','Dismiss']);
        }
    },
    launchAdPage: function() {
        window.open("http://www.cbazaar.in/?utm_source=utmlink&utm_medium=Digital&utm_campaign=Darpanapp", "_system");
    },
    onOfflineConfirm: function(buttonIndex) {
        if(buttonIndex == 1) {
            pageHome.launchAlbumsPage();
        } else {
            return;
        }
    }
}

$(document).ready(function() {
    app.setCurrentPage("home.html");
    pageHome.initPush();
});