function getSuggestions(begin, end, callback) {
    let suggestions = [];
    let requestsDone = 0;
    let loaded = 0;

    for(let i = begin; i < end; i++ ) {
        ajaxRequest("GET", `http://localhost:3000/getSuggestion?number=${i}`,
            (data)=>{
                try {
                    console.log(data)
                    let suggestion = (data) ? JSON.parse(data) : null;
                    if(suggestion) {
                        suggestions[i - begin] = suggestion;
                        loaded++;
                    }
                } catch (e) {
                    console.error(e);
                    corruptedDataResponse();
                }

                if(requestsDone === end - begin - 1) {
                    console.log("callback")
                    callback(suggestions);

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

function createSuggestionBlock(suggestion) {
    let wrapper = document.createElement("div");
    wrapper.classList.add("suggestion");

    let nameBlock = document.createElement("div");
    let nameLabel = document.createElement("span");
    let name = document.createElement("span");

    nameLabel.textContent = "Name:"
    name.textContent = suggestion.name;
    nameBlock.appendChild(nameLabel);
    nameBlock.appendChild(name);

    let authorBlock = document.createElement("div");
    let authorLabel = document.createElement("span");
    let author = document.createElement("span");

    authorLabel.textContent = "Author:"
    author.textContent = suggestion.author;
    authorBlock.appendChild(authorLabel);
    authorBlock.appendChild(author);

    let dateBlock = document.createElement("div");
    let dateLabel = document.createElement("span");
    let date = document.createElement("span");

    dateLabel.textContent = "Published:"
    date.textContent = suggestion.date;
    dateBlock.appendChild(dateLabel);
    dateBlock.appendChild(date);

    wrapper.appendChild(nameBlock);
    wrapper.appendChild(authorBlock);
    wrapper.appendChild(dateBlock);

    let accept = document.createElement("button")
    accept.classList.add("accept")
    accept.addEventListener("click", () => {

        const data = `name=${suggestion.name}&author=${suggestion.author}&publication=${suggestion.date}`;

        ajaxRequest(
            "POST",
            "/addBook",
            () => {
                wrapper.remove();
            },
            () => {

            },
            data
        )
    })

    let iAccept = document.createElement("i");
    iAccept.textContent = "+"
    accept.appendChild(iAccept);

    let reject = document.createElement("button")
    reject.classList.add("reject");
    reject.addEventListener("click", () => {

        const data = `name=${suggestion.name}&author=${suggestion.author}&publication=${suggestion.date}`;

        ajaxRequest(
            "DELETE",
            "/deleteSuggestion",
            () => {
                wrapper.remove();
                iReject.click();
            },
            () => {

            },
            data
        )
    })

    let iReject = document.createElement("i");
    iReject.textContent = "‒"
    reject.appendChild(iReject);

    wrapper.appendChild(accept);
    wrapper.appendChild(reject);

    return wrapper;
}

function loadMore() {
    let count = document.querySelector(".list").children.length;
    getSuggestions(count, count + 10, (suggestions) => {
        suggestions.forEach(suggestion => {
            let suggestionBlock = createSuggestionBlock(suggestion);
            console.log(suggestionBlock);
            document.querySelector(".list").appendChild(suggestionBlock);
        })
    })
}