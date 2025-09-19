let rating;
let taskStatusElement = null;
let previousStatus = window.taskData.taskStatus;
let spinner;



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


    html2pdf().from(element).save(`Task${window.taskData.taskid}.pdf`);
}

function releaseTask() {
    let result = confirm("Are you sure you would like to release this task? If you release this task before it is completed, you won't receive any fees for this task.")

    if (result) {

        $("#assigned_userid").val(`${window.taskData.adminUserId}`)
        $("#submitButton").click();
    }
}

function handleAssignedUserIDChange(selectElement) {
    console.log("Assigned User ID: " + selectElement.value);
    $("#assigned_userid").val(selectElement.value);

    if (selectElement.value != '') {

        fetch(`/kbuploader/getUserFullName/${assignedUserID}/`)
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
                    amount = $("#amount").val()
                    const encodedEmail = encodeURIComponent(email);
                    const encodedPhone = encodeURIComponent(phone);

                    const encodedtaskid = encodeURIComponent(window.taskData.taskid);
                    const encodedAmount = encodeURIComponent(amount);
                    const baseUrl = window.taskData.paymentBaseUrl;
                    console.log(`${baseUrl}?email=${encodedEmail}&phone=${encodedPhone}&taskid=${encodedtaskid}&amount=${encodedAmount}`);
                    window.location.href = `${baseUrl}?email=${encodedEmail}&phone=${encodedPhone}&taskid=${encodedtaskid}&amount=${encodedAmount}`;
                    return
                }
                else {
                    event.preventDefault();
                    document.getElementById('taskStatus').value = previousStatus;
                }
            }
        }

    }

    if (selectElement.options[selectElement.selectedIndex]?.text != "Complete") {
        document.getElementById("ratingCard").style.visibility = "hidden"
    }
    else {
        document.getElementById("ratingCard").style.visibility = "visible"
    }

    if (selectElement.options[selectElement.selectedIndex]?.text == "Complete") {
        alert("Rating this task is essential for providing feedback and evaluating its completion. By assigning a rating, you contribute to an ongoing process of improvement and accountability.")

        if (paymentReceived != "True") {
            alert("Payment is not received for this task yet. This task may not be marked as complete.")
            return
        }

        var result = confirm("Are you sure you would like to mark this task as complete? Once you do this, it will be a read-only task and you won't be able to modify it.")

        if (!result) {
            event.preventDefault();
            document.getElementById('taskStatus').value = previousStatus;
            document.getElementById("ratingCard").style.visibility = "hidden"
        } else {

            let originator_userid = parseInt($("#originator_userid").val())


            if (window.taskData.userId != originator_userid) {
                alert('Only the originator can mark the task as complete')
                event.preventDefault();
                document.getElementById('taskStatus').value = previousStatus;
                document.getElementById("ratingCard").style.visibility = "hidden"
                return;
            }

            previousStatus = document.getElementById('taskStatus').value;
        }
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

function handleTaskTypeChange(selectElement) {
    $("#taskType").val(selectElement.value);

    let price = getPriceFromTaskTypeInt(selectElement.options[selectElement.selectedIndex]?.value)

    $("#taskFees").val(price)

    $("#amount").val($("#taskFees").val())
}

function ratingNumChanged(element) {
    gfg(element.value)
}

function expTaskToPDF() {

    let shortDesc = $("#taskDesc").val().substring(0, 50)
    let taskDesc = `${shortDesc}..`;
    let taskStatus = $("#taskStatus").val();


    var doc = new jsPDF();

    var img = new Image()
    img.src = 'https://prasadnarwadkar.github.io/jsonCV/img/favicon.png'
    doc.addImage(img, 'png', 20, 120, 36, 36)

    doc.setFontSize(22);
    doc.text(20, 20, 'Task Details');

    doc.setFontSize(16);
    doc.text(20, 30, `Task ID: ${window.taskData.taskid}`);
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
                console.log(data['message'])
                doc.text(20, 90, `Assigned to: ${data['message']}`)

                doc.text(20, 100, `Start Date: ${new Date(Date.parse(window.taskData.startDate)).toLocaleDateString()}`)
                doc.text(20, 110, `End Date: ${new Date(Date.parse($("#endDate").val())).toLocaleDateString()}`)

                doc.save(`Task${window.taskData.taskid}.pdf`);
            });

    }
}

