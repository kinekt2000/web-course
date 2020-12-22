$(() => {
    $(document).scroll(function() {
        navbarScroll();
    });

    document.getElementById("menu-overlay").addEventListener("click", () => {
        $(".toggler").prop("checked", false);
    })

    function navbarScroll() {
        const y = window.scrollY;
        if (y > 10) {
            $('header').addClass('small');
        } else if (y < 10) {
            $('header').removeClass('small');
        }
    }
})