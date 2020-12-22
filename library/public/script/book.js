function contentLoaded() {
    document.querySelectorAll("button.edit").forEach((button) => {
        button.addEventListener("click", () => {
            document.getElementById(button.dataset.field).setAttribute("contentEditable", "true");
            document.getElementById(button.dataset.field).focus()
        })
    })

    document.querySelectorAll(".data").forEach((el) => {
        el.addEventListener("focusout", ()=> {
            el.setAttribute("contentEditable", "false");

            if(el.tagName === "DIV") return;
            const data = `id=${document.getElementById("id").textContent}&parameter=${el.id}&value=${el.textContent}`
            ajaxRequest("POST", `/bookAttribute/`, () => {}, () => {}, data);
        })
    })
}

function rent() {
    ajaxRequest("POST", '/rent',
        () => {
            location.reload();
        },
        () => {},
        `id=${document.getElementById("id").textContent}`
    )
}

function unrent() {
    ajaxRequest("DELETE", '/unrent',
        () => {
            location.reload();
        },
        () => {},
        `id=${document.getElementById("id").textContent}`
    )
}