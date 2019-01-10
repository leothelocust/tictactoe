'use strict'

import * as HTTP from './services.js'
import { timingSafeEqual } from 'crypto';

class BaseUtils {
    constructor() {
        this.id = this.getUUID()
    }
    getUUID () {
        function s4 () {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
        }
        return (s4() + s4() + '-' + s4() + '-4' + s4().slice(1) + '-8' + s4().slice(1) + '-' + s4() + s4() + s4()).toUpperCase()
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
        if (id)
            this.id = id
        if (name)
            this.name = name
        return this
    }
    setId (id) {
        this.id = id
        return this
    }
    getId () {
        return this.id
    }
    setName (name) {
        this.name = name
        return this
    }
    getName () {
        return this.name
    }
    loadFromCookies() {
        this.setId(this.getCookie("player_id") || this.getId())
        this.setName(this.getCookie("player_name"))
        return this
    }
    setCookies() {
        this.setCookie("player_id", this.id)
        this.setCookie("player_name", this.name)
        return this
    }
}
export class Game extends BaseUtils {
    constructor(player) {
        super()
        this.setId(this.getGameIdFromUrl() || this.id)
        this.players = [player]
        this.turn = player.uuid
        this.winner = undefined
        this.draw = undefined
        this.matrix = [
            null, null, null,
            null, null, null,
            null, null, null
        ]
        this.blocked = false
        return this
    }
    getId () {
        return this.id
    }
    getGameIdFromUrl() {
        console.debug("getGameIdFromUrl")
        let path = document.location.pathname.split("/")
        console.debug(path)
        if (path && path.length > 1) {
            let uuid = path[path.length - 1] || ""
            console.debug(uuid)
            let matches = uuid.match("^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$")
            return matches && matches.length ? path[path.length - 1] : undefined
        }
        return undefined
    }
    getOpponentsName(myId) {
        let opponent = this.players.filter(x => x.id !== myId)[0]
        console.debug("getOpponentsName()", opponent.name)
        return opponent.name
    }
    setOpponentsTurn(myId) {
        let opponent = this.players.filter(x => x.id !== myId)[0]
        console.debug("setOpponentsTurn()", opponent.id)
        this.turn = opponent.id
        return this
    }
}