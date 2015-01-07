var pageHome = {
    changePage : function(url) {
        app.setBackPage("home.html");
        app.displayPage(url);
    }
}

$(document).ready(function() {
    app.setCurrentPage("home.html");
});