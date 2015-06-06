var pageLogin = {
    validateCredentials: function() {
        var user_name_value = $("#username").val().trim();
        var password_value = $("#password").val().trim();
        app.db.transaction(function (tx) {
            var buildUserValidateQuery = "SELECT COUNT(user_id) count, user_id FROM users WHERE username='"+user_name_value+"' AND password='"+password_value+"'";
            tx.executeSql(buildUserValidateQuery, [], function (tx, r) {
                if(r.rows.item(0).count < 1) {
                    navigator.notification.alert("The username or password do not match", app.alertDismissed, "Wrong Credentials", "Try Again");
                    $("#username").val("");
                    $("#password").val("");
                }
                else {
                    var user_id_value = parseInt(r.rows.item(0).user_id);
                    if(user_id_value % 2 === 1 && user_id_value<10000) {
                        localStorage.setItem("isUserMale","true");
                    } else {
                        localStorage.setItem("isUserMale","false");
                    }
                    localStorage.setItem("login_user_id", user_id_value);
                    pageLogin.onLoginSuccess();
                }
            }, app.dbQueryError);
        });
    },
    onLoginSuccess: function() {
        localStorage.setItem("isUserLoggedIn", true);
        app.displayPage("home.html");
    }
};