var searchMiniApp = {
    openSearchForm: function () {
        $("#memberName").val("");
        $("#bloodGroup").val("");
        $("#memberOccupation").val("");
        $('#searchModal').on('shown.bs.modal', function (e) {
            localStorage.setItem("openModal","#searchModal");
        });
        $('#searchModal').modal('show');
    },
    closeSearchModal: function() {
        $('#searchModal').modal('hide');
        localStorage.removeItem("openModal");
    },
    validateSearchForm: function() {
        if($("#memberName").val() == "" && $("#bloodGroup").val() == "" && $("#memberOccupation").val() == "") {
            navigator.notification.alert("Please choose a Search criteria.", app.alertDismissed, 'Search Criteria Missing', 'Try Again');
        } else {
            searchMiniApp.search();
        }
    },
    search: function() {
        var activeFields = [];
        var searchData = $('#searchForm').serializeArray();
        var i = 0;
        $.each(searchData, function(index, val) {
            if(val.value != "") {
                activeFields[i] = true;
            } else {
                activeFields[i] = false;
            }
            i++;
        });
        var memberName = $("#memberName").val();
        var bloodGroup = $("#bloodGroup").val();
        var memberOccupation = $("#memberOccupation").val();
        var queryString = [];
        queryString[0] = "SELECT id, Name FROM male WHERE";
        queryString[1] = "SELECT id, Name FROM female WHERE";
        queryString[2] = "SELECT id, Name FROM kids WHERE";
        var nameQueryString = "Name LIKE '%"+memberName+"%'";
        var bloodQueryString = "Blood_Group = '"+bloodGroup+"'";
        var occupationQueryString = "Occupation LIKE '%"+memberOccupation+"%'";
        if(activeFields[0]) {
            queryString[0] += " " + nameQueryString;
            queryString[1] += " " + nameQueryString;
            queryString[2] += " " + nameQueryString;
            if(activeFields[1]) {
                queryString[0] += " AND "+bloodQueryString;
                queryString[1] += " AND "+bloodQueryString;
                queryString[2] += " AND "+bloodQueryString;
                if(activeFields[2]) {
                    queryString[0] += " AND "+occupationQueryString;
                    queryString[1] += " AND "+occupationQueryString;
                    queryString.pop();                                  //   Kids have no occupation.
                }
            }
        }
        else if(activeFields[1]) {
            queryString[0] += " " + bloodQueryString;
            queryString[1] += " " + bloodQueryString;
            queryString[2] += " " + bloodQueryString;
            if(activeFields[2]) {
                queryString[0] += " AND "+occupationQueryString;
                queryString[1] += " AND "+occupationQueryString;
                queryString.pop();                                      //   Kids have no occupation.
            }
        }
        else if(activeFields[2]) {
            queryString[0] += " " + occupationQueryString;
            queryString[1] += " " + occupationQueryString;
            queryString.pop();                                          //   Kids have no occupation.
        }
        var k = 0;
        var resultsID = [];
        var resultsName = [];

        var maleResults = {id:[], name:[]};
        var femaleResults = {id:[], name:[]};
        var kidsResults = {id:[], name:[]};

        app.db.transaction(function(tx){
            var defMale = $.Deferred();
            var defFemale = $.Deferred();
            var defKids = $.Deferred();
            tx.executeSql(queryString[0],[],
                function(tx, r){
                    for(var j =0; j< r.rows.length; j++) {
                        maleResults.id[j] = r.rows.item(j).id;
                        maleResults.name[j] = r.rows.item(j).Name;
                    }
                    defMale.resolve();
                },
                app.dbQueryError
            );
            tx.executeSql(queryString[1],[],
                function(tx, r){
                    for(var j =0; j< r.rows.length; j++) {
                        femaleResults.id[j] = r.rows.item(j).id;
                        femaleResults.name[j] = r.rows.item(j).Name;
                    }
                    defFemale.resolve();
                },
                app.dbQueryError
            );

            if(queryString.length > 2) {
                tx.executeSql(queryString[2],[],
                    function(tx, r){
                        for(var j =0; j< r.rows.length; j++) {
                            kidsResults.id[j] = r.rows.item(j).id;
                            kidsResults.name[j] = r.rows.item(j).Name;
                        }
                        defKids.resolve();
                    },
                    app.dbQueryError
                );
                $.when(defMale, defFemale, defKids).done(function() {
                    searchMiniApp.buildSearchResults(maleResults, femaleResults, kidsResults);
                });
            } else {
                $.when(defMale, defFemale).done(function() {
                    searchMiniApp.buildSearchResults(maleResults, femaleResults, kidsResults);
                });

            }
        });
    },
    buildSearchResults: function (maleResults, femaleResults, kidsResults) {
        var imgDir = localStorage.getItem("imgDir");

        localStorage.removeItem("maleResultsCount");
        localStorage.removeItem("femaleResultsCount");
        localStorage.removeItem("kidsResultsCount");

        localStorage.setItem("maleResultsCount", maleResults.id.length);
        if(maleResults.id.length > 0) {
            var resultHTML = "";
            for(var i=0, dataLength=maleResults.id.length; i<dataLength; i++) {
                resultHTML += "<br/><div class='searchBlock'><div class='row'><div class='col-xs-10 col-xs-offset-1'><img src='"+imgDir+maleResults.id[i]+".jpg' class='img-responsive' onerror='pageSearchResults.imgError(this)'></div></div><br/><div class='row'><div class='col-xs-12'><a onclick='pageSearchResults.getParentPage("+maleResults.id[i]+")' class='memberLink'><span>"+maleResults.name[i]+"</span></a></div></div></div>";
            }
            localStorage.setItem("maleResultsData", resultHTML);
        } else {
            localStorage.setItem("maleResultsData", "<div><h4>No male members with the specified search criteria.</h4></div>");
        }

        localStorage.setItem("femaleResultsCount", femaleResults.id.length);
        if(femaleResults.id.length > 0) {
            var resultHTML = "";
            for(var i=0, dataLength=femaleResults.id.length; i<dataLength; i++) {
                resultHTML += "<br/><div class='searchBlock'><div class='row'><div class='col-xs-10 col-xs-offset-1'><img src='"+imgDir+(femaleResults.id[i]-1)+".jpg' class='img-responsive' onerror='pageSearchResults.imgError(this)'></div></div><br/><div class='row'><div class='col-xs-12'><a onclick='pageSearchResults.getParentPage("+femaleResults.id[i]+")' class='memberLink'><span>"+femaleResults.name[i]+"</span></a></div></div></div>";
            }
            localStorage.setItem("femaleResultsData", resultHTML);
        } else {
            localStorage.setItem("femaleResultsData", "<div><h4>No female members with the specified search criteria.</h4></div>");
        }

        localStorage.setItem("kidsResultsCount", kidsResults.id.length);
        if(kidsResults.id.length > 0) {
            var resultHTML = "";
            for(var i=0, dataLength=kidsResults.id.length; i<dataLength; i++) {
                resultHTML += "<br/><div class='searchBlock'><div class='row'><div class='col-xs-10 col-xs-offset-1'><img src='"+imgDir+kidsResults.id[i]+".jpg' class='img-responsive' onerror='pageSearchResults.imgError(this)'></div></div><br/><div class='row'><div class='col-xs-12'><a onclick='pageSearchResults.getKidsModal("+kidsResults.id[i]+")' class='memberLink'><span>"+kidsResults.name[i]+"</span></a></div></div></div>";
            }
            localStorage.setItem("kidsResultsData", resultHTML);
        } else {
            localStorage.setItem("kidsResultsData", "<div><h4>No kids with the specified search criteria.</h4></div>");
        }
        
        app.setBackPage(app.getCurrentPage());
        $('#searchModal').modal('hide');
        localStorage.removeItem("openModal");
        setTimeout(function () {
            app.displayPage("search_results.html");
        },100);
    }
}