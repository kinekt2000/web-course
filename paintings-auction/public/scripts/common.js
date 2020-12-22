/******/ (() => { // webpackBootstrap
/*!***********************!*\
  !*** ./src/common.js ***!
  \***********************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
$(() => {
    $(document).scroll(function() {
        navbarScroll();
    });

    function navbarScroll() {
        const y = window.scrollY;
        if (y > 10) {
            $('header').addClass('small');
        } else if (y < 10) {
            $('header').removeClass('small');
        }
    }
})
/******/ })()
;
//# sourceMappingURL=common.js.map