const fs = require("fs");

class Container {
    constructor(/*string*/ path) {
        this.path = path;
        const data = fs.readFileSync(path, "utf8");
        if(!data) {
            console.log("reading library index error");
            return;
        }

        this.index = JSON.parse(data);
        if(!this.index) {
            console.log("parsing library index error");
            return;
        }

        this.IDmanager = [];

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
        console.log("container load");
        console.log(`unused IDs: ${this.IDmanager}`);
    }

    addItem(item) {
        item.id = this.IDmanager.pop();
        this.index.push(item);
    }


    removeItemByNumber(number) {
        const itemToRemove = this.index.splice(number, 1)[0];
        this.IDmanager.push(itemToRemove.id);
    }

    removeItemByID(id) {
        for(let i = 0; i < this.index.length; i++) {
            if(this.index[i].id === id) {
                const itemToRemove = this.index.splice(i, 1)[0];
                this.IDmanager.push(itemToRemove.id);
                return;
            }
        }
    }

    getItemByNumber(number) {
        return this.index[number];
    }

    getItemByID(id) {
        for(let i = 0; i < this.index.length; i++) {
            if(this.index[i].id === id) {
                return this.index[i];
            }
        }
    }

    rewrite() {
        fs.writeFile(this.path, JSON.stringify(this.index), "utf8", () => {
            console.log(this.path + " container rewritten");
        })
    }

    get() {
        return this.index;
    }
}

module.exports = Container;