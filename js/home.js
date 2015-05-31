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
                navigator.notification.alert(e.msg, app.alertDismissed, "Error", "Dismiss");
                break;

            default:
                navigator.notification.alert("An error has occurred with our Server. Sorry for the inconvenience.", app.alertDismissed, "Connection Error", "Dismiss");
                break;
        }
    },
    successHandler: function(result) {
    },
    errorHandler: function(error) {
        navigator.notification.alert("An ERROR has occurred while setting up PUSH notifications.", app.alertDismissed, "PUSH Notification Error", "Dismiss");
    },
    changePage: function(url) {
        app.setBackPage("home.html");
        app.displayPage(url);
    },
    launchAlbumsPage: function() {
        if(app.isConnectionAvailable()) {
            if (device.platform == 'android' || device.platform == 'Android') {
                pageHome.gallery_ref = window.open("http://darpan.incorelabs.com/gallery/index.php", "_blank","location=no,hidden=yes,zoom=no");
            } else {
                pageHome.gallery_ref = window.open("http://darpan.incorelabs.com/gallery/index.php", "_blank","location=no,closebuttoncaption=Close,hidden=yes");
            }
            pageHome.gallery_ref.addEventListener('loadstart', pageHome.galleryLoadStart);
            pageHome.gallery_ref.addEventListener('loaderror', pageHome.galleryLoadError);
            pageHome.gallery_ref.addEventListener('loadstop', pageHome.galleryLoadStop);
            pageHome.gallery_ref.addEventListener('exit', pageHome.galleryExit);
            setTimeout(function() {
                if(localStorage.getItem("galleryLoading") == "true") {
                    localStorage.removeItem("galleryLoading");
                    pageHome.gallery_ref.removeEventListener('loadstart', pageHome.galleryLoadStart);
                    pageHome.gallery_ref.removeEventListener('loaderror', pageHome.galleryLoadError);
                    pageHome.gallery_ref.removeEventListener('loadstop', pageHome.galleryLoadStop);
                    pageHome.gallery_ref.removeEventListener('exit', pageHome.galleryExit);
                    pageHome.gallery_ref.close();
                    pageHome.gallery_error_flag = false;
                    if (device.platform == 'android' || device.platform == 'Android') {
                        window.plugins.spinnerDialog.hide();
                    } else {
                        ProgressIndicator.hide();
                    }
                    navigator.notification.confirm("Would you like to Try Again ?", pageHome.onGalleryConfirm, 'Try Again', ['Retry','Cancel']);
                }
            }, 15000);
        } else {
            navigator.notification.confirm("You don't have a working internet connection.", pageHome.onGalleryConfirm, 'Offline', ['Try Again','Dismiss']);
        }
    },
    launchAdPage: function() {
        window.open("http://www.cbazaar.in/?utm_source=utmlink&utm_medium=Digital&utm_campaign=Darpanapp", "_system");
    },
    onGalleryConfirm: function(buttonIndex) {
        if(buttonIndex == 1) {
            pageHome.launchAlbumsPage();
        } else {
            return;
        }
    },
    gallery_ref: {},
    gallery_error_flag: false,
    galleryLoadStart: function(event) {
        localStorage.setItem("galleryLoading",true);
        if (device.platform == 'android' || device.platform == 'Android') {
            window.plugins.spinnerDialog.show("Please Wait", "Loading...", true);
        } else {
            ProgressIndicator.showSimpleWithLabel(true, "Loading...");
        }
    },
    galleryLoadError: function(event) {
        pageHome.gallery_error_flag = true;
    },
    galleryLoadStop: function(event) {
        localStorage.removeItem("galleryLoading");
        if (device.platform == 'android' || device.platform == 'Android') {
            window.plugins.spinnerDialog.hide();
        } else {
            ProgressIndicator.hide();
        }

        pageHome.gallery_ref.removeEventListener('loaderror', pageHome.galleryLoadError);

        if(pageHome.gallery_error_flag) {
            pageHome.gallery_ref.removeEventListener('loadstart', pageHome.galleryLoadStart);
            pageHome.gallery_ref.removeEventListener('loadstop', pageHome.galleryLoadStop);
            pageHome.gallery_ref.removeEventListener('exit', pageHome.galleryExit);
            pageHome.gallery_ref.close();
            pageHome.gallery_error_flag = false;
            navigator.notification.confirm("Would you like to Try Again ?", pageHome.onGalleryConfirm, 'Try Again', ['Retry','Cancel']);

        } else {
            pageHome.gallery_ref.show();
        }
    },
    galleryExit: function(event) {
        pageHome.gallery_ref.removeEventListener('loadstart', pageHome.galleryLoadStart);
        pageHome.gallery_ref.removeEventListener('loadstop', pageHome.galleryLoadStop);
        pageHome.gallery_ref.removeEventListener('exit', pageHome.galleryExit);
    }
}

$(document).ready(function() {
    app.setCurrentPage("home.html");
    pageHome.initPush();
});