'use strict'

import {Player, Game} from "./classes.js"
import * as HTTP from "./services.js"
import style from './style.scss'

let conn
let gameOver = false
let player = new Player()
player.loadFromCookies()
player.setCookies()
let game = new Game(player)

console.debug(player)
console.debug(game)

/**
 * Initialize DOM variables
 */
let name = document.getElementById('name')
let nameLabel = document.getElementById('nameLabel')
let playerH1 = document.getElementById('player')
let status = document.getElementById('status')
let waiting = document.getElementById('waiting')
let turn = document.getElementById('turn')
let winner = document.getElementById('winner')
let draw = document.getElementById('draw')
let gameTable = document.getElementById('gameTable')
let instructions = document.getElementById('instructions')
let input = document.getElementById('shareLink')
let tooltip = document.getElementById("tooltip")
let startGameForm = document.getElementById('startGameForm')
let joinGameForm = document.getElementById('joinGameForm')
let opponentTileColor = "#992222"
let tileColor = "#229922"

/**
 * Setup
 */
function _setup() {
    if (player.getName()) {
        name.value = player.getName()
        name.classList.add("hide")
        nameLabel.classList.add("hide")
        playerH1.innerText = "Hi " + player.getName()
        playerH1.classList.remove("hide")
    }
}
_setup()


export function Copy (context) {
    console.debug(context.innerText)
    context.select()
    document.execCommand("Copy")
    tooltip.innerHTML = "Copied!"
}
export function TooltipBlur () {
    tooltip.innerHTML = "Copy"
}


if (window.WebSocket) {
    conn = new WebSocket("ws://" + document.location.host + "/ws")
    conn.onclose = function (evt) {
        console.debug("Websocket Closed")
    }
    conn.onmessage = function (evt) {
        let messages = evt.data.split('\n')
        for (var i = 0; i < messages.length; i++) {
            let data = messages[i]
            try {
                data = JSON.parse(data)
            } catch (e) {
                console.error("Error parsing", data)
            }
            console.debug("Message", data)
            if (data.sender === player.getId()) {
                console.debug("My own message received and ignored")
                return
            }
            switch(data.event) {
                case "joining":
                    console.debug("Event: joining")
                    instructions.classList.add("hide")
                    game.players.push(data.player)
                    console.debug(game)
                    _yourTurn()
                    _showGame()
                    break
                case "move":
                    console.debug("Event: move")
                    game.matrix[data.index] = data.player
                    _updateTiles(data.index)
                    _yourTurn()
                    console.debug(game.matrix)
                    break
                case "winner":
                    console.debug("Event: winner")
                    game.matrix[data.index] = data.player
                    _updateTiles(data.index)
                    gameOver = true
                    status.classList.add("hide")
                    turn.classList.add("hide")
                    winner.innerText = "You lose... " + game.getOpponentsName(player.getId()) + " Wins!"
                    winner.classList.remove("hide")
                    _highlightBoard(data.positions)
                    _dimBoard()
                    if (startGameForm)
                        startGameForm.classList.remove("hide")
                    break
                case "draw":
                    console.debug("Event: draw")
                    game.matrix[data.index] = data.player
                    _updateTiles(data.index)
                    gameOver = true
                    status.classList.add("hide")
                    turn.classList.add("hide")
                    winner.innerText = "Its a draw!"
                    winner.classList.remove("hide")
                    _dimBoard()
                    if (startGameForm)
                        startGameForm.classList.remove("hide")
                    break
            }
        }
    }
} else {
    console.error("TicTacToe can only be played in a browser that supports a WebSocket connection.")
}

/**
 * BEGIN Document Listeners
 */
