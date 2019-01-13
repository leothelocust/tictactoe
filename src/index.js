'use strict'

import { Player, Series, Payload, EventEnum } from "./classes.js"
import * as lib from "./services.js"
import style from './style.scss'

/**
 * Initialize DOM variables
 */
let opponent = document.getElementById('opponent')
let message = document.getElementById('message')
let status = document.getElementById('status')
let tally = document.getElementById('tally')
let gameTable = document.getElementById('gameTable')

let instructions = document.getElementById('instructions')
let shareLink = document.getElementById('shareLink')
let tooltip = document.getElementById("tooltip")

let opponentTileColor = "#992222"
let tileColor = "#229922"

let opponentName

let conn
let payload
let player = new Player()
let series = new Series()

shareLink.value = _getURL() + "/game?sid=" + series.getId()

if (window.WebSocket) {
    conn = new WebSocket("wss://" + document.location.host + "/ws")
    conn.onclose = function () {
        console.debug("Websocket Closed")
    }
    conn.onmessage = function (evt) {
        let messages = evt.data.split('\n')
        for (var i = 0; i < messages.length; i++) {
            let data = messages[i]
            try {
                data = JSON.parse(data)
            } catch (e) {
                console.debug("WebSocket Payload Parse Error", data)
            }
            if (data.Sender === player.getId() && data.SeriesID === series.getId()) {
                console.debug("WebSocket Payload Ignored", data)
                return
            } else if (data.SeriesID === series.getId()) {
                console.debug("WebSocket Payload Received", Object.keys(EventEnum).find(k => EventEnum[k] === data.Event), data)
                switch (data.Event) {
                    case EventEnum.ANYBODYHOME:
                        _showGame()
                        opponentName = data.Message
                        opponent.innerText = "Your opponent is: " + opponentName
                        series.setTurn(null)
                        status.innerText = _possessivizer(opponentName) + " Turn"
                        if (player.getName()) {
                            payload = new Payload(series.getId(), player.getId())
                                .setEventType(EventEnum.IAMHERE)
                                .setMessage(player.getName())
                                .setMatrix(series.getGameMatrix())
                                .serialize()
                            conn.send(payload)
                        } else {
                            let nick = prompt("Nickname?", "")
                            player.setName(nick)
                            payload = new Payload(series.getId(), player.getId())
                                .setEventType(EventEnum.IAMHERE)
                                .setMessage(player.getName())
                                .setMatrix(series.getGameMatrix())
                                .serialize()
                            conn.send(payload)
                        }
                        break;
                    case EventEnum.IAMHERE:
                        _showGame()
                        opponentName = data.Message
                        opponent.innerText = "Your opponent is: " + opponentName
                        series.setTurn(player.getId())
                        status.innerText = "Your Turn"
                        series.setGameMatrix(data.Matrix)
                        _renderGame()
                        break;
                    case EventEnum.CHAT:
                        message.innerText = "Your opponent says: " + data.Message
                        break;
                    case EventEnum.MOVE:
                        series.setGameMatrix(data.Matrix)
                        series.setTurn(player.getId())
                        status.innerText = "Your Turn"
                        _renderGame()
                        break;
                    case EventEnum.NEW:
                        series.logGame()
                        series.emptyGameMatrix()
                        series.setTurn(player.getId())
                        status.innerText = "Your Turn"
                        _renderGame()
                        break;
                }
            }
        }
    }
    conn.onopen = function (evt) {
        if (player.getName()) {
            payload = new Payload(series.getId(), player.getId())
                .setEventType(EventEnum.ANYBODYHOME)
                .setMessage(player.getName())
                .serialize()
            conn.send(payload)
        } else {
            let nick = prompt("Nickname?", "")
            player.setName(nick)
            payload = new Payload(series.getId(), player.getId())
                .setEventType(EventEnum.ANYBODYHOME)
                .setMessage(player.getName())
                .serialize()
            conn.send(payload)
        }
    }
} else {
    console.error("TicTacToe can only be played in a browser that supports a WebSocket connection.")
}


