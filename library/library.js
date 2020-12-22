const fs = require("fs");

class Library {
    constructor() {
        const data = fs.readFileSync("./json/library.json", "utf8");
        if(!data) {
            console.log("reading library index error");
            return;
        }

        this.index = JSON.parse(data);
        if(!this.index) {
            console.log("parsing library index error");
            return;
        }

        this.IDmanager =  Array(0);

        let prevID = -1;
        for(let i = 0; i < this.index.length; i++) {
            let diff = this.index[i].id - prevID;

            if(diff !== 0) {
                for(let j = prevID + 1; j < prevID + diff; j++) {
                    this.IDmanager.push(j)
                }
            }

            prevID = this.index[i].id;

        }
        console.log("library load");
        console.log(`unused IDs: ${this.IDmanager}`);
    }

    addBook(book) {
        book.id = this.IDmanager.pop();
        this.index.push(book);
    }


    removeBookByNumber(number) {
        const bookToRemove = this.index.slice(number, 1)[0];
        this.IDmanager.push(bookToRemove.id);
    }

    removeBookByID(id) {
        for(let i = 0; i < this.index.length; i++) {
            if(this.index[i].id === id) {
                const bookToRemove = this.index.slice(i, 1)[0];
                this.IDmanager.push(bookToRemove.id);
                return;
            }
        }
    }

    getBookByNumber(number, filter = undefined) {
        if(!filter || (filter.rented === undefined && filter.date === undefined)) {
            return this.index[number];
        }

        for(let i = 0; i < this.index.length; i++) {
            if(filter.rented === true && this.index[i].renting) {
                if(filter.date !== undefined) {
                    let [f_y, f_m, f_d] = filter.date.split(".");

                    let [b_y, b_m, b_d] = this.index[i].renting.releaseDate.split("/");

                    let f_date = new Date(f_y, f_m, f_d);
                    let b_date = new Date(b_y, b_m, b_d);

                    if(f_date >= b_date) {
                        if (number == 0) {
                            return this.index[i];
                        }
                        number--;
                    }

                } else {
                    if (number == 0) {
                        return this.index[i];
                    }
                    number--;
                }
            }

            if(filter.rented === false && !this.index[i].renting) {
                if(number == 0) {
                    return this.index[i];
                }
                number--;
            }
        }
    }

    getBookByID(id) {
        for(let i = 0; i < this.index.length; i++) {
            if(this.index[i].id === id) {
                return this.index[i];
            }
        }
    }

    rewrite() {
        fs.writeFile("./json/library.json", JSON.stringify(this.index), "utf8", () => {
            console.log("library rewrited");
        })
    }
}

module.exports = Library;