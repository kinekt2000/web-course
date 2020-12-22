$(()=> {
    $('.list').empty();
    loadImages(0, 3);

    let lastScrollTop = 0;
    $(window).scroll(() => {
        const currentScrollTop = $(window).scrollTop();
        if(currentScrollTop > lastScrollTop){
            if(isFooterInViewPort()) {
                const from = $('.list').children().length;
                loadImages(from, from + 3);
            }
        }

        lastScrollTop = currentScrollTop;
    })

    $(".locker").click(() => {
        $(".upload-modal").removeClass("show");
    })

    $(".upload-modal .close").click(() => {
        $(".upload-modal").removeClass("show");
    })

    const submit = $(".upload-submit").click(() => {
        submit.text("uploading");

        const form = $(".upload-modal form")[0];
        const data = new FormData(form);
        submit.prop("disabled", true);

        $.ajax({
            type: "PUT",
            enctype: "multipart/form-data",
            url: "/upload",
            data: data,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 600000,
        })
            .done((data, txt_status, xhr) => {
                location.reload();
            })
            .fail((xhr, txt_error, error) => {
                $(".upload-modal form").prepend($("<span>").text(xhr.responseText));
            })
            .always(() => {
                submit.text("Submit");
                submit.prop("disabled", false);
            })
    })
})

function isFooterInViewPort() {
    const rect = document.querySelector("footer").getBoundingClientRect();
    return (rect.top + rect.height * 0.2 <= (window.innerHeight || document.documentElement.clientHeight))
}

let loading = false;
function loadImages(/*number*/ from, /*number*/to) {
    if(loading === true) return;
    loading = true;

    let images = [];
    let completed = 0;
    for(let i = from; i < to; i++) {
        $.ajax({
            url: `/painting?number=${i}`,
            type: "GET",
            success: (data, txt_status, xhr) => {
                if(xhr.status === 200) {
                    images[i-from] = data;
                } else {
                    console.error(status);
                }

                completed++;

                if(completed === 3) {
                    completed = 0;
                    showImages();
                    loading = false;
                }
            },
            error: () => {
                completed++;
                if(completed === 3) {
                    completed = 0;
                    showImages();
                    loading = false;
                }
            }
        })
    }

    function showImages() {
        images.forEach((value) => {
            createPaintingBlock(value).appendTo($('.list'));
        })
    }
}


