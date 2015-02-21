var pageRegister = {
	validateCredentials: function() {
		if($("#memberName").val() == "" || $("#memberMobile").val() == "" || $("#memberEmail").val() == "") {
            return false;
        }
        return true;
	},
	registerUser: function() {
		event.preventDefault();
		if(pageRegister.validateCredentials()) {
			var jsonObj = "{\"name\":\""+$("#memberName").val()+"\",\"mobile\":\""+$("#memberMobile").val()+"\",\"email\":\""+$("#memberEmail").val()+"\"}";
			$.post("http://darpan.incorelabs.com/register_user.php", JSON.parse(jsonObj), function(data, textStatus, xhr) {
				data = JSON.parse(data);
	            if(data.success == "1") {
	            	localStorage.setItem("isUserMale","true");
	            	localStorage.setItem("login_user_id", "11");
			        localStorage.setItem("isUserLoggedIn", true);
			        localStorage.removeItem("backLog");
			        app.displayPage("home.html");
	            } else {
	            	navigator.notification.alert("Oops! Error with the Server.", app.alertDismissed, "ERROR", "TRY Again!");
	            }
	        });
		} else {
			navigator.notification.alert("All fields are mandatory.", app.alertDismissed, 'Empty Fields', 'Dismiss');
		}
	}
};