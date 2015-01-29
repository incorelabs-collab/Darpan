var pageDirectors = {
    getDirParentPage: function(id) {
        app.setBackPage("directors.html");
        localStorage.setItem("user_id", id);
        if(id % 2 == 0) {
            localStorage.setItem("user_sex", "F");
        }
        else {
            localStorage.setItem("user_sex", "M");
        }
        app.displayPage("parentInfo.html");
    }
};
$(document).ready(function() {
    app.setCurrentPage("directors.html");
    var directorConcatString = "";
    app.db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM directors", [],
            function (tx, r) {
                for(var i =0;i< r.rows.length; i++) {
                    directorConcatString += "<li class='list-group-item'><div class='col-xs-6'>"+r.rows.item(i).type+"</div><div class='col-xs-6'><a onclick='pageDirectors.getDirParentPage("+r.rows.item(i).member_id+")' class='linkColor'>"+r.rows.item(i).member_name+"</a></div></li>";
                }
                $(".list-group").append(directorConcatString);
                directorConcatString = "";
            }, app.dbQueryError);
    });
});