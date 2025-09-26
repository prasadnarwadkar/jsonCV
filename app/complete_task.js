let rating;

let previousStatus;
let taskid = window.taskData.taskid
let userId = window.taskData.userId



// To access the stars
let stars =
    document.getElementsByClassName("star");
let taskRating =
    document.getElementById("taskRating");

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

    $("#taskRating").val(n)
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
function expCommentHistoryToPDF() {
    const element = document.getElementById("history");

    let taskid = window.taskData.taskid
    html2pdf().from(element).save(`Task${taskid}.pdf`);
}

function releaseTask() {
    let result = confirm("Are you sure you would like to release this task? If you release this task before it is completed, you won't receive any fees for this task.")

    if (result) {

        $("#assigned_userid").val(window.taskData.adminUserId)
        $("#submitButton").click();
    }
}

function handleAssignedUserIDChange(selectElement) {

    $("#assigned_userid").val(selectElement.value);
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

function handleTaskTypeChange(selectElement) {
    $("#taskType").val(selectElement.value);

    let price = getPriceFromTaskTypeInt(selectElement.options[selectElement.selectedIndex]?.value)

    $("#taskFees").val(price)
}

function ratingNumChanged(element) {
    gfg(element.value)
}

function expTaskToPDF() {
    let taskID = window.taskData.taskid;
    let shortDesc = $("#taskDesc").val().substring(0, 50)
    let taskDesc = `${shortDesc}...`;
    let taskStatus = window.taskData.taskStatus;

    var doc = new jsPDF();

    var img = new Image()
    img.src = 'https://prasadnarwadkar.github.io/jsonCV/img/favicon.ico'
    doc.addImage(img, 'png', 20, 120, 36, 36)

    doc.setFontSize(22);
    doc.text(20, 20, 'Task Details');

    doc.setFontSize(16);
    doc.text(20, 30, `Task ID: ${taskID}`);
    doc.setFontSize(16);
    doc.text(20, 40, `Task Description: ${taskDesc}`);
    doc.setFontSize(16);
    doc.text(20, 50, `Task Status: ${$("#taskStatus").val()}`);
    doc.text(20, 60, `Task Rating By the Originator: ${$("#taskRatingDone").val()}`)
    doc.text(20, 70, `Task Fees Agreed Mutually: INR ${$("#taskFees").val()}`)
    doc.text(20, 80, `Task Type: ${$("#taskTypeLabel").val()}`)
    let assignedUserID = parseInt(window.taskData.assigned_userid)
    if (taskStatus == "Complete"
        || taskStatus == "In Progress"
    ) {
        fetch(`/kbuploader/getUserFullName/${assignedUserID}/`)
            .then(response => response.json())
            .then(data => {

                doc.text(20, 90, `Assigned to: ${data['message']}`)

                doc.text(20, 100, `Start Date: ${new Date(Date.parse(window.taskData.startDate)).toLocaleDateString("en-IN")}`)
                doc.text(20, 110, `End Date: ${new Date(Date.parse(window.taskData.endDate)).toLocaleDateString("en-IN")}`)

                doc.save(`Task${taskID}.pdf`);
            });

    }
}

function formatDate(input) {
    // Remove the period if present (e.g., "Aug. 27, 2025" → "Aug 27, 2025")
    const cleaned = input.replace('.', '');

    // Parse using Date constructor
    const date = new Date(cleaned);

    // Format to YYYY-MM-DD
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const dd = String(date.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
}

$(document).ready(function () {
    let assignedUserID = parseInt(window.taskData.assigned_userid)

    if (assignedUserID > 0) {

        fetch(`/kbuploader/getUserFullName/${assignedUserID}/`)
            .then(response => response.json())
            .then(data => {
                $("#assigned_user_full_name").text(data['message'])
            })
    }

    $("#startDate").val(formatDate(window.taskData.startDate))
    $("#endDate").val(formatDate(window.taskData.endDate))

    const scheduleOfCharges = window.taskData.scheduleOfCharges;

    const htmlDecodedScheduleOfCharges = scheduleOfCharges.replace(/&#x27;/g, "'");

    const jsonReadyScheduleOfCharges = htmlDecodedScheduleOfCharges.replace(/'/g, '"');
    let parsedScheduleOfCharges = undefined
    const taskType = window.taskData.taskType

    if (jsonReadyScheduleOfCharges != undefined
        && jsonReadyScheduleOfCharges != null
        && jsonReadyScheduleOfCharges.length > 0) {
        parsedScheduleOfCharges = JSON.parse(jsonReadyScheduleOfCharges);

        parsedScheduleOfCharges.forEach(item => {
            if (parseInt(taskType) == item.id) {
                $("#taskTypeLabel").val(item.text)
                $("#taskTypeLabel").attr("title", item.text)
            }
        });
    }

    paymentReceived = window.taskData.paymentReceived

    const taskStatus = window.taskData.taskStatus

    if (taskStatus == "Complete") {
        document.getElementById("ratingCard").style.visibility = "hidden"
    }

    userId = window.taskData.userId
    paymentReceived = window.taskData.paymentReceived

    if (paymentReceived != "True") {
        if (userId != parseInt(window.taskData.assigned_userid)
            || userId == parseInt(window.taskData.adminUserId)) {



            if (taskStatus == "In Progress") {
                var result = confirm("This task is marked as in progress. Please note that initiating a task requires advance payment. If you're not satisfied with the quality of work delivered by the assigned professional, you may request a rework or a refund. Once they confirm your request, the system may proceed with issuing a refund. Are you sure you would like to proceed with the payment?")

                if (result) {
                    email = $("#email").val()
                    phone = $("#phone").val()
                    amount = $("#amount").val()
                    const encodedEmail = encodeURIComponent(email);
                    const encodedPhone = encodeURIComponent(phone);
                    taskid = window.taskData.taskid
                    const encodedTaskId = encodeURIComponent(taskid);
                    const encodedAmount = encodeURIComponent(amount);
                    const baseUrl = window.taskData.paymentBaseUrl;

                    window.location.href = `${baseUrl}?email=${encodedEmail}&phone=${encodedPhone}&taskid=${encodedTaskId}&amount=${encodedAmount}`;
                    return
                }
            }


        }
    }



    const inputBox = document.getElementById('inputBox');
    const saveButton = document.getElementById('saveButton');
    const historyDiv = document.getElementById('history');

    if ($("#taskid").val().length > 0) {

        const history = JSON.parse(localStorage.getItem('inputHistoryForTask' + $("#taskid").val())) || [];
        updateHistoryDisplay(history);
    }

    if (saveButton) {
        // Save input to localStorage
        saveButton.addEventListener('click', () => {
            const inputValue = inputBox.value.trim();
            if (inputValue) {
                if ($("#taskid").val().length > 0) {
                    const history = JSON.parse(localStorage.getItem('inputHistoryForTask' + $("#taskid").val())) || [];
                    let userFullName = window.taskData.userFullName
                    const timestamp = new Date().toLocaleString("en-IN");
                    history.push({ value: `${inputValue} (${userFullName})`, date: timestamp });

                    localStorage.setItem('inputHistoryForTask' + $("#taskid").val(), JSON.stringify(history));
                    updateHistoryDisplay(history);
                    inputBox.value = ''; // Clear the input box
                }
            }
        });
    }

    function setUpAssignedUserIDSelect() {
        if (window.taskData.taskStatus == "Complete"
            || window.taskData.taskStatus == "In Progress"
        ) {
            $('#assigned_userid').val(parseInt(window.taskData.assigned_userid));
        }
    }

    function setUpTaskTypeSelect() {

        let taskType = window.taskData.taskType
        if (window.taskData.taskStatus != "Complete"
            && window.taskData.taskStatus != "In Progress"
        ) {
            $('#taskTypeSelectDiv').show();
            $('#taskType_select').select2({ data: parsedScheduleOfCharges });
            $("#taskType_select").val(taskType).trigger('change');


            $("#taskType").val(taskType);
            $("#taskTypeLabelDiv").hide();
        }
        else {
            $("#taskTypeLabelDiv").show();
            $('#taskTypeSelectDiv').hide();
        }
    }

    // Update the history display
    function updateHistoryDisplay(history) {
        if (history.length === 0) {
            historyDiv.innerHTML = 'Be the first to add a comment.';
        } else {
            let taskid = window.taskData.taskid
            historyDiv.innerHTML = `<h6>Task No. ${taskid} (ID: ${$("#taskid").val()})</h6>`
            historyDiv.innerHTML += history
                .map(entry => `<p><strong>${entry.date}:</strong> ${entry.value}</p>`)
                .join('');
        }
    }




    setUpAssignedUserIDSelect()
    setUpTaskTypeSelect()

    $("#taskStatus").val(window.taskData.taskStatus);

    if (userId == parseInt(window.taskData.assigned_userid)
        && userId != parseInt(window.taskData.adminUserId)) {
        $("#releaseTaskBtn").removeAttr("disabled");
    }
    else {
        $("#releaseTaskBtn").attr("disabled", "disabled");
    }



    if (taskStatus == "Complete") {
        document.getElementById("ratingCard").style.visibility = "hidden"
    }


    $("#startDate").val(new Date(Date.parse(window.taskData.startDate)).toLocaleDateString("en-IN"));
    $("#endDate").val(new Date(Date.parse(window.taskData.endDate)).toLocaleDateString("en-IN"));
});