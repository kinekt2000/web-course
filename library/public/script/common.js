let stickyBar;
let siteName;

function onLoad() {
    stickyBar = document.getElementById("sticky-bar");
    siteName = document.getElementById("site-name");
    window.addEventListener("scroll", displayStickyBar);
    displayStickyBar();
}

function displayStickyBar() {
    if(window.scrollY >= 300) {
        stickyBar.classList.add("fixed-header");
        siteName.classList.add("visible-title");
    } else {
        stickyBar.classList.remove("fixed-header");
        siteName.classList.remove("visible-title")
    }
}


function flashLoad() {
    setTimeout(()=> {
        document.querySelectorAll(".flash").forEach((item) => {
            item.classList.add("hidden");
        })
        setTimeout(()=>{
            document.querySelectorAll(".flash").forEach((item) => {
                item.remove();
            });
        }, 1000);
    }, 2000)
}


function logout() {
    ajaxRequest("DELETE", '/logout', (responseText) => {
        location.reload();
    });
}