if (startGameForm) {
    startGameForm.addEventListener('submit', event => {
        event.preventDefault()
        if (!_validateForm()) {
            return false
        }
        _createGame().then(resp => {
            name.classList.add("hide")
            nameLabel.classList.add("hide")
            startGameForm.classList.add("hide")
            console.debug("_createGame() success", resp)
            game.turn = resp.turn
            game.matrix = resp.matrix
            console.debug("Game:", game)
            input.value = _getUrl() + "/join/" + game.getId()
            instructions.classList.remove("hide")
            _waiting()
            // _yourTurn()
            // _showGame()
        }).catch(err => {
            console.debug("_createGame() error", err)
            status.innerText = err.message.error
            status.classList.remove("hide")
        })
    })
}
if (joinGameForm) {
    joinGameForm.addEventListener('submit', event => {
        event.preventDefault()
        if (!_validateForm()) {
            return false
        }
        _addPlayer().then(resp => {
            name.classList.add("hide")
            nameLabel.classList.add("hide")
            joinGameForm.classList.add("hide")
            console.debug("_addPlayer() success", resp)
            conn.send(JSON.stringify({
                sender: player.getId(),
                game_id: game.getId(),
                event: "joining",
                player: {
                    id: player.getId(),
                    name: player.getName()
                }
            }))
            game.players.push(new Player(resp.players[0].id, resp.players[0].name))
            _theirTurn()
            _showGame()
        }).catch(err => {
            console.debug("_addPlayer() error", err)
            status.innerText = err.message.error
            status.classList.remove("hide")
        })
    })
}
if (gameTable) {
    document.querySelectorAll('.tile').forEach(element => {
        element.addEventListener('click', event => {
            if (gameOver) {
                console.debug("Game over")
                event.preventDefault()
                return
            }
            let pos = event.target.id.split('_')[1]
            // validate its my turn
            if (game.turn !== player.getId()) {
                console.debug("Not my turn")
                event.preventDefault()
                return
            }
            // validate position available
            if (game.matrix[pos]) {
                console.debug("Tile not free")
                event.preventDefault()
                return
            }
            // set move
            game.matrix[pos] = player.getId()

            // show tile selected
            event.target.style.backgroundColor = tileColor

            // calculate if 3 tiles in a row
            let three = _threeInARow()
            if (three) {
                console.debug("You win!")
                _highlightBoard(three)
                _dimBoard()
                gameOver = true
                winner.innerText = "You Win!!!"
                winner.classList.remove("hide")
                status.classList.add("hide")
                turn.classList.add("hide")
                conn.send(JSON.stringify({
                    sender: player.getId(),
                    game_id: game.getId(),
                    event: "winner",
                    index: pos,
                    player: player.getId(),
                    winner: player.getId(),
                    positions: three
                }))
                if (startGameForm)
                    startGameForm.classList.remove("hide")
                event.preventDefault()
                return
            }

            if (_draw()) {
                console.debug("Draw!")
                _dimBoard()
                gameOver = true
                winner.innerText = "Its a draw!"
                winner.classList.remove("hide")
                status.classList.add("hide")
                turn.classList.add("hide")
                conn.send(JSON.stringify({
                    sender: player.getId(),
                    game_id: game.getId(),
                    event: "draw",
                    index: pos,
                    player: player.getId(),
                    winner: player.getId()
                }))
                if (startGameForm)
                    startGameForm.classList.remove("hide")
                event.preventDefault()
                return
            }

            // send move via socket
            conn.send(JSON.stringify({
                sender: player.getId(),
                game_id: game.getId(),
                event: "move",
                index: pos,
                player: player.getId()
            }))

            _theirTurn()
        })
    })
}
/**
 * END Document Listeners
 */

function _validateForm() {
    if (!name.value) {
        status.innerText = "Name is required."
        status.classList.remove("hide")
        return false
    }
    player.setName(name.value)
    player.setCookies()
    status.classList.add("hide")
    _greeting()
    return true
}
function _getUrl() {
    return document.location.protocol + '//' + document.location.host
}
function _greeting() {
    if (player.getName()) {
        playerH1.innerText = "Hi " + player.getName()
        playerH1.classList.remove("hide")
    }
}
function _createGame() {
    let url = _getUrl()
    return HTTP.POST(`${url}/game`, JSON.stringify(game))
}
function _addPlayer() {
    let url = _getUrl()
    let gid = game.getId()
    let pid = player.getId()
    return HTTP.POST(`${url}/game/${gid}/player/${pid}`, JSON.stringify({ name: document.getElementById('name').value }))
}
function _showGame() {
    gameTable.classList.remove("hide")
}
function _waiting() {
    waiting.innerText = "Waiting for opponent"
    waiting.classList.remove("hide")
}
function _yourTurn () {
    if (waiting)
        waiting.classList.add("hide")
    turn.innerText = "Your Turn"
    turn.classList.remove("hide")
    game.turn = player.getId()
}
function _theirTurn () {
    game.setOpponentsTurn(player.getId())
    turn.innerText = _possessivizer(game.getOpponentsName(player.getId())) + " Turn"
    turn.classList.remove("hide")
}
function _possessivizer(name) {
    if (name.charAt(name.length - 1) === "s") {
        return name + "'"
    } else {
        return name + "'s"
    }
}
function _updateTiles(index) {
    document.getElementById('pos_' + index).style.backgroundColor = opponentTileColor
}
function _threeInARow() {
    for (let i = 0; i <= 8; i) {
        if (game.matrix[i] && (game.matrix[i] === game.matrix[i + 1] && game.matrix[i] === game.matrix[i + 2]) ) {
            return [i, i + 1, i + 2]
        }
        i = i + 3
    }
    for (let i = 0; i <= 2; i++) {
        if (game.matrix[i] && (game.matrix[i] === game.matrix[i + 3] && game.matrix[i] === game.matrix[i + 6]) ) {
            return [i, i + 3, i + 6]
        }
    }
    if (game.matrix[0] && (game.matrix[0] === game.matrix[4] && game.matrix[0] === game.matrix[8])) {
        return [0, 4, 8]
    }
    if (game.matrix[2] && (game.matrix[2] === game.matrix[4] && game.matrix[2] === game.matrix[6])) {
        return [2, 4, 6]
    }
    return false
}
function _draw() {
    for (let i = 0; i < game.matrix.length; i++) {
        if (!game.matrix[i]) {
            return false
        }
    }
    return true
}
function _dimBoard() {
    document.querySelectorAll('td').forEach(el => el.classList.add("dim"))
}

function _highlightBoard (positions) {
    for (let pos of positions) {
        document.querySelector('#pos_' + pos).classList.add("highlight")
    }
}