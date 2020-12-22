const assert = require("assert")
const should = require("should")

const paintings = require("../../Auction2/public/json/paintings.json")
const config = require("../../Auction2/public/json/config.json")
const users = require("../../Auction2/public/json/users.json")

describe("paintings", () => {
    for(let i = 0; i < paintings.length; i++) {
        const painting = paintings[i]

        describe(`painting ${i}`, () => {
            describe(`properties`, () =>{
                it("has property id", () => {
                    painting.should.have.property("id");
                })
                it("has property name", () => {
                    painting.should.have.property("name");
                })
                it("has property author", () => {
                    painting.should.have.property("author");
                })
                it("has property price", () => {
                    painting.should.have.property("price");

                })
                it("has property step", () => {
                    painting.should.have.property("step");

                })
                it("has property description", () => {
                    painting.should.have.property("description");
                })
            })

            describe(`types`, () => {
                it("id is number type", () => {
                    painting.id.should.be.type("number");
                })
                it("name is string type", () => {
                    painting.name.should.be.type("string");
                })
                it("author is string type", () => {
                    painting.author.should.be.type("string");
                })
                it("price is number type", () => {
                    painting.price.should.be.type("number");
                })
                it("step is number type", () => {
                    painting.step.should.be.type("number");
                })
                it("description is string type", () => {
                    painting.description.should.be.type("string");
                })
            })
        })

    }
})

describe("users", () => {
    for(let i = 0; i < users.length; i++) {
        const user = users[i]

        describe(`user ${i}`, () => {
            describe(`properties`, () => {
                it("has property id", () => {
                    user.should.have.property("id")
                })
                it("has property name", () => {
                    user.should.have.property("name")
                })
                it("has property fund", () => {
                    user.should.have.property("fund")
                })
            })

            describe(`types`, () => {
                it("id is number type", () => {
                    user.id.should.be.type("number")
                })
                it("name is string type", () => {
                    user.name.should.be.type("string")
                })
                it("fund is number type", () => {
                    user.fund.should.be.type("number")
                })
            })
        })
    }
})

function timeToInt(time) {
    const [first, second] = time.split(":");
    const iFirst = parseInt(first);
    const iSecond = parseInt(second);
    if(isNaN(iFirst) || isNaN(iSecond)) {
        return null;
    } else {
        return iFirst * 60 + iSecond
    }
}

describe("config", () => {
    describe("date", () => {
        const [y, m, d] = config.auction.date.split("/");
        it("format is 'yy/mm/dd'", () => {
            if(y === undefined) assert.fail("year is undefined")
            if(m === undefined) assert.fail("month is undefined")
            if(d === undefined) assert.fail("day is undefined")

            if(y.length !== 4 || isNaN(parseInt(y))) assert.fail("year has wrong format")
            if(m.length !== 2 || isNaN(parseInt(m))) assert.fail("month has wrong format")
            if(d.length !== 2 || isNaN(parseInt(d))) assert.fail("day has wrong format")
        })

        it("date validation", () => {
            const year = parseInt(y),
                month = parseInt(m),
                day = parseInt(d)

            const date = new Date(year, month - 1, day);
            assert.strictEqual(date.getFullYear(), year)
            assert.strictEqual(date.getMonth() + 1, month)
            assert.strictEqual(date.getDate(), day)

            if(date < new Date()) assert.fail("date must be equal or bigger than today")
        })
    })

    describe("time properties", () => {
        const time = config.auction.time;
        const timeout = config.auction.timeout;
        const countdown = config.auction.countdown;
        const pause = config.auction.pause;

        it("time validation", () => {
            if(isNaN(timeToInt(time))) assert.fail("wrong time")
        })
        it("timeout validation", () => {
            if(isNaN(timeToInt(timeout))) assert.fail("wrong time")
        })
        it("countdown validation", () => {
            if(isNaN(timeToInt(countdown))) assert.fail("wrong time")
        })
        it("pause validation", () => {
            if(isNaN(timeToInt(pause))) assert.fail("wrong time")
        })
    })
})