function createPaintingBlock(painting) {
    //create block
    let wrapper = $('<div class="painting-wrapper">').attr("data-tooltip", "...");

    $.get("/pars", {id: painting.id})
        .done((data) => {
            const message = (data === "true") ? "Presented" : "Not presented";
            wrapper.attr("data-tooltip", message);

            if(message === "Presented") {
                console.log("presented dis")
                putup.prop("disabled", true)
            } else {
                console.log("not presented dis")
                remove.prop("disabled", true)
            }
        })

    $(`<img src="./build/images/${painting.id}.jpg" alt="${painting.name}">`).appendTo(wrapper);
    $('<span class="name">').appendTo(wrapper).text(painting.name);
    $('<span class="author">').appendTo(wrapper).text(`By: ${painting.author}`);

    //create modal
    let modal_wrapper = $('<div class="modal-painting">');
    $(`<img src="./build/images/${painting.id}.jpg" alt="${painting.name}">`).appendTo(modal_wrapper);

    modal_wrapper.append($("<button class='edit'>")
        .append($("<i class='fas fa-pencil-alt'>"))
        .click(() => {
            uploadDialog(painting.id)
        }))

    let data_wrapper = $('<div class="data">').appendTo(modal_wrapper);

    const name_wrapper = $('<span class="name">');
    const name = $('<span>')
        .text(painting.name)
        .focusout(() => {
            name.attr("contentEditable", "false");
            $.ajax("/painting", {
                method: "PUT",
                data: {id: painting.id, name: name.text()}
            })
                .fail(() => {
                    name.text(name.data("prev"));
                })
        })
        .appendTo(name_wrapper);
    name_wrapper.append($("<button class='edit'>")
            .append($("<i class='fas fa-pencil-alt'>"))
            .click(() => {
                name.data("prev", name.text());
                name.attr("contentEditable", "true");
                name.focus();
            }))
        .appendTo(data_wrapper)

    const author_wrapper = $('<span class="author">');
    author_wrapper.append($("<span>").text("By:"))
    const author = $("<span class='author-field'>")
        .text(painting.author)
        .focusout(() => {
            author.attr("contentEditable", "false");
            $.ajax("/painting", {
                method: "PUT",
                data: {id: painting.id, author: author.text()}
            })
                .fail(() => {
                    author.text(author.data("prev"));
                })
        })
        .appendTo(author_wrapper);
    author_wrapper.append($("<button class='edit'>")
            .append($("<i class='fas fa-pencil-alt'>"))
            .click(() => {
                author.data("prev", author.text());
                author.attr("contentEditable", "true");
                author.focus();
            }))
        .appendTo(data_wrapper);

    const price_wrapper = $('<span class="price">');
    price_wrapper.append($("<span>").text("Starting Price:"));
    const price = $("<span>")
        .text(painting.price)
        .focusout(() => {
            price.attr("contentEditable", "false");
            $.ajax("/painting", {
                method: "PUT",
                data: {id: painting.id, price: price.text()}
            })
                .fail(() => {
                    price.text(price.data("prev"));
                })
        })
        .appendTo(price_wrapper);
    price_wrapper.append($("<button class='edit'>")
        .append($("<i class='fas fa-pencil-alt'>"))
        .click(() => {
            price.data("prev", price.text());
            price.attr("contentEditable", "true");
            price.focus();
        }))
        .appendTo(data_wrapper);


    const desc_wrapper = $("<div>").appendTo(data_wrapper);
    const desc = $('<p class=description>').appendTo(desc_wrapper).text(`${painting.description}`);
    desc_wrapper.append($("<button class='edit'>")
        .append($("<i class='fas fa-pencil-alt'>"))
        .click(() => {
            desc.data("prev", desc.text());
            desc.attr("contentEditable", "true");
            desc.focus();
        }));
    desc.focusout(() => {
        desc.attr("contentEditable", "false");
        $.ajax("/painting", {
            method: "PUT",
            data: {id: painting.id, description: desc.text()}
        })
            .fail(() => {
                desc.text(desc.data("prev"));
            })
    })

    modal_wrapper.appendTo(wrapper);


    let btns = $('<div class="buttons">').appendTo(data_wrapper);
    let remove = $('<button type="button" class="remove">').appendTo(btns).text("remove").click(() => {
        $.ajax("remove", {
            method: "PUT",
            data: {id: painting.id}
        })
            .done(() => {
                wrapper.attr("data-tooltip", "Not presented");
                putup.attr("disabled", false);
                remove.attr("disabled", true);
            })
    });

    let putup = $('<button type="button" class="put-up">').appendTo(btns).text("put up").click(() => {
        $.ajax("put-up", {
            method: "PUT",
            data: {id: painting.id}
        })
            .done(() => {
                wrapper.attr("data-tooltip", "Presented");
                putup.attr("disabled", true);
                remove.attr("disabled", false);
            })
    });


        wrapper.on("click", wrapperClickHandler);

    $('<div class="overlay">').appendTo(wrapper).on("click", () => {
        wrapper.off("click");
        $(".modal-painting").removeClass("show");
        unlockScroll();
        setTimeout(() => {
            wrapper.on("click", wrapperClickHandler);
        }, 500);
    });

    return wrapper;

    function wrapperClickHandler() {
        $(".modal-painting").removeClass("show");
        modal_wrapper.addClass("show");
        lockScroll();
    }

    function lockScroll() {
        // Get the current page scroll position
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        // if any scroll is attempted, set this to the previous value
        window.onscroll = function() {
            window.scrollTo(scrollLeft, scrollTop);
        };
    }

    function unlockScroll() {
        window.onscroll = function() {};
    }
}

function uploadDialog(id) {
    $(".upload-modal").addClass("show")
    $(".upload-modal form #upload-id").val(id);
}