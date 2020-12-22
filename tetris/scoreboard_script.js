function onLoad() {

    let scoreboard = localStorage.getItem("scoreboard");
    if(scoreboard !== null) {
        scoreboard = JSON.parse(scoreboard);
    }

    for(let i = 0; i < 10; i++) {
        let ul = document.getElementById("list");
        let li = document.createElement("li");

        let elements_count = ul.children.length+1;

        let nick = `..........`;
        let score = '0';
        if(scoreboard !== null) {
            nick = scoreboard[i].nick;
            score = scoreboard[i].score;
        }

        let nick_field = document.createElement("span");
        nick_field.setAttribute("class", "nick text-field line-part");
        nick_field.appendChild(document.createTextNode(nick));

        let score_field = document.createElement("span");
        score_field.setAttribute("class", "score text-field line-part");
        score_field.appendChild(document.createTextNode(score))

        li.setAttribute("id", `element${elements_count}`);
        li.appendChild(nick_field);
        li.appendChild(score_field);

        ul.appendChild(li);
    }
}

function backToMenu() {
    document.location.href = "login.html"
}