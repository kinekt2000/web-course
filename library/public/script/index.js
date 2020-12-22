let loadingInProgress = false
let filter;
function getBooks(begin, end, /* function */ callback) {
    let books = new Array(0);
    let requestsDone = 0;
    let loaded = 0;

    changePageState("Loading...");

    loadingInProgress = true;
    for(let i = begin; i < end; i++ ) {
        let url = `http://localhost:3000/getBook?number=${i}`;
        if(filter) {
            if(!filter.rented) {
                url += `&rented=false`
            } else {
                url += `&rented=true`
                if(filter.date) {
                    url += `&date=${filter.date}`;
                }
            }
        }
        ajaxRequest("GET", url,
            (data)=>{

                try {
                    let book = (data) ? JSON.parse(data) : null;
                    if(book) {
                        books[i - begin] = book;
                        loaded++;
                    }
                } catch (e) {
                    console.error(e);
                    corruptedDataResponse();
                }

                if(requestsDone === end - begin - 1) {
                    callback(books);
                    loadingInProgress = false;

                    if(loaded < end - begin) {
                        changePageState("All books are loaded");
                        setTimeout(()=>{
                            changePageState("");
                        }, 2000);
                    }
                }

                requestsDone++;
            },
            (error) => {
                console.error(`GET request failed! Error code: ${error}`);
            }
        );
    }
}

function corruptedDataResponse() {

}

function parseDate(/*string */ date) {
    const dateParts = date.split('/');
    if(!dateParts[0]){
        return 'unknown';
    }

    if(!dateParts[1]) {
        if(isNaN(new Date(dateParts[0]).getTime())) {
            console.warn("wrong data format");
            return "unknown";
        }

        return dateParts[0];
    }

    if(!dateParts[2]) {
        let temp_date = new Date(dateParts[0], dateParts[1]);

        if(isNaN(temp_date.getTime())) {
            console.warn("wrong data format");
            return dateParts[0];
        }

        let temp_dateParts = temp_date.toDateString().split(" ");
        return `${temp_dateParts[1]} ${temp_dateParts[3]}`
    }

    return new Date(dateParts[0], dateParts[1], dateParts[2]).toDateString();
}

function createBookBlock(book) {

    /* create block */
    let bookBlock = document.createElement("div");
    bookBlock.classList.add("book-block");

    let bookName = document.createElement("span");
    bookName.classList.add("name");
    bookName.textContent = `"${book.name}"`;

    let by = document.createElement("span");
    by.classList.add("by");
    by.textContent = "By:";

    let bookAuthor = document.createElement("span");
    bookAuthor.classList.add("author");
    bookAuthor.textContent = book.author;

    let date = document.createElement("span");
    date.classList.add("date");

    date.textContent = parseDate(book.publication);

    bookBlock.appendChild(bookName);
    bookBlock.appendChild(by);
    bookBlock.appendChild(bookAuthor);
    bookBlock.appendChild(date);

    /* create tooltip */
    let tooltipBlock = document.createElement("div");
    tooltipBlock.classList.add("tooltip");

    let tooltipBookState = document.createElement("span");
    tooltipBookState.classList.add("book-state");

    let tooltipReleaseDate = document.createElement("span");
    tooltipReleaseDate.classList.add("release-date");

    let tooltipRenting = document.createElement("span");
    tooltipRenting.classList.add("renting");

    tooltipBlock.appendChild(tooltipBookState);
    tooltipBlock.appendChild(tooltipReleaseDate);
    tooltipBlock.appendChild(tooltipRenting);

    let bookState = book.renting;
    if(bookState) {
        tooltipBookState.classList.add("unavailable");
        tooltipBookState.textContent = "Out of Library";
        tooltipReleaseDate.textContent = `Rented till ${bookState.releaseDate}`

        if(bookState.name) {
            let user = document.getElementById("user");
            if(user) user = user.textContent;
            if(user) user = JSON.parse(user);

            if(user && user.username === "admin")
                tooltipRenting.textContent = `By: ${bookState.name}`;
        }
    } else {
        tooltipBookState.classList.add("available");
        tooltipBookState.textContent = "Available";
    }

    bookBlock.appendChild(tooltipBlock);
    bookBlock.addEventListener("click", () => {
        location.href = `book/${book.id}`;
    });

    return bookBlock
}

