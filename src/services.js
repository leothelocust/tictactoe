'use strict'

const _chars = "023456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghikmnopqrstuvwxyz"

export function GET (theUrl) {
    return new Promise((resolve, reject) => {
        var req = new XMLHttpRequest()
        req.onreadystatechange = function () {
            if (req.readyState == 4 && req.status == 200) {
                resolve(_parseOrNot(req.responseText))
            } else if (req.readyState == 4) {
                reject({ status: req.status, message: _parseOrNot(req.responseText) })
            }
        }
        req.open("GET", theUrl, true)
        req.send(null)
    })
}
export function POST (theUrl, data) {
    return new Promise((resolve, reject) => {
        let req = new XMLHttpRequest()
        req.onreadystatechange = function () {
            if (req.readyState == 4 && req.status == 200) {
                resolve(_parseOrNot(req.responseText))
            } else if (req.readyState == 4) {
                reject({ status: req.status, message: _parseOrNot(req.responseText) })
            }
        }
        req.open("POST", theUrl, true)
        if (data) {
            req.setRequestHeader("Content-Type", "application/json")
        }
        req.send(data)
    })
}
export function parseOrNot(str) {
    let data = str
    try {
        data = JSON.parse(str)
    } catch (e) {
        console.debug("Error Parsing JSON:", str)
    }
    return data
}
export function generateRandom(len) {
    let randomstring = ''
    for (var i = 0; i < len; i++) {
        var rnum = Math.floor(Math.random() * _chars.length)
        randomstring += _chars.substring(rnum, rnum + 1)
    }
    return randomstring
}