function taskPayButtonClick() {
    paymentReceived = window.taskData.paymentReceived

    if (paymentReceived != "True") {
        if (window.taskData.userId != parseInt(window.taskData.assigned_userid)
            || window.taskData.userId == parseInt(window.taskData.adminUserId)) {

            var result = confirm("Are you sure you want to make payment for this task? Please note that initiating a task requires advance payment. If you're not satisfied with the quality of work delivered by the assigned professional, you may request a rework or a refund. Once they confirm your request, the system may proceed with issuing a refund.")

            if (result) {
                email = $("#email").val()
                phone = $("#phone").val()
                amount = $("#taskFees").val()
                const encodedEmail = encodeURIComponent(email);
                const encodedPhone = encodeURIComponent(phone);

                const encodedtaskid = encodeURIComponent(window.taskData.taskid);
                const encodedAmount = encodeURIComponent(amount);
                const baseUrl = window.taskData.paymentBaseUrl;
                console.log(`${baseUrl}?email=${encodedEmail}&phone=${encodedPhone}&taskid=${encodedtaskid}&amount=${encodedAmount}`);
                window.location.href = `${baseUrl}?email=${encodedEmail}&phone=${encodedPhone}&taskid=${encodedtaskid}&amount=${encodedAmount}`;
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
            $("#taskPayButton").removeAttr("disabled")
            console.log("Task pay button enabled")
        }
    }

    document.getElementById("ratingCard").style.visibility = "hidden"
    spinner = document.getElementById('mySpinner');
    spinner.style.display = 'none';

    $("#taskStatus").val(window.taskData.taskStatus);
    $("#startDateLabel").text("Start Date: " + formatDate(window.taskData.startDate))

    if ($("#endDate").val() != "None") {
        $("#endDate").val(formatDate($("#endDate").val()))
        $("#endDate").datepicker({ minDate: new Date(formatDate(window.taskData.startDate)) })

    }
    else {
        $("#endDate").val("")
    }

    console.log("start date", $("#startDate").val())
    console.log("end date", $("#endDate").val())

    $("#amount").val($("#taskFees").val())

    $("#endDate").val(formatDate($("#endDate").val()))

    const scheduleOfCharges = window.taskData.scheduleOfCharges;

    const htmlDecodedScheduleOfCharges = scheduleOfCharges.replace(/&#x27;/g, "'");

    const jsonReadyScheduleOfCharges = htmlDecodedScheduleOfCharges.replace(/'/g, '"');

    const parsedScheduleOfCharges = JSON.parse(jsonReadyScheduleOfCharges);

    let assignedUserID = parseInt(window.taskData.assigned_userid)

    fetch(`/kbuploader/getUserFullName/${assignedUserID}/`)
        .then(response => response.json())
        .then(data => {
            $("#assigned_user_full_name").text(data['message'])
        })

    paymentReceived = window.taskData.paymentReceived



    const taskType = window.taskData.taskType

    parsedScheduleOfCharges.forEach(item => {
        if (parseInt(taskType) == item.id) {
            $("#taskTypeLabel").val(item.text)
            $("#taskTypeLabel").attr("title", item.text)
        }
    });

    const taskStatus = $("#taskStatus").val()

    if (taskStatus == "Complete") {
        document.getElementById("ratingCard").style.visibility = "hidden"
    }

    let assigned_userid_val = window.taskData.assigned_userid

    paymentReceived = window.taskData.paymentReceived

    if (paymentReceived != "True") {
        if (window.taskData.userId != parseInt(window.taskData.assigned_userid)
            || window.taskData.userId == parseInt(window.taskData.adminUserId)) {



            if (taskStatus == "In Progress") {
                var result = confirm("This task is marked as in progress. Please note that initiating a task requires advance payment. If you're not satisfied with the quality of work delivered by the assigned professional, you may request a rework or a refund. Once they confirm your request, the system may proceed with issuing a refund. Are you sure you would like to proceed with the payment?")

                if (result) {
                    email = $("#email").val()
                    phone = $("#phone").val()
                    amount = $("#amount").val()
                    const encodedEmail = encodeURIComponent(email);
                    const encodedPhone = encodeURIComponent(phone);

                    const encodedtaskid = encodeURIComponent(window.taskData.taskid);
                    const encodedAmount = encodeURIComponent(amount);
                    const baseUrl = window.taskData.paymentBaseUrl;
                    console.log(`${baseUrl}?email=${encodedEmail}&phone=${encodedPhone}&taskid=${encodedtaskid}&amount=${encodedAmount}`);
                    window.location.href = `${baseUrl}?email=${encodedEmail}&phone=${encodedPhone}&taskid=${encodedtaskid}&amount=${encodedAmount}`;
                    return
                }
            }


        }
    }

    fetch(`/kbuploader/getUserRating/${assigned_userid_val}/`)
        .then(response => response.json())
        .then(data => {
            console.log(parseFloat(data['message']))
            rating = parseFloat(data['message']).toFixed(2)
            console.log(rating)

            $("#ratingSpanP2").html(`<span title="${rating}" class="stars"><span style="width: 148px;">${rating}</span></span>`).trigger('change')

            $('span.stars').stars().trigger('change');
        });

    $('span.stars').stars();

    gfg(window.taskData.taskRating)

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
                    const timestamp = new Date().toLocaleString();
                    history.push({ value: `${inputValue} (${userFullName})`, date: timestamp });

                    localStorage.setItem('inputHistoryForTask' + $("#taskid").val(), JSON.stringify(history));
                    updateHistoryDisplay(history);
                    inputBox.value = ''; // Clear the input box
                }
            }
        });
    }

    function setUpAssignedUserIDSelect() {
        console.log('setUpAssignedUserIDSelect')
        let raw = window.taskData.social_users;

        let htmlDecoded = raw.replace(/&#x27;/g, "'");

        let jsonReady = htmlDecoded.replace(/'/g, '"');

        let parsed = JSON.parse(jsonReady);


        if ($("#taskStatus").val() == "Complete"
            || $("#taskStatus").val() == "In Progress"
        ) {
            $('#assigned_userid').val(parseInt(window.taskData.assigned_userid));
        }
    }

    function setUpTaskTypeSelect() {

        let taskType = window.taskData.taskType
        if ($("#taskStatus").val() != "Complete"
            && $("#taskStatus").val() != "In Progress"
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

            historyDiv.innerHTML = `<h6>Task No. ${window.taskData.taskid} (ID: ${$("#taskid").val()})</h6>`
            historyDiv.innerHTML += history
                .map(entry => `<p><strong>${entry.date}:</strong> ${entry.value}</p>`)
                .join('');
        }
    }

    // Initialize End Datepicker
    $("#endDate").datepicker({
        dateFormat: "yy-mm-dd",
        onSelect: function (selectedDate) {

        }
    });

    setUpAssignedUserIDSelect()
    setUpTaskTypeSelect()


    if (taskStatusElement == null) {
        taskStatusElement = document.getElementById('taskStatus');
    }

    if (taskStatusElement != null
        && taskStatusElement.selectedIndex >= 0) {
        previousStatus = document.getElementById('taskStatus').options[taskStatusElement.selectedIndex].value
        console.log("previousStatus is ", previousStatus)
    }



    console.log("Task id: " + window.taskData.taskid + " " + "User id: " + window.taskData.userId + " " + " Assigned to User id: " + window.taskData.assigned_userid)

    if (window.taskData.userId == parseInt(window.taskData.assigned_userid)
        && window.taskData.userId != parseInt(window.taskData.adminUserId)) {
        $("#releaseTaskBtn").removeAttr("disabled");
    }
    else {
        $("#releaseTaskBtn").attr("disabled", "disabled");
    }

    console.log("taskstatus", $("#taskStatus").val())

    if (taskStatus == "Complete") {
        document.getElementById("ratingCard").style.visibility = "hidden"
    }


});

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




