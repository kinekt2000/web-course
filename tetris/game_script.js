/* drawing place aka context */
let context;
let canvas_width = 332;
let canvas_height = 655;
let stats_width = 241;

/* initialize page with canvas and run game*/
let scoreboard;
function onLoad() {
    /* initialize */

    let canvas = document.createElement("canvas");
    context = canvas.getContext("2d");
    canvas.width = canvas_width + stats_width;
    canvas.height = canvas_height;

    document.getElementById("canvas-wrapper").appendChild(canvas);
    document.addEventListener("keydown", handleKeyboardEvent);

    let nickname = localStorage.getItem("nick");
    if(nickname === null || nickname.length === 0) {
        nickname = "undefined";
    }
    document.getElementById("nickname").textContent = nickname;

    scoreboard = localStorage.getItem("scoreboard");
    if(scoreboard !== null) {
        scoreboard = JSON.parse(scoreboard);
    }

    audioMaster.setSoundsVolume(0);
    audioMaster.setMusicVolume(0);
    audioMaster.play("game-music");

    /* run */
    run();
}

function changeSounds(){
    let slider = document.getElementById("sounds");
    let value = slider.value;

    audioMaster.setSoundsVolume(value);

}

function changeMusic(){
    let slider = document.getElementById("music");
    let value = slider.value;

    audioMaster.setMusicVolume(value);
}

const cell_size = 30;
const outline_thick = 5;
const width = 10;
const height = 24

const BlockType = {
    I: 0, S: 1, Z: 2,
    L: 3, J: 4, T: 5,
    O: 6
}

const Direction = {
    UP: 0, RIGHT: 1,
    DOWN: 2, LEFT: 3
}

class ColorTable {
    constructor() {
        this.table = ["#5A5A5A", "#FF6666", "#FFB266",
                      "#FFFF66", "#66FF66", "#66FFFF",
                      "#6666FF", "#FF66FF", "#FFCCE5"];
    }

    getColorID(color) {
        for(let i = 0; i < 9; i++) {
            if(color === this.table[i])
                return i;
        }
        return 0;
    }

    getColor(id) {
        if(id > 0 && id < 9) {
            return this.table[id];
        }
        return this.table[0];
    }
}

colorTable = new ColorTable;

class AudioMaster {
    constructor() {
        this.audioLib = new Map;
        this.audioLib.set("fall", new Audio("sounds/fall.wav"));
        this.audioLib.set("gameover", new Audio("sounds/gameover.wav"));
        this.audioLib.set("line", new Audio("sounds/line.wav"));
        this.audioLib.set("game-music", new Audio("sounds/game.ogg"));

        this.sounds = new Array(0);
        this.sounds.push(this.audioLib.get("fall"));
        this.sounds.push(this.audioLib.get("line"));

        this.music = new Array(0);
        this.music.push(this.audioLib.get("gameover"));
        this.music.push(this.audioLib.get("game-music"));

        // loop game-music
        this.audioLib.get("game-music").addEventListener("ended", function () {
            this.audioLib.get("game-music").play();
        });

        for(let audio of this.audioLib) {
            audio.muted = true;
        }
    }

    setMusicVolume(value){
        if(value < 0) value = 0;
        if(value > 1) value = 1;

        for(let music of this.music) {
            music.volume = value;
            music.muted = value === 0;
        }
    }

    setSoundsVolume(value) {
        if(value < 0) value = 0;
        if(value > 1) value = 1;

        for(let sound of this.sounds) {
            sound.volume = value;
            sound.muted = value === 0;
        }
    }

    play(name){
        let audio = this.audioLib.get(name);
        console.log(audio);
        if(audio !== null) {
            audio.play();
        }
    }
}

audioMaster = new AudioMaster();

