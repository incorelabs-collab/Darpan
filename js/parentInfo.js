var pageParentInfo = {
    checkImage: function(userId) {
        var img = new Image();
        img.onload = function() {
            // code to set the src on success
            $("#DPimage").attr("src", imgURL);
        };
        img.onerror = function() {
            // doesn't exist or error loading
            $("#DPimage").attr("src", "img/customer.png");
        };
        var imgURL = localStorage.getItem("imgDir")+userId+".jpg";
        img.src = imgURL;  // fires off loading of image
    },
    getSpousePage: function(id) {
        $(".popover").remove();
        app.setBackPage("parentInfo.html");
        localStorage.setItem("spouse_id", id);
        if(id % 2 == 0) {
            localStorage.setItem("spouse_sex", "F");
        }
        else {
            localStorage.setItem("spouse_sex", "M");
        }
        app.displayPage("spouseInfo.html");
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
                                            kidsBodyString += "<div class='row kidsItems'><div class='col-xs-10 col-sm-11 pull-left'><h4 class='infoTitleLabel'>Date of Birth</h4><h5 class='infoTitleDetail'>"+val+"</h5></div><div class='col-xs-2 col-sm-1 pull-right'><span class='glyphicon glyphicon-gift Icon'></span></div></div>";
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
};
$(document).ready(function() {
    app.setCurrentPage("parentInfo.html");
    var parentHeaderString = "";
    var parentBodyString = "";
    var kidsOnParentString = "";
    var flag = false;
    app.db.transaction(function (tx) {
        var commonMaleId;
        var spouseUserId;
        var userTableName;
        var spouseTableName;
        var userId = parseInt(localStorage.getItem("user_id"));
        var userSex = localStorage.getItem("user_sex");
        if(userSex == "M") {
            userTableName = "male";
            spouseTableName = "female";
            spouseUserId = userId + 1;
            commonMaleId = userId;
        }
        else {
            userTableName = "female";
            spouseTableName = "male";
            spouseUserId = userId - 1;
            commonMaleId = userId - 1;
        }
        var buildUserColumnNameQuery = "SELECT sql FROM sqlite_master WHERE type='table' AND name = '"+userTableName+"'";
        tx.executeSql(buildUserColumnNameQuery, [],
            function(tx, r) {
                var columnParts = r.rows.item(0).sql.replace(/^[^\(]+\(([^\)]+)\)/g, '$1').split(', ');
                var userColumnNames = [];
                for(var i in columnParts) {
                    if(typeof columnParts[i] === 'string')
                        userColumnNames.push(columnParts[i].split(" ")[0]);
                }
                userColumnNames = userColumnNames.slice(1,(userColumnNames.length-1)).toString();
                var buildUserDataQuery = "SELECT "+userColumnNames+" FROM "+userTableName+" WHERE id="+ userId;
                tx.executeSql(buildUserDataQuery, [],
                    function (tx, r) {
                        var userData = r.rows.item(0);
                        var buildSpouseNameQuery = "SELECT Name FROM "+spouseTableName+" WHERE id="+spouseUserId;
                        tx.executeSql(buildSpouseNameQuery, [],
                            function(tx, r) {
                                var spouseName = r.rows.item(0).Name;
                                var buildCommonColumnNameQuery = "SELECT sql FROM sqlite_master WHERE type='table' AND name = 'common'";
                                tx.executeSql(buildCommonColumnNameQuery, [],
                                    function(tx, r) {
                                        var columnParts = r.rows.item(0).sql.replace(/^[^\(]+\(([^\)]+)\)/g, '$1').split(', ');
                                        var commonColumnNames = [];
                                        for(var i in columnParts) {
                                            if(typeof columnParts[i] === 'string')
                                                commonColumnNames.push(columnParts[i].split(" ")[0]);
                                        }
                                        commonColumnNames = commonColumnNames.slice(1,(commonColumnNames.length-2)).toString();
                                        var buildCommonDataQuery = "SELECT "+commonColumnNames+" FROM common WHERE id="+ commonMaleId;
                                        tx.executeSql(buildCommonDataQuery, [],
                                            function(tx, r) {
                                                var commonData = r.rows.item(0);
                                                var buildKidsNameQuery = "SELECT id, Name FROM kids WHERE parent_id="+commonMaleId;
                                                tx.executeSql(buildKidsNameQuery, [],
                                                    function(tx, r) {
                                                        if(r.rows.length > 0) {
                                                            kidsOnParentString += "<div class='container-fluid listItems bg-primary'><div class='col-xs-12 col-sm-12 pull-left'><h2 class='childrenLabel'>Kids</h2></div></div>";
                                                            for(var i =0;i< r.rows.length; i++) {
                                                                kidsOnParentString += "<div class='container detailContent'><div class='row'><a onclick='pageParentInfo.getKidsModal("+r.rows.item(i).id+")'><div class='col-xs-4'><img src='img/customer.png' class='thumbnail'></div><div class='col-xs-8'><div class='detailKidName'>"+r.rows.item(i).Name+"</div></div></a></div></div>";
                                                            }
                                                            $("#kidsOnParent").append(kidsOnParentString);
                                                        }
                                                        if(userData.has_partner == 1) {
                                                            parentBodyString += "<div class='row listItems'><a onclick='pageParentInfo.getSpousePage("+spouseUserId+")'><div class='col-xs-10 col-sm-11 pull-left'><h4 class='spouseInfoTitleLabel'>Spouse</h4><h5 class='spouseInfoTitleDetail'>"+spouseName+"</h5></div><div class='col-xs-2 col-sm-1 pull-right'><span class='glyphicon glyphicon-chevron-right Icon'></span></div></a></div>";
                                                            parentBodyString += "<div class='row listItems'><div class='col-xs-10 col-sm-11 pull-left'><h4 class='infoTitleLabel'>Date of Marriage</h4><h5 class='infoTitleDetail'>"+commonData.DOM+"</h5></div><div class='col-xs-2 col-sm-1 pull-right'><span class='glyphicon glyphicon-heart Icon'></span></div></div>";
                                                        }
                                                        $.each(userData, function(index, val) {
                                                            if(val != null) {
                                                                switch(index) {
                                                                    case "Name":
                                                                        parentHeaderString += "<br/><div class='row'><div class='col-xs-12'><div class='detailParentName' align='center'>"+val+"</div></div></div>";
                                                                        parentHeaderString += "<div class='row'><div class='col-xs-12' align='center'>";
                                                                        parentHeaderString += "<img class='img-responsive' id='DPimage'></div></div><br/>";
                                                                        break;
                                                                    case "DOB":
                                                                        parentBodyString += "<div class='row listItems'><div class='col-xs-10 col-sm-11 pull-left'><h4 class='infoTitleLabel'>Date of Birth</h4><h5 class='infoTitleDetail'>"+val+"</h5></div><div class='col-xs-2 col-sm-1 pull-right'><span class='glyphicon glyphicon-gift Icon'></span></div></div>";
                                                                        break;
                                                                    case "Email":
                                                                        parentBodyString += "<div class='row listItems'><div class='col-xs-10 col-sm-11 pull-left'><h4 class='infoTitleLabel'>Email</h4><h5 class='infoTitleDetail'>"+val+"</h5></div><div class='col-xs-2 col-sm-1 pull-right'><a data-container='body' data-toggle='popover' data-placement='left' data-content=\"<a href='mailto:"+val+"'><button class='btn btn-primary'>Compose</button></a>\" data-html='true'><span class='glyphicon glyphicon-envelope Icon'></span></a></div></div>";
                                                                        break;
                                                                    case "Mobile":
                                                                        parentBodyString += "<div class='row listItems'><div class='col-xs-10 col-sm-11 pull-left'><h4 class='infoTitleLabel'>Mobile</h4><h5 class='infoTitleDetail'>"+val+"</h5></div><div class='col-xs-2 col-sm-1 pull-right'><a data-container='body' data-toggle='popover' data-placement='left' data-content=\"<a href='tel:"+val+"'><button class='btn btn-primary'>Call</button></a>&nbsp;<a href='sms:"+val+"'><button class='btn btn-success'>SMS</button></a>\" data-html='true'><span class='glyphicon glyphicon-phone Icon'></span></a></div></div>";
                                                                        break;
                                                                    case "Blood_Group":
                                                                        parentBodyString += "<div class='row listItems'><div class='col-xs-10 col-sm-11 pull-left'><h4 class='infoTitleLabel'>Blood Group</h4><h5 class='infoTitleDetail'>"+val+"</h5></div><div class='col-xs-2 col-sm-1 pull-right'><span class='glyphicon glyphicon-tint Icon'></span></div></div>";
                                                                        break;
                                                                    case "Occupation":
                                                                        parentBodyString += "<div class='row listItems'><div class='col-xs-10 col-sm-11 pull-left'><h4 class='infoTitleLabel'>Occupation</h4><h5 class='infoTitleDetail'>"+val+"</h5></div><div class='col-xs-2 col-sm-1 pull-right'><span class='glyphicon glyphicon-briefcase Icon'></span></div></div>";
                                                                        break;
                                                                    case "off_addr1":
                                                                        parentBodyString += "<div class='row listItems'><div class='col-xs-10 col-sm-11 pull-left'><h4 class='infoTitleLabel'>Office Address</h4><h5 class='infoTitleDetail'>"+val+"<br>";
                                                                        flag = true;
                                                                        break;
                                                                    case "off_addr_area":
                                                                        if(flag) {
                                                                            parentBodyString += val +"<br>Chennai ";
                                                                        } else {
                                                                            parentBodyString += "<div class='row listItems'><div class='col-xs-10 col-sm-11 pull-left'><h4 class='infoTitleLabel'>Office Address</h4><h5 class='infoTitleDetail'>"+val+"<br>Chennai ";
                                                                            flag = true;
                                                                        }
                                                                        break;
                                                                    case "off_addr_pin":
                                                                        if(flag) {
                                                                            parentBodyString += "- " + val;
                                                                        } else {
                                                                            parentBodyString += "<div class='row listItems'><div class='col-xs-10 col-sm-11 pull-left'><h4 class='infoTitleLabel'>Office PinCode</h4><h5 class='infoTitleDetail'>"+val;
                                                                        }
                                                                        parentBodyString += "</h5></div><div class='col-xs-2 col-sm-1 pull-right'><span class='glyphicon glyphicon-briefcase Icon'></span></div></div>";
                                                                        break;
                                                                    case "Office_phone":
                                                                        parentBodyString += "<div class='row listItems'><div class='col-xs-10 col-sm-11 pull-left'><h4 class='infoTitleLabel'>Office Phone</h4><h5 class='infoTitleDetail'>"+val+"</h5></div><div class='col-xs-2 col-sm-1 pull-right'><a data-container='body' data-toggle='popover' data-placement='left' data-content=\"<a href='tel:"+val+"'><button class='btn btn-primary'>Call</button></a>\" data-html='true'><span class='glyphicon glyphicon-phone-alt Icon'></span></a></div></div>";
                                                                        break;
                                                                }
                                                            } else if (index == "off_addr_pin") {
                                                                if(flag) {
                                                                    parentBodyString += "</h5></div><div class='col-xs-2 col-sm-1 pull-right'><span class='glyphicon glyphicon-briefcase Icon'></span></div></div>";
                                                                }
                                                            }
                                                        });
                                                        flag = false;
                                                        $.each(commonData, function(index, val) {
                                                            if(val != null) {
                                                                switch(index) {
                                                                    case "res_addr1":
                                                                        parentBodyString += "<div class='row listItems'><div class='col-xs-10 col-sm-11 pull-left'><h4 class='infoTitleLabel'>Residence Address</h4><h5 class='infoTitleDetail'>"+val+"<br>";
                                                                        flag = true;
                                                                        break;
                                                                    case "res_addr_area":
                                                                        if(flag) {
                                                                            parentBodyString += val +"<br>Chennai ";
                                                                        } else {
                                                                            parentBodyString += "<div class='row listItems'><div class='col-xs-10 col-sm-11 pull-left'><h4 class='infoTitleLabel'>Residence Address</h4><h5 class='infoTitleDetail'>"+val+"<br>Chennai ";
                                                                            flag = true;
                                                                        }
                                                                        break;
                                                                    case "res_addr_pin":
                                                                        if(flag) {
                                                                            parentBodyString += "- " + val;
                                                                        } else {
                                                                            parentBodyString += "<div class='row listItems'><div class='col-xs-10 col-sm-11 pull-left'><h4 class='infoTitleLabel'>Residence PinCode</h4><h5 class='infoTitleDetail'>"+val;
                                                                        }
                                                                        parentBodyString += "</h5></div><div class='col-xs-2 col-sm-1 pull-right'><span class='glyphicon glyphicon-home Icon'></span></div></div>";
                                                                        break;
                                                                    case "Residence_Phone":
                                                                        parentBodyString += "<div class='row listItems'><div class='col-xs-10 col-sm-11 pull-left'><h4 class='infoTitleLabel'>Residence Phone</h4><h5 class='infoTitleDetail'>"+val+"</h5></div><div class='col-xs-2 col-sm-1 pull-right'><a data-container='body' data-toggle='popover' data-placement='left' data-content=\"<a href='tel:"+val+"'><button class='btn btn-primary'>Call</button></a>\" data-html='true'><span class='glyphicon glyphicon-earphone Icon'></span></a></div></div>";
                                                                        break;
                                                                }
                                                            } else if (index == "res_addr_pin") {
                                                                if(flag) {
                                                                    parentBodyString += "</h5></div><div class='col-xs-2 col-sm-1 pull-right'><span class='glyphicon glyphicon-home Icon'></span></div></div>";
                                                                }
                                                            }
                                                        });
                                                        parentHeaderString += "</div></div>";
                                                        $("#parentHeader").append(parentHeaderString);
                                                        $("#parentBody").append(parentBodyString);
                                                        pageParentInfo.checkImage(commonMaleId);
                                                        $("[data-toggle='popover']").popover();
                                                        $('#kidsModal').on('shown.bs.modal', function (e) {
                                                            localStorage.setItem("openModal","#kidsModal");
                                                            $("[data-toggle='popover']").popover();
                                                        });
                                                        parentHeaderString = "";
                                                        parentBodyString = "";
                                                        kidsOnParentString = "";
                                                        flag = false;
                                                    },
                                                    app.dbQueryError
                                                );
                                            },
                                            app.dbQueryError
                                        );
                                    },
                                    app.dbQueryError
                                );
                            },
                            app.dbQueryError
                        );
                    },
                    app.dbQueryError
                );
            },
            app.dbQueryError
        );
    });
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