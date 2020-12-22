let config;

$(() => {
    $.get("/getconf")
        .done((data) => {
            config = data;
            initCurrentConfig(config);
            initModal();
            initSides(config);
        })

    $(".close").click(() => {
        $(".modal-settings").removeClass("show")
    })

    $(".current .settings").click(() => {
        $(".modal-settings").addClass("show")
    })

    $(".overlay-settings").click(() => {
        $(".modal-settings").removeClass("show")
    })

    let message_shown = false;
    $("#submit").click(() => {
        const date = handleDate($("#user-date").val());
        const time = handleTime($("#user-time").val());
        const timeout = handleTime($("#user-timeout").val());
        const countdown = handleTime($("#user-countdown").val());
        const pause = handleTime($("#user-pause").val());

        let message_timeout;

        $.post("/config", {
            date: date,
            time: time,
            timeout: timeout,
            countdown: countdown,
            pause: pause
        })
            .done(() => {
                location.reload();
            })

            .fail(() => {
                if(!message_shown) {
                    $(".modal-settings").prepend($("<span>").text("Wrong input. All fields must be filled"));
                    message_shown = true;
                }
                message_timeout = setTimeout(() => {
                    $(".modal-settings>span").remove();
                    message_shown = false;
                }, 5000);
            })
    })
})

function handleDate(date) {
    if(date) {
        const date_val = new Date(date);
        return `${date_val.getFullYear()}/${date_val.getDate()}/${date_val.getMonth()+1}`;
    }
    return date;
}

function handleTime(time) {
    if(time) {
        const [actual_time, mode] = time.split(" ");
        let [hours, minutes] = actual_time.split(":");
        hours = parseInt(hours);
        minutes = parseInt(minutes);

        if(mode === "PM") {
            hours += 12;
        }

        return `${hours}:${minutes}`;
    }
    return time;
}

function initCurrentConfig(config) {

    if(config.auction) {
        const [year, month, day] = config.auction.date.split("/");
        console.log(new Date(year, month, day).toDateString());

        const date = document.querySelector("#date");
        const date_inst = M.Datepicker.init(date, {
            defaultDate: new Date(year, month, day),
            setDefaultDate: true
        })

        const time = document.querySelector("#time")
        const time_inst = M.Timepicker.init(time);
        $("#time").val(config.auction.time);

        const timeout = document.querySelector("#timeout")
        const timeout_inst = M.Timepicker.init(timeout);
        $("#timeout").val(config.auction.timeout);

        const countdown = document.querySelector("#countdown")
        const countdown_inst = M.Timepicker.init(countdown);
        $("#countdown").val(config.auction.countdown);

        const pause = document.querySelector("#pause")
        const pause_inst = M.Timepicker.init(pause);
        $("#pause").val(config.auction.pause);

        $(".current>.input-field").css("pointer-events", "none");
    } else {
        $(".current>.input-field").remove()
        $("<span class='message'>")
            .text("Auction not configured")
            .prependTo($(".current"));
    }
}

function initModal() {
    M.Datepicker.init(document.querySelector("#user-date"));
    $(".datepicker").datepicker({
        container: "body"
    })

    M.Timepicker.init(document.querySelector("#user-time"));
    M.Timepicker.init(document.querySelector("#user-timeout"));
    M.Timepicker.init(document.querySelector("#user-countdown"));
    M.Timepicker.init(document.querySelector("#user-pause"));
    $(".timepicker").timepicker({
        container: "body"
    })

}

function initSides(config) {
    config.paintings.forEach((name) => {
        $(".paintings ul").append($("<li>").append($("<span>").text(name)));
    })

    config.members.forEach((name) => {
        $(".members ul").append($("<li>").append($("<span>").text(name)));
    })
}