let rating;
let taskStatusElement = null;
let previousStatus;
let spinner;

const scheduleOfCharges = window.taskData.scheduleOfCharges;
const htmlDecodedScheduleOfCharges = scheduleOfCharges.replace(/&#x27;/g, "'");
const jsonReadyScheduleOfCharges = htmlDecodedScheduleOfCharges.replace(/'/g, '"');
const parsedScheduleOfCharges = JSON.parse(jsonReadyScheduleOfCharges);

function expCommentHistoryToPDF() {
    const element = document.getElementById("history");

    html2pdf().from(element).save(`Task${window.taskData.taskid}.pdf`);
}

// To access the stars
let stars =
    document.getElementsByClassName("star");

// Funtion to update rating
function gfg(n) {
    remove();
    for (let i = 0; i < n; i++) {
        if (n == 1) cls = "one";
        else if (n == 2) cls = "two";
        else if (n == 3) cls = "three";
        else if (n == 4) cls = "four";
        else if (n == 5) cls = "five";
        stars[i].className = "star " + cls;
    }

}
// To remove the pre-applied styling
function remove() {
    let i = 0;
    while (i < 5) {
        stars[i].className = "star";
        i++;
    }
}

// Set this to the width of one star.
var starWidth = 40;

$.fn.stars = function () {

    return $(this).each(function () {
        $(this).html($('<span />').width(Math.max(0, (Math.min(5, parseFloat($(this).html())))) * starWidth));
        $(this).html($('<span />').width(Math.max(0, (Math.min(5, parseFloat($(this).attr('title'))))) * starWidth));

    });
}

function releaseTask() {
    let result = confirm("Are you sure you would like to release this task? If you release this task before it is completed, you won't receive any fees for this task.")

    if (result) {
        $("#assigned_userid_select").val(window.taskData.adminUserId).trigger('change');
        $("#assigned_userid").val(window.taskData.adminUserId)
        $("#submitButton").click();
    }
}

function handleAssignedUserIDChange(selectElement) {
    console.log("Assigned User ID: " + selectElement.value);
    $("#assigned_userid").val(selectElement.value);



    if (selectElement.value != '') {
        fetch(`/kbuploader/getUserFullName/${selectElement.value}/`)
            .then(response => response.json())
            .then(data => {
                $("#assigned_user_full_name").text(data['message'])
            })

        fetch(`/kbuploader/getUserRating/${selectElement.value}/`)
            .then(response => response.json())
            .then(data => {
                console.log(parseFloat(data['message']))
                rating = parseFloat(data['message']).toFixed(2)
                console.log(rating)

                $("#ratingSpanP2").html(`<span title="${rating}" class="stars"><span style="width: 148px;">${rating}</span></span>`).trigger('change')

                $('span.stars').stars().trigger('change');
            });
    }
}

function handleTaskStatusChange(selectElement, event) {
    console.log("Status: " + selectElement.options[selectElement.selectedIndex]?.text);

    paymentReceived = window.taskData.paymentReceived

    if (selectElement.options[selectElement.selectedIndex]?.text == "In Progress") {



        if (paymentReceived != "True") {
            if (window.taskData.userId != parseInt(window.taskData.assigned_userid)
                || window.taskData.userId == parseInt(window.taskData.adminUserId)) {

                var result = confirm("Are you sure you want to mark this task as In Progress? Please note that initiating a task requires advance payment. If you're not satisfied with the quality of work delivered by the assigned professional, you may request a rework or a refund. Once they confirm your request, the system may proceed with issuing a refund.")

                if (result) {
                    email = $("#email").val()
                    phone = $("#phone").val()
                    amount = $("#taskFees").val()
                    const encodedEmail = encodeURIComponent(email);
                    const encodedPhone = encodeURIComponent(phone);
                    taskid = $("#taskid").val();
                    const encodedTaskId = encodeURIComponent(taskid);
                    const encodedAmount = encodeURIComponent(amount);
                    const baseUrl = window.taskData.paymentBaseUrl;
                    console.log(`${baseUrl}?email=${encodedEmail}&phone=${encodedPhone}&taskid=${encodedTaskId}&amount=${encodedAmount}`);
                    window.location.href = `${baseUrl}?email=${encodedEmail}&phone=${encodedPhone}&taskid=${encodedTaskId}&amount=${encodedAmount}`;
                    return
                }
                else {
                    event.preventDefault();
                    taskStatusElement.value = previousStatus;
                }
            }
        }

    }



    if (selectElement.options[selectElement.selectedIndex]?.text == "Complete") {
        if (paymentReceived != "True") {
            appendAlert("Payment is not received for this task yet. This task may not be marked as complete.", "danger")
            return
        }

        var result = confirm("Are you sure you would like to mark this task as complete? Once you do this, it will be a read-only task and you won't be able to modify it.")

        if (!result) {
            event.preventDefault();
            taskStatusElement.value = previousStatus;

        } else {

            let originator_userid = parseInt($("#originator_userid").val())


            if (userId != originator_userid) {
                appendAlert('Only the originator can mark the task as complete', "warning")
                event.preventDefault();
                taskStatusElement.value = previousStatus;

                return;
            }

            previousStatus = taskStatusElement.value;
        }
    }
}

function handleTaskTypeChange(selectElement) {
    $("#taskType").val(selectElement.value);

    let price = getPriceFromTaskTypeInt(selectElement.options[selectElement.selectedIndex]?.value)

    if (selectElement.options[selectElement.selectedIndex]?.text == "Custom") {
        $("#taskFees").removeAttr("readonly")
        $("#taskFees").val(price)
    }
    else {
        $("#taskFees").val(price)
        $("#taskFees").attr("readonly", "readonly")
    }
}

function getPriceFromTaskTypeInt(id) {
    let price = 0
    if (parsedScheduleOfCharges) {

        parsedScheduleOfCharges.forEach(item => {
            if (id == item.id) {
                price = item.price;
            }
        });
    }

    return price
}


function taskPayButtonClick() {
    paymentReceived = window.taskData.paymentReceived

    if (paymentReceived != "True") {
        if (window.taskData.userId != parseInt(window.taskData.assigned_userid)
            || window.taskData.userId == parseInt(window.taskData.adminUserId)) {

            var result = confirm("Are you sure you would like to pay the fees for this task? Please note that initiating a task requires advance payment. If you're not satisfied with the quality of work delivered by the assigned professional, you may request a rework or a refund. Once they confirm your request, the system may proceed with issuing a refund.")

            if (result) {
                email = $("#email").val()
                phone = $("#phone").val()
                amount = $("#taskFees").val()
                const encodedEmail = encodeURIComponent(email);
                const encodedPhone = encodeURIComponent(phone);
                taskid = $("#taskid").val();
                const encodedTaskId = encodeURIComponent(taskid);
                const encodedAmount = encodeURIComponent(amount);
                const baseUrl = window.taskData.paymentBaseUrl;
                console.log(`${baseUrl}?email=${encodedEmail}&phone=${encodedPhone}&taskid=${encodedTaskId}&amount=${encodedAmount}`);
                window.location.href = `${baseUrl}?email=${encodedEmail}&phone=${encodedPhone}&taskid=${encodedTaskId}&amount=${encodedAmount}`;
                return
            }
        }
    }
}


$(document).ready(function () {
    paymentReceived = window.taskData.paymentReceived

    if (paymentReceived != "True") {
        if (window.taskData.userId == parseInt($("#assigned_userid").val())
            && window.taskData.userId != parseInt(window.taskData.adminUserId)) {
            $("#taskPayButton").attr("disabled", "disabled")
            console.log("Task pay button disabled")
        }
        else {
            if (window.taskData.taskStatus == "") {
                $("#taskPayButton").attr("disabled", "disabled")
                console.log("Task pay button disabled")
            }
            else if (window.taskData.taskStatus == "In Progress") {
                $("#taskPayButton").removeAttr("disabled")
                console.log("Task pay button enabled")
            }
            else {
                $("#taskPayButton").attr("disabled", "disabled")
                console.log("Task pay button disabled")
            }
        }
    }
    spinner = document.getElementById('mySpinner');
    spinner.style.display = 'none';

    $("#taskStatus").val(window.taskData.taskStatus);
    let assignedUserID = parseInt(window.taskData.assigned_userid)

    if (assignedUserID > 0) {
        fetch(`/kbuploader/getUserFullName/${assignedUserID}/`)
            .then(response => response.json())
            .then(data => {
                $("#assigned_user_full_name").text(data['message'])
            })
    }

    let originator = parseInt($("#originator_userid").val())

    if (originator > 0) {
        fetch(`/kbuploader/getUserFullName/${originator}/`)
            .then(response => response.json())
            .then(data => {
                $("#originator_user_full_name").text(data['message'])
            })
    }

    userId = parseInt(window.taskData.userId)




    console.log("Task fees: ", $("#taskFees").val())

    







    fetch(`/kbuploader/getUserRating/${assignedUserID}/`)
        .then(response => response.json())
        .then(data => {
            console.log(parseFloat(data['message']))
            rating = parseFloat(data['message']).toFixed(2)
            console.log(rating)

            $("#ratingSpanP2").html(`<span title="${rating}" class="stars"><span style="width: 148px;">${rating}</span></span>`).trigger('change')
            $('span.stars').stars().trigger('change');
        });

    const inputBox = document.getElementById('inputBox');
    const saveButton = document.getElementById('saveButton');
    const historyDiv = document.getElementById('history');





    function setUpAssignedUserIDSelect() {
        let parsed = JSON.parse(window.taskData.social_users.replace(/&#x27;/g, "'").replace(/&quot;/g,"\"").replace(/'/g, '"'));

        if ($("#taskStatus").val() == "Pending"
            || $("#taskStatus").val() == "On Hold"
            || $("#taskStatus").val() == ""
            || $("#taskStatus").val() == null) {
            $('#assigned_userid_select').select2({ data: parsed });
            $("#assigned_userid_select").val(parseInt(window.taskData.assigned_userid)).trigger('change');
        }

        if ($("#taskStatus").val() == "Complete"
            || $("#taskStatus").val() == "In Progress"
        ) {
            $('#assigned_userid').val(parseInt(window.taskData.assigned_userid));
        }
    }

    function setUpTaskTypeSelect() {


        if ($("#taskStatus").val() != "Complete"
            && $("#taskStatus").val() != "In Progress"
        ) {
            $('#taskTypeSelectDiv').show();
            $('#taskType_select').select2({ data: parsedScheduleOfCharges });
            $("#taskType_select").val(window.taskData.taskType).trigger('change');




        }
        else {

            $('#taskTypeSelectDiv').hide();
        }
    }



    

    setUpAssignedUserIDSelect()
    setUpTaskTypeSelect()

    if (taskStatusElement == null) {
        taskStatusElement = document.getElementById('taskStatus');
    }

    if (taskStatusElement != null) {
        if (taskStatusElement.selectedIndex >= 0) {
            previousStatus = taskStatusElement.options[taskStatusElement.selectedIndex].value
            console.log("previousStatus is ", previousStatus)
        }
    }


    console.log("Task id: " + taskid + " " + "User id: " + userId + " " + " Assigned to User id: " + window.taskData.assigned_userid)

    if (userId == parseInt(window.taskData.assigned_userid)
        && userId != parseInt(window.taskData.adminUserId)) {
        $("#releaseTaskBtn").removeAttr("disabled");
    }
    else {
        $("#releaseTaskBtn").attr("disabled", "disabled");
    }

    console.log("taskstatus", $("#taskStatus").val())
});





function onSubmit() {



    if ($("#taskDesc").val().length == 0) {
        appendAlert("Please enter Task Description.", "danger")

        return
    }

    if ($("#taskDesc").val().length > 200) {
        appendAlert("Task Description may not be more than 200 characters.", "danger")

        return
    }

    if ($("#taskStatus").val() == null) {
        appendAlert("Please select Task Status.", "danger")

        return
    }

    if ($('[name="startDate"]').val() == undefined
        || $("#startDate").val() == 'Invalid Date'
        || $("#startDate").val() == 'None'
        || $("#startDate").val().length == 0) {
        appendAlert("Please select valid Start date.", "danger")
        return
    }

    if ($("#endDate").val() == undefined ||
        $("#endDate").val() == 'Invalid Date'
        || $("#endDate").val() == 'None'
        || $("#endDate").val().length == 0) {
        appendAlert("Please select valid End date.", "danger")

        return
    }

    
    if (new Date($("#endDate").val()) < new Date($("#startDate").val())) {
        appendAlert("Please select End date that is the same as or after the start date.", "danger")

        return
    }

    console.log("assigned user id:", parseInt($("#assigned_userid").val()))
    if (parseInt($("#assigned_userid").val()) == 0
        || parseInt($("#assigned_userid").val()) == NaN) {
        appendAlert('Please assign the task to a user.', "danger")
        return
    }

    console.log('task fees', $("#taskFees").val())
    console.log('task type', $("#taskType").val())

    if ($("#taskType").val() == null
        || $("#taskType").val().length == 0) {
        appendAlert('Please select a task type.', "danger")
        return
    }

    if (parseFloat($("#taskFees").val()) < 1) {
        appendAlert('Please select a task type. If task type selected is "Custom", please enter valid and agreed task fees.', "danger")
        return
    }

    spinner.style.display = 'flex';
    document.getElementById("myform").submit();
}