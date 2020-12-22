$(() => {
    loadMembers()
    $(".add").click(() => {
        $("form").addClass("show");
    })
    $(".close").click(() => {
        $("form").removeClass("show");
    })
    document.getElementById("overlay").addEventListener("click", () => {
        console.log("click")
        $("form").removeClass("show");
    })
})


function loadMembers(){
    $.ajax({
        url: "/memberlist",
        type: "GET",
        success: (data, txt_status, xhr) => {
            buildList(data)
        },
        error: (xhr, status, error) => {
            let message = xhr.status + ': ' + xhr.statusText;
            alert("Error - " + message);
        }
    })
}

function buildList(data) {
    if(data.length === 0) {
        showEmptyMessage();
    }

    const list = $("<ul class='members'>");
    for(let member of data) {
        console.log(member)
        buildLI(member).appendTo(list);
    }

    list.appendTo($(".wrapper"));
}

function buildLI(data) {
    const memberBlock = $(`<div class='member-wrapper'>`);

    console.log(data.name, data.fund);

    const nameWrapper = $("<div class='member-field name-wrapper'>").appendTo(memberBlock);
    const name = $("<span>").text(data.name).appendTo(nameWrapper).focusout(() => {
        name.attr("contentEditable", "false");
        $.ajax("/member", {
            method: "PUT",
            data: {id: data.id, name: name.text()}
        })
            .fail(() => {
                name.text(name.data("prev"));
            })
    });

    $("<button class='edit edit-name'>").append($('<i class="fas fa-pencil-alt">')).appendTo(nameWrapper).click(() => {
        name.attr("contentEditable", "true");
        name.data("prev", name.text());
        name.focus();
    });

    const fundWrapper = $("<div class='member-field fund-wrapper'>").appendTo(memberBlock);
    const fund = $("<span>").text(data.fund).appendTo(fundWrapper).focusout(() => {
        fund.attr("contentEditable", "false")
        fund.off("keypress");
        $.ajax("/member", {
            method: "PUT",
            data: {id: data.id, fund: fund.text()}
        })
            .fail(() => {
                fund.text(fund.data("prev"))
            })
    });

    $("<button class='edit edit-fund'>").append($('<i class="fas fa-pencil-alt">')).appendTo(fundWrapper).click(() => {
        fund.keypress((e) => {
            const number = parseInt(String.fromCharCode(e.which));
            if(isNaN(number)) e.preventDefault();
        })
        fund.attr("contentEditable", "true");
        fund.data("prev", fund.text())
        fund.focus();
    });

    $("<button class='remove'>").append($("<i class='fas fa-trash-alt'>")).appendTo(memberBlock).click(() => {
        $.ajax("/members", {
            method: "DELETE",
            data: {id: data.id}
        })
            .done(() => {
                memberBlock.parent().remove();
            })
    });

    return $("<li>").append(memberBlock);
}

function showEmptyMessage() {
    $("<div class='empty-message'>")
        .append($("<span>").text("Looks like there is no members"))
        .append($("<span>").text("Do you want to add one?"))
        .appendTo(".wrapper");
}