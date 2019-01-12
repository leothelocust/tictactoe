'use strict'

import {Player, Game} from "./classes.js"
import * as HTTP from "./services.js"
import style from './style.scss'
import { join } from "path";

/**
 * Initialize DOM variables
 */
let name = document.getElementById('name')
let nameLabel = document.getElementById('nameLabel')
let playerH1 = document.getElementById('player')
let status = document.getElementById('status')
let gameTable = document.getElementById('gameTable')
let instructions = document.getElementById('instructions')
let shareLink = document.getElementById('shareLink')
let tooltip = document.getElementById("tooltip")
let startGameForm = document.getElementById('startGameForm')
let joinGameForm = document.getElementById('joinGameForm')
let opponentTileColor = "#992222"
let tileColor = "#229922"
let gameOver = false
let firstgame = true

let conn
let player = new Player()
console.debug(player)
if (player.getName()) {
    name.value = player.getName()
    _hideConfig()
    _showGreeting()
}

let game = new Game()
console.debug(game)
if (game.getId()) {
    firstgame = false
    // we need to fetch the game data and resume the game
    _retrieveGameFromServer().then(resp => {
        console.debug("_retrieveGameFromServer() success", resp)
        game.player1 = new Player(resp.player1.id, resp.player1.name)
        game.turn = resp.turn
        game.matrix = resp.matrix
        if (!resp.player2 || typeof resp.player2 === "undefined") {
            _updateGameOnServer({
                player2: player
            }).then(resp => {
                console.debug("_updateGame() success", resp)
                console.debug(game)
            }).catch(err => {
                console.debug("_updateGame() err", err)
            })
        } else {
            game.player2 = new Player(resp.player2.id, resp.player2.name)
        }
        if (document.location.pathname != "/join") {
            _renderGame()
            _showGame()
        }
        console.debug(game)
    }).catch(err => {
        console.debug("_retrieveGameFromServer() error", err)
    })
}


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
            if (data.sender.toUpperCase() === player.getId().toUpperCase()) {
                // console.debug("My own message received and ignored")
                return
            }
            if (data.game_id.toUpperCase() !== game.getId().toUpperCase()) {
                // console.debug("Not my game")
                return
            }
            switch(data.event) {
                case "joining":
                    console.debug("Event: joining")
                    instructions.classList.add("hide")
                    _safeRetrieve()
                    _showGame()
                    break
                case "new":
                    console.debug("Event: new")
                    let newGame = confirm("Would you like to play again?")
                    if (newGame) {
                        history.replaceState(null, "", "?id=" + data.new_game_id)
                        game.setId(data.new_game_id)
                        _retrieveGameFromServer().then(resp => {
                            console.debug("_retrieveGameFromServer() success", resp)
                            game.player1 = new Player(resp.player1.id, resp.player1.name)
                            game.player2 = new Player(resp.player2.id, resp.player2.name)
                            game.matrix = resp.matrix
                            game.turn = resp.turn
                            console.debug(game)
                            gameOver = false
                            _renderGame()
                        }).catch(err => {
                            console.debug("_retrieveGameFromServer() error", err)
                        })
                    }
                    break
                case "move":
                    console.debug("Event: move")
                    _safeRetrieve()
                    break
                case "winner":
                    console.debug("Event: winner")
                    game.winner = data.sender
                    _safeRetrieve()
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
        if (firstgame) {
            _safeCreate()
            firstgame = false
        } else {
            _createGame().then(resp => {
                console.debug("_createGame() success", resp)
                history.replaceState(null, "", "?id=" + resp.id)
                let old_game_id = game.getId()
                game.setId(resp.id)
                _updateGameOnServer({
                    player2: game.player2,
                    turn: game.player1.id == game.winner ? game.player2.id : game.player1.id,
                    previous_game: old_game_id
                }).then(resp => {
                    console.debug("_updateGameOnServer() success", resp)
                    gameOver = false
                    game.turn = resp.turn
                    game.matrix = resp.matrix
                    conn.send(JSON.stringify({
                        sender: player.getId(),
                        game_id: old_game_id,
                        event: "new",
                        new_game_id: resp.id
                    }))
                    _renderGame()
                }).catch(err => {
                    console.debug("_updateGameOnServer() err", err)
                })
            }).catch(err => {
                console.debug("_createGame() err", err)
            })
        }
    })
}
if (joinGameForm) {
    joinGameForm.addEventListener('submit', event => {
        event.preventDefault()
        if (!_validateForm()) {
            return false
        }
        conn.send(JSON.stringify({
            sender: player.getId(),
            game_id: game.getId(),
            event: "joining"
        }))
        joinGameForm.classList.add("hide")
        _theirTurn()
        _showGame()
    })
}
function tileListener (event) {
    if (gameOver) {
        event.preventDefault()
        return false
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

    // calculate if 3 tiles in a row
    let [done, winner, positions] = _threeInARow()

    _updateGameOnServer({
        id: game.getId(),
        player1: game.player1,
        player2: game.player2,
        turn: game.player1.id == game.turn ? game.player2.id : game.player1.id,
        winner: winner,
        matrix: game.matrix
    }).then(resp => {
        console.debug("_updateGameOnServer() success", resp)
        conn.send(JSON.stringify({
            sender: player.getId(),
            game_id: game.getId(),
            event: done ? "winner" : "move"
        }))
        game.turn = resp.turn
        _renderGame()
    }).catch(err => {
        console.debug("_updateGameOnServer() error", err)
    })
}
if (gameTable) {
    document.querySelectorAll('.tile').forEach(element => {
        element.addEventListener('click', tileListener)
    })
}
/**
 * END Document Listeners
 */
function _validateForm() {
    if (!name.value) {
        status.innerText = "Name is required."
        status.style.color = "#FF0000"
        return false
    }
    status.style.color = "#000000"
    player.setName(name.value)
    _hideConfig()
    _showGreeting()
    return true
}

function _showInstructions() {
    shareLink.value = _getUrl() + "/join?id=" + game.getId()
    instructions.classList.remove("hide")
}
function _hideInstructions () {
    instructions.classList.add("hide")
}
function _showGreeting() {
    if (player.getName()) {
        playerH1.innerText = "Hi " + player.getName()
        playerH1.classList.remove("hide")
    }
}
function _showGame () {
    gameTable.classList.remove("hide")
}
function _resumeGame () {
    startGameForm.classList.add("hide")
    _showGame()
}
function _hideConfig () {
    name.classList.add("hide")
    nameLabel.classList.add("hide")
}

function _renderGame() {
    console.debug("Render Game Board")
    _dimBoard(true)
    for (let i = 0; i < game.matrix.length; i++) {
        let playerAt = game.matrix
        if (playerAt[i] === player.getId()) {
            document.getElementById('pos_' + i).style.backgroundColor = tileColor
        } else if (playerAt[i] === game.getOpponent().getId()) {
            document.getElementById('pos_' + i).style.backgroundColor = opponentTileColor
        } else { 
            document.getElementById('pos_' + i).style.backgroundColor = "unset"
        }
    }
    if (game.turn == player.getId()) {
        _yourTurn()
    } else {
        _theirTurn()
    }
    let [done, winner, positions] = _threeInARow()
    if (done) {
        gameOver = true
        game.winner = winner
        _dimBoard()
        _highlightBoard(positions)
        if (winner == player.getId()) {
            status.innerText = "You Win!!!"
        } else {
            status.innerText = "You lose... " + game.getOpponent().getName() + " Wins!"
        }
    }
    if (_draw()) {
        gameOver = true
        _dimBoard()
        status.innerText = "Its a draw!"
    }
}

function _getUrl () {
    return document.location.protocol + '//' + document.location.host
}
function _safeCreate() {
    _createGame().then(resp => {
        console.debug("_createGame() success", resp)
        game.setId(resp.id)
        game.player1 = new Player(resp.player1.id, resp.player1.name)
        console.debug(game)
        _showInstructions()
    }).catch(err => {
        console.debug("_createGame() err", err)
    })
}
function _createGame () {
    let url = _getUrl()
    return HTTP.POST(`${url}/game`, JSON.stringify({ player1: player }))
}
function _updateGameOnServer(updatePayload) {
    let url = _getUrl() + "/game/" + game.getId()
    return HTTP.POST(url, JSON.stringify(updatePayload))
}
function _safeRetrieve() {
    _retrieveGameFromServer().then(resp => {
        console.debug("_retrieveGameFromServer() success", resp)
        game.player1 = new Player(resp.player1.id, resp.player1.name)
        game.player2 = new Player(resp.player2.id, resp.player2.name)
        game.matrix = resp.matrix || [null, null, null, null, null, null, null, null, null]
        game.turn = resp.turn
        _renderGame()
        console.debug(game)
    }).catch(err => {
        console.debug("_retrieveGameFromServer() error", err)
    })
}
function _retrieveGameFromServer() {
    let url = _getUrl() + "/game/" + game.getId()
    return HTTP.GET(url)
}
function _yourTurn () {
    status.innerText = "Your Turn"
    game.turn = player.getId()
}
function _theirTurn () {
    status.innerText = _possessivizer(game.getOpponent().getName()) + " Turn"
}
function _possessivizer(name) {
    if (name.charAt(name.length - 1) === "s") {
        return name + "'"
    } else {
        return name + "'s"
    }
}
function _threeInARow() {
    for (let i = 0; i <= 8; i) {
        if (game.matrix[i] && (game.matrix[i] === game.matrix[i + 1] && game.matrix[i] === game.matrix[i + 2]) ) {
            return [true, game.matrix[i], [i, i + 1, i + 2]]
        }
        i = i + 3
    }
    for (let i = 0; i <= 2; i++) {
        if (game.matrix[i] && (game.matrix[i] === game.matrix[i + 3] && game.matrix[i] === game.matrix[i + 6]) ) {
            return [true, game.matrix[i], [i, i + 3, i + 6]]
        }
    }
    if (game.matrix[0] && (game.matrix[0] === game.matrix[4] && game.matrix[0] === game.matrix[8])) {
        return [true, game.matrix[0], [0, 4, 8]]
    }
    if (game.matrix[2] && (game.matrix[2] === game.matrix[4] && game.matrix[2] === game.matrix[6])) {
        return [true, game.matrix[2], [2, 4, 6]]
    }
    return [false, null, null]
}
function _draw() {
    for (let i = 0; i < game.matrix.length; i++) {
        if (!game.matrix[i]) {
            return false
        }
    }
    return true
}
function _dimBoard(reverse) {
    if (reverse) {
        document.querySelectorAll('td').forEach(el => el.classList.remove("dim"))
        document.querySelectorAll('td').forEach(el => el.classList.remove("highlight"))
    } else {
        document.querySelectorAll('td').forEach(el => el.classList.add("dim"))
    }
}
function _highlightBoard (positions) {
    for (let pos of positions) {
        document.querySelector('#pos_' + pos).classList.add("highlight")
    }
}