class Block {
    constructor(pos_x, pos_y, type, rotation = "random") {
        this.figure = [[0, 0, 0, 0],
                       [0, 0, 0, 0],
                       [0, 0, 0, 0],
                       [0, 0, 0, 0]];

        this.pos_x = pos_x;
        this.pos_y = pos_y;

        if(type === "random") {
            type = Math.floor(Math.random()*7);
        }

        this.type = type;
        switch (type) {
            case BlockType.I:
                this.figure[0][1] = 1; // . % . .
                this.figure[1][1] = 1; // . % . .
                this.figure[2][1] = 1; // . % . .
                this.figure[3][1] = 1; // . % . .
                this.color = colorTable.getColor(1);
                break;

            case BlockType.S:
                this.figure[1][1] = 1; // . . . .
                this.figure[2][1] = 1; // . % . .
                this.figure[2][2] = 1; // . % % .
                this.figure[3][2] = 1; // . . % .
                this.color = colorTable.getColor(2);
                break;

            case BlockType.Z:
                this.figure[0][2] = 1; // . . % .
                this.figure[1][2] = 1; // . % % .
                this.figure[1][1] = 1; // . % . .
                this.figure[2][1] = 1; // . . . .
                this.color = colorTable.getColor(3);
                break;

            case BlockType.L:
                this.figure[1][1] = 1; // . . . .
                this.figure[2][1] = 1; // . % . .
                this.figure[3][1] = 1; // . % . .
                this.figure[3][2] = 1; // . % % .
                this.color = colorTable.getColor(4);
                break;

            case BlockType.J:
                this.figure[0][2] = 1; // . . % .
                this.figure[1][2] = 1; // . . % .
                this.figure[2][2] = 1; // . % % .
                this.figure[2][1] = 1; // . . . .
                this.color = colorTable.getColor(5);
                break;

            case BlockType.T:
                this.figure[0][1] = 1; // . % . .
                this.figure[1][1] = 1; // . % % .
                this.figure[1][2] = 1; // . % . .
                this.figure[2][1] = 1; // . . . .
                this.color = colorTable.getColor(6);
                break;

            case BlockType.O:
                this.figure[1][1] = 1; // . . . .
                this.figure[1][2] = 1; // . % % .
                this.figure[2][1] = 1; // . % % .
                this.figure[2][2] = 1; // . . . .
                this.color = colorTable.getColor(7);
                break;

            default:
                console.log("Wrong figure type");
        }

        let rotates;
        if(rotation >= 0 && rotation <= 3){
            rotates = rotation;
        } else {
            rotates = Math.floor(Math.random() * 3);
        }
        for(let i = 0; i < rotates; i++) {
            this.rotateLeft();
        }

        this._ground();
    }

    _ground() {
        let empty_rows = 0;
        for(let i = 3; i > 0; i--){
            let empty = 0;
            for(let j = 0; j < 4; j++){
                if(this.figure[i][j] !== 0) {
                    empty += 1;
                }
            }

            if(empty === 0) {
                empty_rows += 1;
            } else {
                break;
            }
        }

        this.pos_y += empty_rows;
    }

    rotateLeft() {
        let rotated = new Array(4);
        for(let i = 0; i < 4; i++) {
            rotated[i] = new Array(4);
            for(let j = 0; j < 4; j++) {
                rotated[i][j] = 0;
            }
        }

        for(let i = 0; i < 4; i++) {
            for(let j = 0; j < 4; j++) {
                if(this.figure[i][j] === 1) {
                    rotated[3-j][i] = 1;
                }
            }
        }

        this.figure = rotated;
    }

    rotateRight() {
        let rotated = new Array(4);
        for(let i = 0; i < 4; i++) {
            rotated[i] = new Array(4);
            for(let j = 0; j < 4; j++) {
                rotated[i][j] = 0;
            }
        }

        for(let i = 0; i < 4; i++) {
            for(let j = 0; j < 4; j++) {
                if(this.figure[i][j] === 1) {
                    rotated[j][3-i] = 1;
                }
            }
        }

        this.figure = rotated;
    }

    checkCollision(pit) {
        for(let i = 0; i < 4; i++) {
            for(let j = 0; j < 4; j++) {
                if(this.figure[i][j] === 1) {
                    if(i + this.pos_y + 4 > 0) {
                        if(pit.field[i + this.pos_y + 4][j + this.pos_x]) {
                            return -1;
                        }
                    }

                    if(j + this.pos_x < 0) {
                        return Direction.LEFT;
                    }
                    if(j + this.pos_x >= width) {
                        return Direction.RIGHT;
                    }
                    if(i + this.pos_y < -4){
                        return Direction.UP;
                    }
                    if(i + this.pos_y + 4 >= height) {
                        return Direction.DOWN;
                    }
                }
            }
        }

        return 0;
    }

