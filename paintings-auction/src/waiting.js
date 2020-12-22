let currentTime;
let $minutes;
let $seconds

function showTime(time) {
    currentTime = time;
    $minutes = $(".minutes");
    $seconds = $(".seconds");

    displayTime(time)

    setInterval(function () {
        currentTime --;
        displayTime(currentTime);
        if(currentTime === 0)
            location.reload()
    }, 1000)
}


function displayTime(time) {
    const minutes = (Math.floor(time / 60)).toString();
    const seconds = (time % 60).toString()

    $minutes.text(minutes.length < 2 ? `0${minutes}`: minutes);
    $seconds.text(seconds.length < 2 ? `0${seconds}`: seconds);
}

function connectToServer() {
    let socket = io.connect("http://localhost:3030");
    socket.on("connect", () => {console.log("connected")})

    socket.on("update", () => {
        location.reload();
    })
}

$(() =>{
    const $time = $(".time");

    if($time.length) {
        showTime($(".time").data("time"));
    } else {
        connectToServer()
    }
})