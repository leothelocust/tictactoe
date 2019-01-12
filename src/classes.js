'use strict'

import * as HTTP from './services.js'
import { timingSafeEqual } from 'crypto';

class BaseUtils {
    constructor() {}
    getUUID () {
        function s4 () {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
        }
        return (s4() + s4() + '-' + s4() + '-4' + s4().slice(1) + '-8' + s4().slice(1) + '-' + s4() + s4() + s4())
    }
    setId (id) {
        this.id = id
        return this
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
}
export class Player extends BaseUtils {
    constructor(id, name) {
        super()
        // if `id` and `name` are passed in, we don't want to set cookies
        if (id) {
            this.id = id
        } else {
            this.setId(id || this.getCookie("player_id") || this.getUUID())
        }
        if (name) {
            this.name = name
        } else {
            this.setName(name || this.getCookie("player_name"))
        }
        return this
    }
    getId () {
        return this.id.toLowerCase()
    }
    setId (id) {
        this.id = id
        this.setCookie("player_id", id)
        return this
    }
    getName () {
        return this.name
    }
    setName (name) {
        this.name = name
        this.setCookie("player_name", name)
        return this
    }
}
export class Game extends BaseUtils {
    constructor() {
        super()
        this.setId((new URLSearchParams(window.location.search)).get('id'))
        this.player1 = undefined // person who started the game
        this.player2 = undefined // person who joined the game
        this.winner = undefined // player.id
        this.draw = undefined // true/false
        this.matrix = [
            null, null, null, // player.id
            null, null, null,
            null, null, null
        ]
        this.next_game = undefined
        return this
    }
    getId() {
        return this.id
    }
    setId(id) {
        console.debug("Set Game ID", id)
        if (id)
            history.replaceState(null, "", "?id=" + id)
        this.id = id
        return this
    }
    setTurn (player_id) {
        console.debug("Set Game Turn", player_id)
        this.turn = player_id
        return this
    }
    getOpponent() {
        let player_id = this.getCookie("player_id")
        return this.player1.id == player_id ? this.player2 : this.player1
    }
    setOpponentsTurn() {
        let opponent = this.getOpponent()
        this.setTurn(opponent.id)
        return this
    }
    logResult(winnersName) {
        this.winners.push(winnersName)
    }
}