function onSubmit() {



    if ($("#taskDesc").val().length == 0) {
        alert("Please enter Task Description.")

        return
    }

    if ($("#taskDesc").val().length > 200) {
        alert("Task Description may not be more than 200 characters.")

        return
    }



    if ($("#taskStatus").val() == null) {
        alert("Please select Task Status.")

        return
    }

    console.log("end date chosen: ", $("#endDate").val())


    if ($("#endDate").val() == undefined ||
        $("#endDate").val() == 'Invalid Date'
        || $("#endDate").val() == 'None'
        || $("#endDate").val().length == 0) {
        alert("Please select valid End date.")

        return
    }

    $("#endDate").val(formatDate($("#endDate").val()))

    if (new Date($("#endDate").val()) < new Date(window.taskData.startDate)) {
        alert("Please select End date that is the same as or after the start date.")

        return
    }

    console.log("assigned user id:", parseInt($("#assigned_userid").val()))
    if (parseInt($("#assigned_userid").val()) == 0
        || parseInt($("#assigned_userid").val()) == NaN) {
        alert('Please assign the task to a user.')
        return
    }

    console.log("task type", $("#taskType").val())

    if ($("#taskType").val() == null
        || $("#taskType").val().length == 0) {

        if (!$("#taskTypeLabel").val()
            || $("#taskTypeLabel").val().length == 0) {
            alert("Please select Task Type.")
            return
        }
    }

    console.log(parseFloat($("#taskFees").val()))
    if (parseFloat($("#taskFees").val()) < 1) {
        alert('Please select a task type.')
        return
    }

    spinner.style.display = 'flex';
    document.getElementById("myform").submit();
}