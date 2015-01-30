var searchMiniApp = {
    openSearchForm: function () {
        $("#memberName").val("");
        $("#bloodGroup").val("");
        $("#memberOccupation").val("");
        $('#searchModal').modal('show');
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
        app.db.transaction(function (tx) {
            tx.executeSql(queryString[0], [],
                function(tx, r) {
                    for(var j =0; j< r.rows.length; j++) {
                        resultsID[k] = r.rows.item(j).id;
                        resultsName[k] = r.rows.item(j).Name;
                        k++;
                    }
                    app.db.transaction(function (tx) {
                        tx.executeSql(queryString[1], [],
                            function(tx, r) {
                                for(var j =0; j< r.rows.length; j++) {
                                    resultsID[k] = r.rows.item(j).id;
                                    resultsName[k] = r.rows.item(j).Name;
                                    k++;
                                }
                                if(queryString.length == 3) {               // Kids Data
                                    app.db.transaction(function (tx) {
                                        tx.executeSql(queryString[2], [],
                                            function(tx, r) {
                                                for(var j =0; j< r.rows.length; j++) {
                                                    resultsID[k] = r.rows.item(j).id;
                                                    resultsName[k] = r.rows.item(j).Name;
                                                    k++;
                                                }
                                                searchMiniApp.buildSearchResults(k, resultsID, resultsName);
                                            },
                                            app.dbQueryError
                                        );
                                    });
                                } else {
                                    searchMiniApp.buildSearchResults(k, resultsID, resultsName);
                                }
                            },
                            app.dbQueryError
                        );
                    });
                },
                app.dbQueryError
            );
        });
    },
    buildSearchResults: function (k, resultsID, resultsName) {
        var searchConcatString = "";
        var imgDir = localStorage.getItem("imgDir");
        if(k>0) {
            for(var i=0;i<k;i++) {
                // If you subtract 10000 from the id and yields a positive result then it is a kid else parent.
                if((resultsID[i] - 10000) > 0) {
                    searchConcatString += "<div class='row singleMemberImgAndData'><div class='col-xs-6 singleMemberImgData'><img src='"+imgDir+resultsID[i]+".jpg' class='img-responsive' onerror='pageSearchResults.imgError(this)'></div><div class='col-xs-6 singleData'>";
                    searchConcatString += "<a onclick='pageSearchResults.getKidsModal("+resultsID[i]+")' class='memberLink'><span>"+resultsName[i]+"</span></a></div></div><br/>";
                } else {
                    var imgId = resultsID[i];
                    if(resultsID[i] % 2 == 0) {
                        imgId = imgId - 1;
                    }
                    searchConcatString += "<div class='row singleMemberImgAndData'><div class='col-xs-6 singleMemberImgData'><img src='"+imgDir+imgId+".jpg' class='img-responsive' onerror='pageSearchResults.imgError(this)'></div><div class='col-xs-6 singleData'>";
                    searchConcatString += "<a onclick='pageSearchResults.getParentPage("+resultsID[i]+")' class='memberLink'><span>"+resultsName[i]+"</span></a></div></div><br/>";
                }
            }
        } else {
            searchConcatString = "<div><h2>NO RESULTS FOUND !! </h2></div>"
        }
        app.setBackPage(app.getCurrentPage());
        $('#searchModal').modal('hide');
        localStorage.setItem("searchData", searchConcatString);
        setTimeout(function () {
            app.displayPage("search_results.html");
        },100);
        searchConcatString = "";
    }
}