    move(direction) {
        switch(direction) {
            case Direction.LEFT:
                this.pos_x -= 1;
                break;

            case Direction.RIGHT:
                this.pos_x += 1;
                break

            case Direction.UP:
                this.pos_y -= 1
                break;

            case Direction.DOWN:
                this.pos_y += 1;
                break;
        }
    }

    draw(context) {
        context.lineWidth = outline_thick;
        for(let y = 0; y < 4; y++) {
            for(let x = 0; x < 4; x++) {
                if(this.figure[y][x] !== 0) {
                    let canvas_x = outline_thick + (x + this.pos_x) * (cell_size + outline_thick/2);
                    let canvas_y = outline_thick + (y + this.pos_y) * (cell_size + outline_thick/2);

                    context.strokeStyle = "#000000";
                    context.strokeRect(canvas_x, canvas_y, cell_size, cell_size);

                    context.fillStyle = this.color;
                    context.fillRect(canvas_x, canvas_y, cell_size, cell_size);
                }
            }
        }
    }
}


class Pit {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.field = new Array(height);

        // '+4' -  area of blocks spawning;
        for(let i = 0; i < height + 4; i++) {
            this.field[i] = new Array(width);
            for(let j = 0; j < width; j++) {
                this.field[i][j] = 0;
            }
        }
    }

    addBlock(block) {
        for(let i = 0; i < 4; i ++) {
            for(let j = 0; j < 4; j++) {
                if(block.figure[i][j] === 1) {
                    this.field[i + block.pos_y + 4][j + block.pos_x] = colorTable.getColorID(block.color);
                    if(i + block.pos_y < 0) {
                        this.gameOver = true;
                    }
                }
            }
        }
    }

    checkLines() {
        let first_frame = false;
        let count = 0;

        for(let i = 0; i < height; i++) {
            let full_line = true;

            for(let j = 0; j < width; j++) {
                if(this.field[i][j] === 0) full_line = false;
            }

            if(full_line) {
                let line_marked = true;
                let j;

                for(j = 0; j < width/2; j++) {
                    if(this.field[i][j] !== 8) {
                        line_marked = false;
                        this.field[i][j] = 8;
                        this.field[i][width - 1 - j] = 8;
                        break;
                    }
                }

                if(j === 0) first_frame = true;

                if(line_marked) {
                    for(let r = i; r > 0; r--) {
                        for(let c = 0; c < width; c++) {
                            this.field[r][c] = this.field[r-1][c];
                        }
                    }
                    count += 1;
                }
            }
        }

        if(first_frame) {
            audioMaster.play("line");
        }
        return count;
    }

    draw(context) {
        for(let y = 4; y < this.height; y++) {
            for(let x = 0; x < this.width; x++) {
                let canvas_x = outline_thick + x * (cell_size + outline_thick/2);
                let canvas_y = outline_thick + (y - 4) * (cell_size + outline_thick/2);

                context.lineWidth = outline_thick;

                context.strokeStyle = "#404040";

                context.strokeRect(canvas_x, canvas_y, cell_size, cell_size);

                context.fillStyle = colorTable.getColor(this.field[y][x]);
                context.fillRect(canvas_x, canvas_y, cell_size, cell_size);
            }
        }
    }
}


let score = 0;
class Statistics {

    constructor() {
        this.nextBlockIndicatorSize = 140;
        this.nextBlockIndicatorPosX = canvas_width + (stats_width - this.nextBlockIndicatorSize)/2;
        this.nextBlockIndicatorPosY = 50;

        this.nextBlockProjectionPosX = this.nextBlockIndicatorPosX + 2;
        this.nextBlockProjectionPosY = this.nextBlockIndicatorPosY + 2;

        this.blocks = new Array(7);
        this.blocks[0] = new Block(0, 0, BlockType.I, 1);
        this.blocks[1] = new Block(0, 0, BlockType.S, 1);
        this.blocks[2] = new Block(0, 0, BlockType.Z, 3);
        this.blocks[3] = new Block(0, 0, BlockType.L, 1);
        this.blocks[4] = new Block(0, 0, BlockType.J, 3);
        this.blocks[5] = new Block(0, 0, BlockType.T, 3);
        this.blocks[6] = new Block(0, 0, BlockType.O, 0);

        this.blockStatsPosY = this.nextBlockIndicatorPosY + this.nextBlockIndicatorSize + 30;
        this.blockStatsPosX = canvas_width + 20;

        this.blockStats = new Map();
        this.blockStats.set(BlockType.I, {val :0});
        this.blockStats.set(BlockType.S, {val :0});
        this.blockStats.set(BlockType.Z, {val :0});
        this.blockStats.set(BlockType.L, {val :0});
        this.blockStats.set(BlockType.J, {val :0});
        this.blockStats.set(BlockType.T, {val :0});
        this.blockStats.set(BlockType.O, {val :0});

    }

