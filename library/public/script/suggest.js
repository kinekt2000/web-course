function checkDate() {
    let year = document.getElementById("year");
    let yearValue = parseInt(year.value);
    if(yearValue < 1000) yearValue = undefined

    let month = document.getElementById("month");
    let monthValue = parseInt(month.value);
    if(monthValue === 0) monthValue = undefined;

    let day = document.getElementById("day");
    let dayValue = parseInt(day.value);
    if(dayValue === 0) dayValue = undefined;

    const date = new Date(yearValue, monthValue, dayValue);

    if(!isNaN(date.getFullYear())) {
        // if(yearValue !== date.getFullYear()) {
        //     rejectDate();
        //     return;
        // }
        //
        // if(monthValue !== date.getMonth()) {
        //     rejectDate();
        //     return;
        // }
        //
        // if(dayValue !== date.getDate()) {
        //     rejectDate()
        //     return;
        // }

        approveDate();

    } else {
        rejectDate()
    }

    function rejectDate() {
        year.setCustomValidity("Wrong data");
        month.setCustomValidity("Wrong data");
        day.setCustomValidity("Wrong data");
    }

    function approveDate() {
        year.setCustomValidity("");
        month.setCustomValidity("");
        day.setCustomValidity("");
    }
}
