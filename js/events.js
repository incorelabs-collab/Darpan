var pageEvents = {
    setRsvpEntry: function(data) {
        localStorage.setItem("rsvp_event_id", document.getElementById(data).dataset.eventId);
        localStorage.setItem("rsvp_button", data);
        document.getElementById("rsvp_form").reset();
    },
    isRsvpDone: function(rsvp_array) {
        for(var i in rsvp_array) {
            if(rsvp_array[i] == localStorage.getItem("temp_rsvp_id"))
                return true;
        }
        return false;
    }
};
$(document).ready(function() {
    app.setCurrentPage("events.html");
    var eventConcatString = "";
    var anEventString = "anEvent";
    var collapseString = "collapse";
    var eventDataConcatString = "eventData";
    var j = 0;
    app.db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM events", [],
            function (tx, r) {
                if(r.rows.length > 0) {
                    if(localStorage.getItem("rsvp_done_string") == null){
                        localStorage.setItem("rsvp_done_string", "");
                    }
                    var rsvp_done_array = localStorage.getItem("rsvp_done_string").split(",");
                    rsvp_done_array.pop();
                    for(var i in rsvp_done_array) {
                        if(parseInt(rsvp_done_array[i]) < parseInt(r.rows.item(0).id)) {
                            rsvp_done_array.splice(i,1);
                        }
                    }
                    eventConcatString += "<div class='panel-group' id='"+anEventString+"'>";
                    for(var i =0;i< r.rows.length; i++) {
                        eventConcatString += "<div class='panel panel-default'><div class='panel-heading'><h4 class='panel-title'>";
                        $.each(r.rows.item(i), function(index, val) {
                            if(val != null) {
                                switch(index) {
                                    case "Title":
                                        eventConcatString += "<a data-toggle='collapse' data-parent='#"+anEventString+"' href='#"+collapseString+j+"' class='eventBdayFont'>"+val+"</a></h4></div>";
                                        eventConcatString += "<div id='"+collapseString+j+"' class='panel-collapse collapse'><div class='panel-body'><div class='panel-group' id='"+eventDataConcatString+i+"'>";
                                        j++;
                                        break;
                                    case "Description":
                                        eventConcatString += "<div class='panel panel-info'><div class='panel-heading'><h4 class='panel-title'>";
                                        eventConcatString += "<a data-toggle='collapse' data-parent='#"+eventDataConcatString+i+"' href='#"+collapseString+j+"' class='eventBdayFont'>"+index+"</a></h4></div>";
                                        eventConcatString += "<div id='"+collapseString+j+"' class='panel-collapse collapse in'><div class='panel-body'>"+val+"</div></div></div>";
                                        j++;
                                        break;
                                    case "Date":
                                        eventConcatString += "<div class='panel panel-info'><div class='panel-heading'><h4 class='panel-title'>";
                                        eventConcatString += "<a data-toggle='collapse' data-parent='#"+eventDataConcatString+i+"' href='#"+collapseString+j+"' class='eventBdayFont'>Time</a></h4></div>";
                                        eventConcatString += "<div id='"+collapseString+j+"' class='panel-collapse collapse'><div class='panel-body'>"+val;
                                        break;
                                    case "Time":
                                        eventConcatString += " At "+val+"</div></div></div>";
                                        j++;
                                        break;
                                    case "Location":
                                        eventConcatString += "<div class='panel panel-info'><div class='panel-heading'><h4 class='panel-title'>";
                                        eventConcatString += "<a data-toggle='collapse' data-parent='#"+eventDataConcatString+i+"' href='#"+collapseString+j+"' class='eventBdayFont'>"+index+"</a></h4></div>";
                                        eventConcatString += "<div id='"+collapseString+j+"' class='panel-collapse collapse'><div class='panel-body'>"+val+"</div></div></div>";
                                        j++;
                                        break;
                                    case "Dress_Code":
                                        eventConcatString += "<div class='panel panel-info'><div class='panel-heading'><h4 class='panel-title'>";
                                        eventConcatString += "<a data-toggle='collapse' data-parent='#"+eventDataConcatString+i+"' href='#"+collapseString+j+"' class='eventBdayFont'>Dress Code</a></h4></div>";
                                        eventConcatString += "<div id='"+collapseString+j+"' class='panel-collapse collapse'><div class='panel-body'>"+val+"</div></div></div>";
                                        j++;
                                        break;
                                }
                            }
                        });
                        eventConcatString += "</div></div></div>";
                        localStorage.setItem("temp_rsvp_id", r.rows.item(i).id);
                        if(app.getBoolean(localStorage.getItem("isUserMale")) === true && pageEvents.isRsvpDone(rsvp_done_array) != true) {
                            eventConcatString += "<br/><div class='rsvpBlock'><button type='button' class='btn btn-primary' id='rsvpBtn"+i+"' data-toggle='modal' data-target='#rsvpModal' data-event-id='"+r.rows.item(i).id+"' onclick=\"pageEvents.setRsvpEntry('rsvpBtn"+i+"')\">R.S.V.P.</button></div>";
                        }
                        eventConcatString += "</div><br/>";
                    }
                    eventConcatString += "</div>";
                } else {
                    navigator.notification.alert("We've got exciting events lined up, stay tuned.", app.onBackKeyDown, "Out of Stock", 'Go Back');
                }
                $(".homeContent").append(eventConcatString);
                eventConcatString = "";
            },
            app.dbQueryError
        );
    });
});
$('form').on('submit', function(e){
    e.preventDefault();
    var fields = $(this).serializeArray();
    var jsonObj = "{\"male_id\":\""+localStorage.getItem("login_user_id")+"\",\"event_id\":\""+localStorage.getItem("rsvp_event_id")+"\",";
    $.each( fields, function(i, field) {
        jsonObj += "\""+field.name+"\":\""+field.value+"\",";
    });
    jsonObj = jsonObj.slice(0,-1);
    jsonObj += "}";
    if(app.isConnectionAvailable()) {
        $.post("http://darpan.incorelabs.com/rsvp.php", JSON.parse(jsonObj), function(data, textStatus, xhr) {
            $('#rsvpModal').modal('hide');
            if(data == "1") {
                navigator.notification.alert("Your response has been submitted. Thank - you.", app.alertDismissed, "R.S.V.P.");
                $("#"+localStorage.getItem("rsvp_button")).parent().remove();
                localStorage.setItem("rsvp_done_string",(localStorage.getItem("rsvp_done_string")+localStorage.getItem("rsvp_event_id")+","));
            } else if(data == "2") {
                navigator.notification.alert("You have ALREADY sent us this data. Thank - you.", app.alertDismissed, "DUPLICATE Response !!!");
                $("#"+localStorage.getItem("rsvp_button")).parent().remove();
                localStorage.setItem("rsvp_done_string",(localStorage.getItem("rsvp_done_string")+localStorage.getItem("rsvp_event_id")+","));
            } else if(data == "0") {
                navigator.notification.alert("Oops! Error with the Server.", app.alertDismissed, "TRY Again!");
            }
        });
    } else {
        alert("No Internet Connection. Try Again Later!");
    }
});