
$(() => {
    let socket = io.connect("http://localhost:3030");
    socket.on("connected_message", (data) => {
        $("#trading-state ul")
            .append($(`<li>`)
                .append($(`<span class="message-type connected">Connected:<\span>`).css("color", data.color))
                .append($(`<span>${data.name}</span>`).css("color", data.color))
            )
    })

    socket.on("raise", (data) => {
        $("#trading-state ul")
            .append($(`<li>`)
                .append($(`<span class="message-type raised">Raised:<\span>`).css("color", data.color))
                .append($(`<span>${data.painting} by ${data.name} to ${data.price}</span>`).css("color", data.color))
            )

        const $block = $(`.painting-block`).eq(data.paintingNumber);
        $block.find(".current").text(data.price);
        $block.find(".buyer").text(data.name);
    })

    socket.on("sold", (data) => {
        $("#trading-state ul")
            .append($(`<li>`)
                .append($(`<span class="message-type sold">Sold:<\span>`).css("color", data.color))
                .append($(`<span>${data.painting} to ${data.name} for ${data.price}</span>`).css("color", data.color))
            )

        const $block = $(`.painting-block`).eq(data.paintingNumber);
        $block.find(".current").text(data.price);
        $block.find(".buyer").text(data.name);
        $block.find("p:first-of-type")
            .removeClass("notsold")
            .addClass("sold")
            .text("SOLD");
    })

    socket.on("disconnected_message", (data) => {
        $("#trading-state ul")
            .append($(`<li>`)
                .append($(`<span class="message-type connected">Disconnected:<\span>`).css("color", data.color))
                .append($(`<span>${data.name}</span>`).css("color", data.color))
            )
    })
})