    scoreBlock(blockType) {
        this.blockStats.get(blockType).val++;
    }

    draw(context) {
        context.fillStyle = "#404040";
        context.fillRect(canvas_width, 0, stats_width, canvas_height);

        context.fillStyle = colorTable.getColor(0);
        context.fillRect(
            this.nextBlockIndicatorPosX,
            this.nextBlockIndicatorPosY,
            this.nextBlockIndicatorSize,
            this.nextBlockIndicatorSize
        );

        context.strokeStyle = "#000000";
        context.fillStyle = nextBlock.color;
        context.lineWidth = outline_thick/2;
        for(let i = 0; i < 4; i++) {
            for(let j = 0; j < 4; j++) {
                if(nextBlock.figure[i][j] !== 0) {
                    let canvas_x = this.nextBlockProjectionPosX + outline_thick + j * (cell_size + outline_thick/2);
                    let canvas_y = this.nextBlockProjectionPosY + outline_thick + i * (cell_size + outline_thick/2);

                    context.fillRect(canvas_x, canvas_y, cell_size, cell_size);
                    context.strokeRect(canvas_x, canvas_y, cell_size, cell_size);
                }
            }
        }

        context.font = "normal normal bold 20px sans-serif";
        context.fillStyle = "#B0B0B0";
        context.fillText(`Score: ${score}`, canvas_width + 10, 230, 220);

        let offset = 0
        let size = 20
        let line_width = 2;
        for(let i = 0; i < 7; i++) {

            context.lineWidth = 2;
            context.strokeStyle = "#000000";
            context.font = "normal normal bold 15px sans-serif";
            context.fillStyle =  this.blocks[i].color;

            let canvas_x = this.blockStatsPosX

            let canvas_y = this.blockStatsPosY + offset;
            for(let y = 0; y < 4; y++) {
                for(let x = 0; x < 4; x++) {
                    let exists = this.blocks[i].figure[y][x];
                    if(exists !== 0) {
                        let cell_x = canvas_x + x * (size + line_width);

                        let cell_y = canvas_y + y * (size + line_width);
                        context.fillRect(cell_x, cell_y, size, size);
                        context.strokeRect(cell_x, cell_y, size, size);
                    }
                }
            }

            context.fillStyle = "#B0B0B0";
            let score = `: ${this.blockStats.get(this.blocks[i].type).val}`
            context.fillText(score, canvas_x + size * 4 + line_width * 4 + 10, canvas_y + size * 3 + line_width * 2, 100);

            offset += size*3;
        }

        context.strokeStyle = "#000000";
        context.strokeRect(canvas_width + 1, 1, stats_width - 1, canvas_height - 1);
    }
}


let startingTime;
let lastTime;
let totalElapsedTime;
let elapsedSinceLastLoop;


let stop = false;
function run() {

    if(stop === true) {
        context.fillStyle = "#000000C0";
        context.fillRect(0, 0, canvas_width, canvas_height);
        return;
    }

    let currentTime = Date.now();

    if(!startingTime) {
        startingTime = currentTime;
    }
    if(!lastTime) {
        lastTime = currentTime;
    }
    totalElapsedTime = (currentTime - startingTime);
    elapsedSinceLastLoop = (currentTime - lastTime);
    lastTime = currentTime;

    update(elapsedSinceLastLoop);
    render();

    requestAnimationFrame(run);
}

let currBlock = new Block(3, -4, "random", "random");
let nextBlock = new Block(3, -4, "random", "random");
let pit = new Pit(width, height);
let stats = new Statistics();


