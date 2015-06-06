var pageSearchResults = {
    imgError: function(source) {
        source.src = "img/customer.png";
    },
    getParentPage: function (id) {
        app.setBackPage("search_results.html");
        localStorage.setItem("user_id", id);
        if(id % 2 == 0) {
            localStorage.setItem("user_sex", "F");
        }
        else {
            localStorage.setItem("user_sex", "M");
        }
        app.displayPage("parentInfo.html");
    },
    getKidsModal: function (id) {
        $("#kidsHeader").empty();
        $("#kidsBody").empty();
        var kidsHeaderString = "";
        var kidsBodyString = "";
        app.db.transaction(function (tx) {
            var buildKidsColumnNameQuery = "SELECT sql FROM sqlite_master WHERE type='table' AND name ='kids'";
            tx.executeSql(buildKidsColumnNameQuery, [],
                function(tx, r) {
                    var columnParts = r.rows.item(0).sql.replace(/^[^\(]+\(([^\)]+)\)/g, '$1').split(', ');
                    var kidsColumnNames = [];
                    for(var i in columnParts) {
                        if(typeof columnParts[i] === 'string')
                            kidsColumnNames.push(columnParts[i].split(" ")[0]);
                    }
                    kidsColumnNames = kidsColumnNames.slice(2, kidsColumnNames.length).toString();
                    var buildKidsDataQuery = "SELECT "+kidsColumnNames+" FROM kids WHERE id="+id;
                    tx.executeSql(buildKidsDataQuery, [],
                        function(tx, r) {
                            var kidsData = r.rows.item(0);
                            kidsHeaderString += "<div class='row'><div class='col-xs-4'><img src='img/customer.png' class='thumbnail'></div><div class='col-xs-8'>";
                            $.each(kidsData, function(index, val) {
                                if(val != null) {
                                    switch(index) {
                                        case "Name":
                                            kidsHeaderString += "<div class='detailParentName'>"+val+"</div>";
                                            break;
                                        case "DOB":
                                            kidsBodyString += "<div class='row kidsItems'><div class='col-xs-10 col-sm-11 pull-left'><h4  class='infoTitleLabel'>Date of Birth</h4><h5 class='infoTitleDetail'>"+val+"</h5></div><div class='col-xs-2 col-sm-1 pull-right'><span class='glyphicon glyphicon-gift Icon'></span></div></div>";
                                            break;
                                        case "Email":
                                            kidsBodyString += "<div class='row kidsItems'><div class='col-xs-10 col-sm-11 pull-left'><h4 class='infoTitleLabel'>Email</h4><h5 class='infoTitleDetail'>"+val+"</h5></div><div class='col-xs-2 col-sm-1 pull-right'><a data-container='body' data-toggle='popover' data-placement='left' data-content=\"<a href='mailto:"+val+"'><button class='btn btn-primary'>Compose</button></a>\" data-html='true'><span class='glyphicon glyphicon-envelope Icon'></span></a></div></div>";
                                            break;
                                        case "Mobile":
                                            kidsBodyString += "<div class='row kidsItems'><div class='col-xs-10 col-sm-11 pull-left'><h4 class='infoTitleLabel'>Mobile</h4><h5 class='infoTitleDetail'>"+val+"</h5></div><div class='col-xs-2 col-sm-1 pull-right'><a data-container='body' data-toggle='popover' data-placement='left' data-content=\"<a href='tel:"+val+"'><button class='btn btn-primary'>Call</button></a>&nbsp;<a href='sms:"+val+"'><button class='btn btn-success'>SMS</button></a>\" data-html='true'><span class='glyphicon glyphicon-phone Icon'></span></a></div></div>";
                                            break;
                                        case "Blood_Group":
                                            kidsBodyString += "<div class='row kidsItems'><div class='col-xs-10 col-sm-11 pull-left'><h4 class='infoTitleLabel'>Blood Group</h4><h5 class='infoTitleDetail'>"+val+"</h5></div><div class='col-xs-2 col-sm-1 pull-right'><span class='glyphicon glyphicon-tint Icon'></span></div></div>";
                                            break;
                                    }
                                }
                            });
                            kidsHeaderString += "</div></div>";
                            $("#kidsHeader").append(kidsHeaderString);
                            $("#kidsBody").append(kidsBodyString);
                            $('#kidsModal').modal('show');
                            kidsHeaderString = "";
                            kidsBodyString = "";
                        },
                        app.dbQueryError
                    );
                },
                app.dbQueryError
            );
        });
    },
    closeKidsModal: function() {
        $('#kidsModal').modal('hide');
        localStorage.removeItem("openModal");
    }
}
$(document).ready(function() {
    $("#searchMaleData").append(localStorage.getItem("maleResultsData"));
    $("#maleResultsCount").text(localStorage.getItem("maleResultsCount"));
    $("#searchFemaleData").append(localStorage.getItem("femaleResultsData"));
    $("#femaleResultsCount").text(localStorage.getItem("femaleResultsCount"));
    $("#searchKidsData").append(localStorage.getItem("kidsResultsData"));
    $("#kidsResultsCount").text(localStorage.getItem("kidsResultsCount"));
    $('body').removeClass();
    $('#kidsModal').on('shown.bs.modal', function (e) {
        localStorage.setItem("openModal","#kidsModal");
        $("[data-toggle='popover']").popover();
    });
});
$('#searchData').on('shown.bs.collapse', function () {
    $('html, body').animate({scrollTop : 0}, 0);
});
$('body').on('click', function (e) {
    $('[data-toggle="popover"]').each(function () {
        //the 'is' for buttons that trigger popups
        //the 'has' for icons within a button that triggers a popup
        if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
            $(this).popover('hide');
        }
    });
});