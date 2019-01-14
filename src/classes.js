'use strict'

import * as lib from "./services"

/**
 * Logging
 * Set to true to enable console.debug() messages
 */
const Logging = true

class BaseUtils {
    constructor() {}
    getUUID () {
        function s4 () {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
        }
        return (s4() + s4() + '-' + s4() + '-4' + s4().slice(1) + '-8' + s4().slice(1) + '-' + s4() + s4() + s4())
    }
    setCookie (cname, cvalue) {
        document.cookie = cname + "=" + cvalue + ";path=/"
        return this
    }
    getCookie (cname) {
        let name = cname + "="
        let decodedCookie = decodeURIComponent(document.cookie)
        let ca = decodedCookie.split(';')
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i]
            while (c.charAt(0) == ' ') {
                c = c.substring(1)
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length)
            }
        }
        return ""
    }
    log(msg) {
        if (Logging) {
            if (msg) {
                console.debug("Method " + msg + "()", this)
            } else {
                console.debug(this)
            }
        }
    }
}
/**
 * Player object
 *
 * @export
 * @class Player
 * @property {string} ID - Unique player identifier
 * @extends {BaseUtils}
 */
export class Player extends BaseUtils {
    constructor() {
        super()
        this.setId(this.getCookie("player_id") || this.getUUID())
        this.log()
        return this
    }
    getId () {
        return this.ID.toLowerCase()
    }
    setId (id) {
        this.ID = id
        this.setCookie("player_id", id)
        this.log("setId")
        return this
    }
    getName() {
        return this.getCookie("player_name")
    }
    setName(name) {
        this.setCookie("player_name", name)
    }
}
export class Series extends BaseUtils {
    constructor() {
        super()
        this.setId((new URLSearchParams(window.location.search)).get('sid') || lib.generateRandom(6))
        this.gameMatrix = [
            null, null, null,
            null, null, null,
            null, null, null
        ]
        this.turn = undefined
        this.gameMatrixHistory = []
        this.log()
        return this
    }
    getId () {
        return this.id
    }
    setId (id) {
        if (id)
            history.replaceState(null, "", "?sid=" + id)
        this.id = id
        this.log("setId")
        return this
    }
    getGameMatrix () {
        return this.gameMatrix
    }
    setGameMatrix (matrix) {
        this.gameMatrix = matrix
        return this
    }
    getGameMatrixHistory() {
        return this.gameMatrixHistory
    }
    setGameMatrixHistory(history) {
        this.gameMatrixHistory = history
    }
    emptyGameMatrix() {
        this.gameMatrix = [
            null, null, null,
            null, null, null,
            null, null, null
        ]
    }
    getTurn() {
        return this.turn
    }
    setTurn(player_id) {
        console.debug("Set Player Turn", player_id)
        this.turn = player_id
        this.log("setTurn")
        return this
    }
    logGame() {
        this.gameMatrixHistory.push(this.gameMatrix)
        this.log("logGame")
    }
}

/**
 * Payload for use with websocket
 * 
 * @export
 * @class Payload
 * @extends {BaseUtils}
 * @typedef {string} PlayerID
 * @property {string} SeriesID - Taken from the URL query param ?sid
 * @property {PlayerID} Sender - The sender of the socket payload
 * @property {EventEnum} Event - The payload event type
 * @property {PlayerID[]} Matrix - An array of length 9 containing PlayerIDs or null
 * @property {string} Message - Chat message
 * @property {Object} Data - Any additional payload
 */
export class Payload extends BaseUtils {
    constructor(series_id, player_id) {
        super()
        if (!series_id || !player_id) {
            throw "SeriesID and PlayerID are required to create a new WebSocket Payload"
        }
        this.SeriesID = series_id
        this.Sender = player_id
        this.log()
        return this
    }
    /**
     * Set the payload event type
     * @param {EventType} event - Event type
     * @returns Payload object
     */
    setEventType(event) {
        this.Event = event
        this.log("setEventType")
        return this
    }
    /**
     * Set the payload game matrix array
     * @param {PlayerID[]} matrix - An array of length 9 containing PlayerIDs or null
     * @returns Payload object
     */
    setMatrix(matrix) {
        this.Matrix = matrix
        this.log("setMatrix")
        return this
    }
    /**
     * Set the payload game matrix history array
     * @param {PlayerID[]} history - An array of arrays containing the Game Matrix
     * @returns Payload object
     */
    setMatrixHistory (history) {
        this.MatrixHistory = history
        this.log("setMatrixHistory")
        return this
    }
    /**
     * Set the payload chat message
     * @param {string} message - Chat Message
     * @returns Payload object
     */
    setMessage(message) {
        this.Message = message
        this.log("setMessage")
        return this
    }

    /**
     * Exports the payload using JSON.stringify()
     * @returns {string} Serialized payload object
     */
    serialize() {
        return JSON.stringify({
            SeriesID: this.SeriesID,
            Sender: this.Sender,
            Event: this.Event,
            Matrix: this.Matrix,
            Message: this.Message,
        })
    }

}

export const EventEnum = {
    ANYBODYHOME: 1,
    IAMHERE: 2,
    CHAT: 3,
    SNAP: 4,
    MOVE: 5,
    NEW: 6,
}