let dropBlock = 0;
let difficulty = 0;
update.autoMoveTimer = 0;
update.fullLinesTimer = 0;
function update(msTime) {
    update.autoMoveTimer += msTime;
    update.fullLinesTimer += msTime;

    if(difficulty > 90) difficulty = 90;

    let timeDecrease = (dropBlock > 0) ? (dropBlock * 499) : (5 * difficulty);

    if(update.autoMoveTimer > 500 - timeDecrease) {
        currBlock.move(Direction.DOWN);
        update.autoMoveTimer = 0;
    }

    if(update.fullLinesTimer > 100) {
        update.fullLinesTimer = 0;
        let disappeared_lines = pit.checkLines();
        if(disappeared_lines > 0) {
            difficulty += 2;
        }
        for(let i = 0; i < disappeared_lines; i++){
            score += (i + 1) * 5;
        }
    }

    if(currBlock.checkCollision(pit) === -1 || currBlock.checkCollision(pit) === Direction.DOWN) {
        audioMaster.play("fall");

        stats.scoreBlock(currBlock.type);
        score += 5;
        difficulty += 0.5;

        currBlock.move(Direction.UP);
        pit.addBlock(currBlock);
        currBlock = nextBlock;
        nextBlock = new Block(3, -4, "random", "random");
        dropBlock = 0;
    }

    if(pit.gameOver === true) {
        audioMaster.play("gameover");
        gameOver();
    }
}

function handleKeyboardEvent(event) {

    if(dropBlock === 1) return;

    switch(event.code) {
        case "ArrowUp":
            currBlock.rotateLeft();
            let collision = currBlock.checkCollision(pit);
            if(collision === -1) {
                currBlock.rotateRight();
            } else {
                switch (collision) {
                    case Direction.LEFT:
                        do {
                            currBlock.move(Direction.RIGHT)
                        } while (currBlock.checkCollision() !== 0);
                        break;

                    case Direction.RIGHT:
                        do {
                            currBlock.move(Direction.LEFT)
                        } while (currBlock.checkCollision() !== 0);
                        break;

                    case Direction.DOWN:
                        do {
                            currBlock.move(Direction.UP)
                        } while (currBlock.checkCollision() !== 0);
                        break;
                }
            }
            break;

        case "ArrowDown":
            currBlock.move(Direction.DOWN)
            if(currBlock.checkCollision(pit) !== 0) {
                currBlock.move(Direction.UP);
            }
            break;

        case "ArrowLeft":
            currBlock.move(Direction.LEFT)
            if(currBlock.checkCollision(pit) !== 0) {
                currBlock.move(Direction.RIGHT);
            }
            break;

        case "ArrowRight":
            currBlock.move(Direction.RIGHT)
            if(currBlock.checkCollision(pit) !== 0) {
                currBlock.move(Direction.LEFT);
            }
            break;

        case "Enter":
            dropBlock = 1;
            break;

        case "Escape":
            pauseGame();
            break;

        default:
            console.log(event.code);
    }
}

function render() {
    context.clearRect(0, 0, canvas_width, canvas_height);
    pit.draw(context);
    currBlock.draw(context);
    stats.draw(context);


    context.strokeStyle = "#000000"
    context.lineWidth = 6;
    context.strokeRect(1, 1, canvas_width-1, canvas_height-1);

    context.strokeRect(canvas_width+1, 1, stats_width-1, canvas_height-1);
}


function pauseGame() {
    stop = true;
    document.getElementById("pause").checked = true;
}

function gameOver() {
    stop = true;

    scoreboard.push({nick: localStorage.getItem("nick"), score: score});
    scoreboard.sort((a, b) => {
        return b.score - a.score;
    })
    scoreboard.pop();

    let scoreboardToStore = JSON.stringify(scoreboard);
    localStorage.setItem("scoreboard", scoreboardToStore);


    document.getElementById("score").textContent = score;
    document.getElementById("game-over").checked = true;
}

function exitGame() {
    let nickname = localStorage.getItem("nick");
    if(nickname === "undefined") {
        localStorage.removeItem("nick");
    }

    document.location.href = "login.html";
}

function continueGame() {
    document.getElementById("pause").checked = false;
    stop = false;
    run();
}

function goToScoreboard() {
    document.location.href = "scoreboard.html";
}

