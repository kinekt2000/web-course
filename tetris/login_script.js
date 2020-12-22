function onLoad() {
    let nickname = localStorage.getItem("nick");
    if(nickname !== null) {
        document.getElementById("login").value = nickname;
    } else {
        document.getElementById("login").value = "";
    }

    let scoreboard = localStorage.getItem("scoreboard");
    console.log(scoreboard);
    if(scoreboard === null) {
        scoreboard = new Array(10);
        for(let i = 0; i < 10; i++) {
            scoreboard[i] = {nick : "..........", score: 0};
        }
        localStorage.setItem("scoreboard", JSON.stringify(scoreboard));
    }
}

function showScoreBoard() {
    document.location.href = "scoreboard.html"
}


function submitAndGo() {
    let nickname = document.getElementById("login").value;
    if(nickname.length < 4) {
        alert("Nickname length must be more than 4 characters");
        return;
    }
    if(nickname.length > 20) {
        alert("Nickname length cannot exceed 20 characters");
        return;
    }

    localStorage.setItem("nick", nickname);
    document.location.href = "game.html";
}
