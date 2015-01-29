var pageBnA = {
    getCompareDate: function(compareDay, compareMonth) {
        var compareDate = "";
        if (compareDay < 10) {
            compareDate += "0" + compareDay + "-";
        } else {
            compareDate += compareDay + "-";
        }
        if(compareMonth <10) {
            compareDate += "0" + compareMonth;
        } else {
            compareDate += compareMonth;
        }
        return compareDate;
    },
    getParentPage: function(id) {
        app.setBackPage("BnA.html");
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
    app.setCurrentPage("BnA.html");
    var noMaleBdayToday = false;
    var noMaleBdayTmr = false;
    var noMaleBdayDayAfter = false;
    var noFemaleBdayToday = false;
    var noFemaleBdayTmr = false;
    var noFemaleBdayDayAfter = false;
    var noAsaryToday = false;
    var noAsaryTmr = false;
    var noAsaryDayAfter = false;
    var todayMale = new Date();
    var todayMaleString = "<div class='panel-body'>";
    var tmrMaleString = "<div class='panel-body'>";
    var dayAfterMaleString = "<div class='panel-body'>";
    app.db.transaction(function (tx) {
        var buildDateQuery = "SELECT id, Name FROM male WHERE DOB LIKE '" + pageBnA.getCompareDate(todayMale.getDate(), (todayMale.getMonth() + 1)) +"%'";
        tx.executeSql(buildDateQuery, [],
            function (tx, r) {
                for(var i = 0;i<r.rows.length;i++) {
                    todayMaleString += "<a onclick='pageBnA.getParentPage("+r.rows.item(i).id+")' class='memberLink'><span>"+r.rows.item(i).Name+"</span></a><br/>";
                }
                if(r.rows.length === 0)
                    noMaleBdayToday = true;
                todayMale.setDate(todayMale.getDate() + 1);
                buildDateQuery = "SELECT id, Name FROM male WHERE DOB LIKE '" + pageBnA.getCompareDate(todayMale.getDate(), (todayMale.getMonth() + 1)) +"%'";
                tx.executeSql(buildDateQuery, [],
                    function (tx, r) {
                        for(var i = 0;i<r.rows.length;i++) {
                            tmrMaleString += "<a onclick='pageBnA.getParentPage("+r.rows.item(i).id+")' class='memberLink'><span>"+r.rows.item(i).Name+"</span></a><br/>";
                        }
                        if(r.rows.length === 0)
                            noMaleBdayTmr = true;
                        todayMale.setDate(todayMale.getDate() + 1);
                        buildDateQuery = "SELECT id, Name FROM male WHERE DOB LIKE '" + pageBnA.getCompareDate(todayMale.getDate(), (todayMale.getMonth() + 1)) +"%'";
                        tx.executeSql(buildDateQuery, [],
                            function (tx, r) {
                                for(var i = 0;i<r.rows.length;i++) {
                                    dayAfterMaleString += "<a onclick='pageBnA.getParentPage("+r.rows.item(i).id+")' class='memberLink'><span>"+r.rows.item(i).Name+"</span></a><br/>";
                                }
                                if(r.rows.length === 0)
                                    noMaleBdayDayAfter = true;
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
    var todayFemale = new Date();
    var todayFemaleString = "";
    var tmrFemaleString = "";
    var dayAfterFemaleString = "";
    app.db.transaction(function (tx) {
        var buildDateQuery = "SELECT id, Name FROM female WHERE DOB LIKE '" + pageBnA.getCompareDate(todayFemale.getDate(), (todayFemale.getMonth() + 1)) +"%'";
        tx.executeSql(buildDateQuery, [],
            function (tx, r) {
                for(var i = 0;i<r.rows.length;i++) {
                    todayFemaleString += "<a onclick='pageBnA.getParentPage("+r.rows.item(i).id+")' class='memberLink'><span>"+r.rows.item(i).Name+"</span></a><br/>";
                }
                if(r.rows.length === 0)
                    noFemaleBdayToday = true;
                todayFemaleString += "</div>";
                todayFemale.setDate(todayFemale.getDate() + 1);
                buildDateQuery = "SELECT id, Name FROM female WHERE DOB LIKE '" + pageBnA.getCompareDate(todayFemale.getDate(), (todayFemale.getMonth() + 1)) +"%'";
                tx.executeSql(buildDateQuery, [],
                    function (tx, r) {
                        for(var i = 0;i<r.rows.length;i++) {
                            tmrFemaleString += "<a onclick='pageBnA.getParentPage("+r.rows.item(i).id+")' class='memberLink'><span>"+r.rows.item(i).Name+"</span></a><br/>";
                        }
                        if(r.rows.length === 0)
                            noFemaleBdayTmr = true;
                        tmrFemaleString += "</div>";
                        todayFemale.setDate(todayFemale.getDate() + 1);
                        buildDateQuery = "SELECT id, Name FROM female WHERE DOB LIKE '" + pageBnA.getCompareDate(todayFemale.getDate(), (todayFemale.getMonth() + 1)) +"%'";
                        tx.executeSql(buildDateQuery, [],
                            function (tx, r) {
                                for(var i = 0;i<r.rows.length;i++) {
                                    dayAfterFemaleString += "<a onclick='pageBnA.getParentPage("+r.rows.item(i).id+")' class='memberLink'><span>"+r.rows.item(i).Name+"</span></a><br/>";
                                }
                                if(r.rows.length === 0)
                                    noFemaleBdayDayAfter = true;
                                dayAfterFemaleString += "</div>";
                                if(noMaleBdayToday && noFemaleBdayToday) {
                                    todayMaleString = "<div class='panel-body'>";
                                    todayFemaleString = "No birthdays' Today</div>";
                                }
                                if(noMaleBdayTmr && noFemaleBdayTmr) {
                                    tmrMaleString = "<div class='panel-body'>";
                                    tmrFemaleString = "No birthdays' Tomorrow</div>";
                                }
                                if(noMaleBdayDayAfter && noFemaleBdayDayAfter) {
                                    dayAfterMaleString = "<div class='panel-body'>";
                                    dayAfterFemaleString = "No birthdays' Day After Tomorrow</div>";
                                }
                                $("#todayBday").append(todayMaleString + todayFemaleString);
                                $("#tmrBday").append(tmrMaleString + tmrFemaleString);
                                $("#dayAfterBday").append(dayAfterMaleString + dayAfterFemaleString);
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
    var todayAsary = new Date();
    var todayAsaryString = "<div class='panel-body'>";
    var tmrAsaryString = "<div class='panel-body'>";
    var dayAfterAsaryString = "<div class='panel-body'>";
    app.db.transaction(function (tx) {
        var buildDateQuery = "SELECT m.id m_id, m.Name m_name, f.id f_id, f.Name f_name FROM common c INNER JOIN male m ON c.id = m.id INNER JOIN female f ON m.spouse_id = f.id WHERE c.DOM LIKE '" + pageBnA.getCompareDate(todayAsary.getDate(), (todayAsary.getMonth() + 1)) +"%' ORDER BY m.Name";
        tx.executeSql(buildDateQuery, [],
            function (tx, r) {
                for(var i = 0;i<r.rows.length;i++) {
                    todayAsaryString += "<div class='Asary'>";
                    todayAsaryString += "<a onclick='pageBnA.getParentPage("+r.rows.item(i).m_id+")' class='memberLink'><span>"+r.rows.item(i).m_name+"</span></a><br/>";
                    todayAsaryString += "<a onclick='pageBnA.getParentPage("+r.rows.item(i).f_id+")' class='memberLink'><span>"+r.rows.item(i).f_name+"</span></a></div><br/>";
                }
                if(r.rows.length === 0)
                    noAsaryToday = true;
                todayAsaryString += "</div>";
                todayAsary.setDate(todayAsary.getDate() + 1);
                buildDateQuery = "SELECT m.id m_id, m.Name m_name, f.id f_id, f.Name f_name FROM common c INNER JOIN male m ON c.id = m.id INNER JOIN female f ON m.spouse_id = f.id WHERE c.DOM LIKE '" + pageBnA.getCompareDate(todayAsary.getDate(), (todayAsary.getMonth() + 1)) +"%' ORDER BY m.Name";
                tx.executeSql(buildDateQuery, [],
                    function (tx, r) {
                        for(var i = 0;i<r.rows.length;i++) {
                            tmrAsaryString += "<div class='Asary'>";
                            tmrAsaryString += "<a onclick='pageBnA.getParentPage("+r.rows.item(i).m_id+")' class='memberLink'><span>"+r.rows.item(i).m_name+"</span></a><br/>";
                            tmrAsaryString += "<a onclick='pageBnA.getParentPage("+r.rows.item(i).f_id+")' class='memberLink'><span>"+r.rows.item(i).f_name+"</span></a></div><br/>";
                        }
                        if(r.rows.length === 0)
                            noAsaryTmr = true;
                        tmrAsaryString += "</div>";
                        todayAsary.setDate(todayAsary.getDate() + 1);
                        buildDateQuery = "SELECT m.id m_id, m.Name m_name, f.id f_id, f.Name f_name FROM common c INNER JOIN male m ON c.id = m.id INNER JOIN female f ON m.spouse_id = f.id WHERE c.DOM LIKE '" + pageBnA.getCompareDate(todayAsary.getDate(), (todayAsary.getMonth() + 1)) +"%' ORDER BY m.Name";
                        tx.executeSql(buildDateQuery, [],
                            function (tx, r) {
                                for(var i = 0;i<r.rows.length;i++) {
                                    dayAfterAsaryString += "<div class='Asary'>";
                                    dayAfterAsaryString += "<a onclick='pageBnA.getParentPage("+r.rows.item(i).m_id+")' class='memberLink'><span>"+r.rows.item(i).m_name+"</span></a><br/>";
                                    dayAfterAsaryString += "<a onclick='pageBnA.getParentPage("+r.rows.item(i).f_id+")' class='memberLink'><span>"+r.rows.item(i).f_name+"</span></a></div><br/>";
                                }
                                if(r.rows.length === 0)
                                    noAsaryDayAfter = true;
                                dayAfterAsaryString += "</div>";
                                if(noAsaryToday) {
                                    todayAsaryString = "<div class='panel-body'>No anniversary Today</div>";
                                }
                                if(noAsaryTmr) {
                                    tmrAsaryString = "<div class='panel-body'>No anniversary Tomorrow</div>";
                                }
                                if(noAsaryDayAfter) {
                                    dayAfterAsaryString = "<div class='panel-body'>No anniversary Day After Tomorrow</div>";
                                }
                                $("#todayAsary").append(todayAsaryString);
                                $("#tmrAsary").append(tmrAsaryString);
                                $("#dayAfterAsary").append(dayAfterAsaryString);
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