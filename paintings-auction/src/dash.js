let paintings = [];
let images = [];

const colors = [
    "#9b453c",
    "#3a5572",
    "#4a3b6d",
    "#515151",
    "#ab3f03",
    "#316927"
]

function randColor() {
    const n = Math.floor(Math.random() * colors.length);
    return colors[n];
}

let current;
let count;
let countdown;

$(() => {
    let [m, s] = $("#tillend .data").text().split(":");
    countdown = parseInt(m) * 60 + parseInt(s);
    console.log(m, s)

    // initialize first painting
    $.get("/painting", {number: 0})
        .done((data) => {
            paintings.push(data);
            current = 0;

            if(data.timeout !== null) {
                data.timer = setInterval(() => {
                    data.timeout--;
                }, 1000)
            }

            showImage(0);

            $.get("/count")
                .done((data) => {
                    count = parseInt(data)
                    if(count > 1) {
                        $("#next").removeClass("disabled");
                    }
                })
        })


    // initialize jquery-ui
    $(".user-portlets").sortable({
        connectWith: ".user-portlets",
        handle: ".portlet-header",
        cancel: ".portlet-toggle",
        cursor: "move"
    })

    $(".portlet")
        .addClass("ui-widget ui-widget-content ui-corner-all")
        .find(".portlet-header")
        .addClass("ui-widget-header ui-corner-all")
        .prepend($("<span class='ui-icon ui-icon-minus portlet-toggle'>"))

    $(".portlet-toggle").click(function () {
        const icon = $(this);
        icon.toggleClass("ui-icon-minus ui-icon-plus")
        icon.closest(".portlet").find(".portlet-content").toggle();
    })

    $("#prev").click(() => {
        prev();
    })

    $("#next").click(() => {
        next();
    })

    $("#up").click(() => {
        up();
    })

    $("#down").click(() => {
        down();
    })

    let socket = io.connect("http://localhost:3030");
    const user = User();
    const color = randColor();

    function User() {
        const words = $("#balance .portlet-header").text().split(" ");
        let user = "";
        for(let i = 1; i < words.length; i++){
            if(i !== 1) user += " ";
            user += words[i];
        }
        return user;
    }

    socket.on("connect", () => {
        socket.emit("init", {name: user, color: color})
    })

    socket.on("connected_message", (data) => {
        $("#trading")
            .append($(`<li>`)
                .append($(`<span class="message-type connected">Connected:<\span>`).css("color", data.color))
                .append($(`<span>${data.name}</span>`).css("color", data.color))
            )
    })

    socket.on("disconnected_message", (data) => {
        $("#trading")
            .append($(`<li>`)
                .append($(`<span class="message-type connected">Disconnected:<\span>`).css("color", data.color))
                .append($(`<span>${data.name}</span>`).css("color", data.color))
            )
    })

    let message_timer;
    socket.on("cannot_raise", (data) => {
        let message = $("#price-setting .portlet-content div:last-child");
        if(!message.hasClass("message")) {
            message = $("<div class='message'>").appendTo($("#price-setting .portlet-content"));
        }

        message.text(`cannot raise: ${data}`)
        message_timer = setTimeout(() => {message.remove()}, 2000);
    })

    socket.on("raise", (data) => {
        $("#trading")
            .append($(`<li>`)
                .append($(`<span class="message-type raised">Raised:<\span>`).css("color", data.color))
                .append($(`<span>${data.painting} by ${data.name} to ${data.price}</span>`).css("color", data.color))
            )

        if(paintings[data.paintingNumber]) {
            paintings[data.paintingNumber].currentPrice = data.price;
            paintings[data.paintingNumber].buyer = data.name;
            paintings[data.paintingNumber].timeout = data.timeout;
            paintings[data.paintingNumber].timer = setInterval(() => {
                paintings[data.paintingNumber].timeout--
            }, 1000)
        }

        if(data.name === user) {
            const residual = $("#balance .portlet-content .data-block:last-of-type .data")
            residual.text(parseInt(residual.text()) - data.price);
            $("#leading-list").append($("<li>")
                .append($(`<div>${data.painting}</div>`))
            )
        } else {
            $("#leading-list div").each(function () {
                if($(this).text() === data.painting) {
                    $(this).remove();
                }
            })

            $.get("/extUser", {name: user})
                .done((data) => {
                    $("#balance .portlet-content .data-block:last-of-type .data").text(data.residual);
                })
        }

        if(data.paintingNumber === $(".image-field").data("number")) showImage(data.paintingNumber)
    })

    socket.on("sold", (data) => {
        $("#trading")
            .append($(`<li>`)
                .append($(`<span class="message-type sold">Sold:<\span>`).css("color", data.color))
                .append($(`<span>${data.painting} to ${data.name} for ${data.price}</span>`).css("color", data.color))
            )

        if(paintings[data.paintingNumber]) {
            paintings[data.paintingNumber].sold = true;
            clearInterval(paintings[data.paintingNumber].timer);
            paintings[data.paintingNumber].timer = null;
        }

        if(data.name === user) {
            const fund = $("#balance .portlet-content .data-block:first-of-type .data")
            fund.text(parseInt(fund.text()) - data.price);
            $("#purchase-list").append($("<li>")
                .append($(`<div>${data.painting}</div>`))
            )

            $("#leading-list div").each(function () {
                if($(this).text() === data.painting) {
                    $(this).remove();
                }
            })
        }

        if(data.paintingNumber === $(".image-field").data("number")) showImage(data.paintingNumber)
    })

    socket.on("update_time", (data) => {
        if(Math.abs(countdown - data.countdown) > 1) countdown = data.countdown;
        for(let i = 0; i < paintings.length; i++) {
            if(data.timers[i] !== null) {
                if(Math.abs(data.timers[i] - paintings[i].timeout) > 1) paintings[i].timeout = data.timers[i];
            }
        }
    })

    socket.on("update", () => {
        location.reload();
    })

    $("#raise").click(() => {
        socket.emit("raise", {name: user, price: parseInt($("#price-setting .user-price").text()), painting: $(".image-field").data("number")})
    })


    setInterval(() => {
        const painting = paintings[$(".image-field").data("number")]

        if(painting) {
            $("#timeout .data").text(painting.timeout === null ? "N/A" : (timeToStr(painting.timeout) < 0) ? "0" :timeToStr(painting.timeout));
        }

        countdown--;
        $("#tillend .data").text(timeToStr(countdown));

        function timeToStr(time) {
            return `${Math.floor(time/60)}:${time%60}`;
        }
    }, 1000)
})