function isFooterInViewport() {
    const rect = document.querySelector("footer").getBoundingClientRect();
    return (rect.top + rect.height * 0.2 <= (window.innerHeight || document.documentElement.clientHeight))
}

function loadMoreBooks() {
    let loaded = document.querySelector(".books-wrapper").children.length;
    getBooks(loaded, loaded + 3, (books) => {
        for(let book of books) {
            let bookBlock = createBookBlock(book);
            document.querySelector(".books-wrapper").appendChild(bookBlock);
        }
    });
}

function initiate(books) {
    let docBooks = document.getElementsByClassName("books-wrapper")[0];
    while(docBooks.firstChild) {
        docBooks.removeChild(docBooks.lastChild);
    }

    for(let book of books) {
        let bookBlock = createBookBlock(book);
        document.querySelector(".books-wrapper").appendChild(bookBlock);
    }

    if(isFooterInViewport()) {
        if(!loadingInProgress)
            loadMoreBooks();
    }

    window.addEventListener('scroll', () => {
        if (!this.lastScrollPosition) {
            this.lastScrollPosition = 0;
        }

        const delta = window.scrollY - this.lastScrollPosition;
        this.lastScrollPosition = window.scrollY;

        if (isFooterInViewport() && delta > 0) {
            if(!this.allowLoading) {
                loadMoreBooks();
                this.allowLoading = true;
            }
        }

        if(delta < 0) {
            this.allowLoading = false;
        }
    });
}

function changePageState(/* string */ message) {
    document.querySelector('.show-page-state').checked = false;
    if(message) {
        setTimeout(() => {
            document.querySelector('.show-page-state').checked = true;
            document.querySelector('.page-state span').textContent = message;
        }, 300);
    }
}

function applyFilter() {
    const available = document.getElementById("available").checked;
    const unavailable = document.getElementById("unavailable").checked;

    if(available) {
        filter = {
            rented: false,
        }
    } else if (unavailable) {
        const year = document.getElementById("year");
        const month = document.getElementById("month");
        const day = document.getElementById("day");

        let date;
        if(year.value, month.value, day.value) {
            date = `${year.value}.${month.value}.${day.value}`
        }

        filter = {
            rented: true,
            date: date
        }
    } else {
        return;
    }

    getBooks(0, 3, initiate);
}

function clearFilter() {
    filter = null;
    getBooks(0, 3, initiate);

    document.getElementById("available").checked = false;
    document.getElementById("unavailable").checked = false;

    document.querySelectorAll("input[type=number]").forEach(input => {
        input.value = "";
    });
}

function checkDate() {
    let year = document.getElementById("year");
    let yearValue = parseInt(year.value);
    if(yearValue < 1000) yearValue = undefined

    let month = document.getElementById("month");
    let monthValue = parseInt(month.value);
    if(monthValue === 0) monthValue = undefined;

    let day = document.getElementById("day");
    let dayValue = parseInt(day.value);
    if(dayValue === 0) dayValue = undefined;

    if(!year.value && !month.value && !day.value) {
        approveDate();
        return;
    }

    const date = new Date(yearValue, monthValue, dayValue);

    if(!isNaN(date.getFullYear())) {
        if(yearValue !== date.getFullYear()) {
            rejectDate();
            return;
        }

        if(monthValue !== date.getMonth()) {
            rejectDate();
            return;
        }

        if(dayValue !== date.getDate()) {
            rejectDate()
            return;
        }

        approveDate();

    } else {
        rejectDate()
    }

    // let atLeastOne = false
    // for(const input of [year, month, day]) {
    //     atLeastOne = input.validity.valid;
    // }
    //
    // if(atLeastOne) {
    //     for (const input of [year, month, day]) {
    //         if(!input.validity.valid) {
    //             rejectDate()
    //             return;
    //         }
    //     }
    // }

    function rejectDate() {
        year.setCustomValidity("Wrong data");
        month.setCustomValidity("Wrong data");
        day.setCustomValidity("Wrong data");
    }

    function approveDate() {
        year.setCustomValidity("");
        month.setCustomValidity("");
        day.setCustomValidity("");
    }
}