/**
 * BEGIN Document Listeners
 */

function tileListener (event) {
    let pos = event.target.id.split('_')[1]
    // validate its my turn
    if (series.getTurn() !== player.getId()) {
        console.debug("Not my turn")
        event.preventDefault()
        return
    }
    // validate position available
    if (series.getGameMatrix()[pos]) {
        console.debug("Tile not free")
        event.preventDefault()
        return
    }
    // set move
    let matrix = series.getGameMatrix()
    matrix[pos] = player.getId()
    series.setGameMatrix(matrix)
    series.setTurn(null)
    status.innerText = _possessivizer(opponentName) + " Turn"

    _renderGame()

    payload = new Payload(series.getId(), player.getId())
        .setEventType(EventEnum.MOVE)
        .setMatrix(series.getGameMatrix())
        .serialize()
    conn.send(payload)
}
if (gameTable) {
    document.querySelectorAll('.tile').forEach(element => {
        element.addEventListener('click', tileListener)
    })
}

function _getURL () {
    return document.location.protocol + '//' + document.location.host
}
function _showGame() {
    gameTable.classList.remove("hide")
    instructions.classList.add("hide")
}
function _renderGame () {
    document.querySelectorAll('#gameTable td').forEach(el => el.classList.remove("dim"))
    document.querySelectorAll('#gameTable td').forEach(el => el.classList.remove("highlight"))
    let matrix = series.getGameMatrix()
    for (let i = 0; i < matrix.length; i++) {
        let playerAt = matrix
        if (playerAt[i] === player.getId()) {
            document.getElementById('pos_' + i).style.backgroundColor = tileColor
        } else if (playerAt[i]) {
            document.getElementById('pos_' + i).style.backgroundColor = opponentTileColor
        } else {
            document.getElementById('pos_' + i).style.backgroundColor = "unset"
        }
    }
    let [me, positions] = _analyzeBoard()
    if (positions)
        _highlightBoard(positions)
    if (me) {
        setTimeout(() => {
            let playagain = confirm("Play another round?")
            if (playagain) {
                series.logGame()
                series.emptyGameMatrix()
                _renderGame()
                payload = new Payload(series.getId(), player.getId())
                    .setEventType(EventEnum.NEW)
                    .serialize()
                conn.send(payload)
            }
        }, 1000)
    }
}
function _analyzeBoard() {
    let matrix = series.getGameMatrix()
    for (let i = 0; i <= 8; i) {
        if (matrix[i] && (matrix[i] === matrix[i + 1] && matrix[i] === matrix[i + 2])) {
            return [matrix[i] == player.getId(), [i, i + 1, i + 2]]
        }
        i = i + 3
    }
    for (let i = 0; i <= 2; i++) {
        if (matrix[i] && (matrix[i] === matrix[i + 3] && matrix[i] === matrix[i + 6])) {
            return [matrix[i] == player.getId(), [i, i + 3, i + 6]]
        }
    }
    if (matrix[0] && (matrix[0] === matrix[4] && matrix[0] === matrix[8])) {
        return [matrix[0] == player.getId(), [0, 4, 8]]
    }
    if (matrix[2] && (matrix[2] === matrix[4] && matrix[2] === matrix[6])) {
        return [matrix[2] == player.getId(), [2, 4, 6]]
    }
    return [false, null]
}
function _highlightBoard(positions) {
    document.querySelectorAll('#gameTable td').forEach(el => el.classList.add("dim"))
    for (let pos of positions) {
        document.querySelector('#gameTable #pos_' + pos).classList.add("highlight")
    }
}
function _possessivizer (name) {
    if (name.charAt(name.length - 1) === "s") {
        return name + "'"
    } else {
        return name + "'s"
    }
}

export function Copy (context) {
    context.select()
    document.execCommand("Copy")
    tooltip.innerHTML = "Copied!"
}
export function TooltipBlur () {
    tooltip.innerHTML = "Copy"
}
/*

function _renderGame() {
    console.debug("Render Game Board")
    _dimBoard(true)
    for (let i = 0; i < matrix.length; i++) {
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
*/