function showImage(number) {
    let painting = paintings[number];

    if(images[number] === undefined) {
        images[number] = $(`<img src='/public/images/${painting.id}.jpg' alt=${painting.name}>`);
    }

    $(".image-wrapper")
        .empty()
        .append(images[number]);

    $("#painting-name .data").text(painting.name);
    $("#painting-author .data").text(painting.author);
    $("#description .data").text(painting.description);

    const startingPrice = $(".starting-price .data").text(painting.price);
    const currentPrice = $(".current-price .data").text(painting.currentPrice || painting.price);

    if(painting.buyer) {
        $(".customer").removeClass("absent");
        $(".customer .data").text(painting.buyer);
    } else {
        $(".customer").addClass("absent");
        $(".customer .data").text("absent");
    }

    if(painting.sold) {
        $(".data-wrapper .data-block.status .data").text("SOLD");
        $(".data-wrapper .data-block.status").addClass("sold");
    } else {
        $(".data-wrapper .data-block.status .data").text("IN THE AUCTION");
        $(".data-wrapper .data-block.status").removeClass("sold");
    }

    $(".user-price").text(painting.buyer ? currentPrice.text() : (parseInt(currentPrice.text()) + painting.step))
    $(".image-field").data("number", number);
}

function prev() {
    current--;
    showImage(current);

    if(current === count - 2) {
        $("#next").removeClass("disabled");
    }

    if(current === 0) {
        $("#prev").addClass("disabled");
    }
}

function next(){
    current++;

    const painting = paintings[current];

    if(painting === undefined) {
        const prevEl = $("#prev");
        const nextEl = $("#next");

        const prev_disabled = prevEl.hasClass("disabled");
        const next_disabled = nextEl.hasClass("disabled");

        nextEl.addClass("disabled");
        prevEl.addClass("disabled");

        $.get("/painting", {number: current})
            .done((data) => {
                paintings.push(data)

                if(data.timeout !== null) {
                    data.timer = setInterval(() => {
                        data.timeout--;
                    }, 1000)
                }

                if(!prev_disabled) prevEl.removeClass("disabled");
                if(!next_disabled) nextEl.removeClass("disabled");
                handle();
            })

    } else {
        handle();
    }

    function handle() {
        showImage(current);
        if(current === count - 1) {
            $("#next").addClass("disabled");
        }

        if(current === 1) {
            $("#prev").removeClass("disabled");
        }
    }
}

function up() {
    const number = parseInt($(".image-field").data("number"));
    const painting = paintings[number];

    const priceSetter = $("#price-setting .user-price")
    const currentRaise = parseInt(priceSetter.text());
    priceSetter.text(currentRaise + painting.step);
}

function down() {
    const number = parseInt($(".image-field").data("number"));
    const painting = paintings[number];

    const priceSetter = $("#price-setting .user-price")
    const currentRaise = parseInt(priceSetter.text());

    const startingPrice = $(".starting-price .data");
    const currentPrice = $(".current-price .data");

    if(startingPrice.text() === currentPrice.text()) {
        if(currentRaise - painting.step >= parseInt(currentPrice.text())){
            priceSetter.text(currentRaise - painting.step)
        }
    } else {
        if(currentRaise - painting.step >= parseInt(currentPrice.text()) + painting.step){
            priceSetter.text(currentRaise - painting.step)
        }
    }
}