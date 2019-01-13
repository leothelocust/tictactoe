var ui =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/classes.js":
/*!************************!*\
  !*** ./src/classes.js ***!
  \************************/
/*! exports provided: Player, Series, Payload, EventEnum */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Player\", function() { return Player; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Series\", function() { return Series; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Payload\", function() { return Payload; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"EventEnum\", function() { return EventEnum; });\n\n\n/**\n * Logging\n * Set to true to enable console.debug() messages\n */\nconst Logging = true\n\nclass BaseUtils {\n    constructor() {}\n    generateRandom (len) {\n        let chars = \"023456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghikmnopqrstuvwxyz\"\n        let randomstring = ''\n        for (var i = 0; i < len; i++) {\n            var rnum = Math.floor(Math.random() * chars.length)\n            randomstring += chars.substring(rnum, rnum + 1)\n        }\n        return randomstring\n    }\n    getUUID () {\n        function s4 () {\n            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)\n        }\n        return (s4() + s4() + '-' + s4() + '-4' + s4().slice(1) + '-8' + s4().slice(1) + '-' + s4() + s4() + s4())\n    }\n    setCookie (cname, cvalue) {\n        document.cookie = cname + \"=\" + cvalue + \";path=/\"\n        return this\n    }\n    getCookie (cname) {\n        let name = cname + \"=\"\n        let decodedCookie = decodeURIComponent(document.cookie)\n        let ca = decodedCookie.split(';')\n        for (let i = 0; i < ca.length; i++) {\n            let c = ca[i]\n            while (c.charAt(0) == ' ') {\n                c = c.substring(1)\n            }\n            if (c.indexOf(name) == 0) {\n                return c.substring(name.length, c.length)\n            }\n        }\n        return \"\"\n    }\n    log(msg) {\n        if (Logging) {\n            if (msg) {\n                console.debug(\"Method \" + msg + \"()\", this)\n            } else {\n                console.debug(this)\n            }\n        }\n    }\n}\n/**\n * Player object\n *\n * @export\n * @class Player\n * @property {string} ID - Unique player identifier\n * @extends {BaseUtils}\n */\nclass Player extends BaseUtils {\n    constructor() {\n        super()\n        this.setId(this.getCookie(\"player_id\") || this.getUUID())\n        this.log()\n        return this\n    }\n    getId () {\n        return this.ID.toLowerCase()\n    }\n    setId (id) {\n        this.ID = id\n        this.setCookie(\"player_id\", id)\n        this.log(\"setId\")\n        return this\n    }\n    getName() {\n        return this.getCookie(\"player_name\")\n    }\n    setName(name) {\n        this.setCookie(\"player_name\", name)\n    }\n}\nclass Series extends BaseUtils {\n    constructor() {\n        super()\n        this.setId((new URLSearchParams(window.location.search)).get('sid') || this.generateRandom(6))\n        this.gameMatrix = [\n            null, null, null,\n            null, null, null,\n            null, null, null\n        ]\n        this.turn = undefined\n        this.tally = []\n        this.log()\n        return this\n    }\n    getId () {\n        return this.id\n    }\n    setId (id) {\n        if (id)\n            history.replaceState(null, \"\", \"?sid=\" + id)\n        this.id = id\n        this.log(\"setId\")\n        return this\n    }\n    getGameMatrix () {\n        return this.gameMatrix\n    }\n    setGameMatrix (matrix) {\n        this.gameMatrix = matrix\n        return this\n    }\n    emptyGameMatrix() {\n        this.gameMatrix = [\n            null, null, null,\n            null, null, null,\n            null, null, null\n        ]\n    }\n    getTurn() {\n        return this.turn\n    }\n    setTurn(player_id) {\n        console.debug(\"Set Player Turn\", player_id)\n        this.turn = player_id\n        this.log(\"setTurn\")\n        return this\n    }\n    logGame() {\n        this.tally.push(this.gameMatrix)\n        this.log(\"logGame\")\n    }\n}\n\n/**\n * Payload for use with websocket\n * \n * @export\n * @class Payload\n * @extends {BaseUtils}\n * @typedef {string} PlayerID\n * @property {string} SeriesID - Taken from the URL query param ?sid\n * @property {PlayerID} Sender - The sender of the socket payload\n * @property {EventEnum} Event - The payload event type\n * @property {PlayerID[]} Matrix - An array of length 9 containing PlayerIDs or null\n * @property {string} Message - Chat message\n * @property {Object} Data - Any additional payload\n */\nclass Payload extends BaseUtils {\n    constructor(series_id, player_id) {\n        super()\n        if (!series_id || !player_id) {\n            throw \"SeriesID and PlayerID are required to create a new WebSocket Payload\"\n        }\n        this.SeriesID = series_id\n        this.Sender = player_id\n        this.log()\n        return this\n    }\n    /**\n     * Set the payload event type\n     * @param {EventType} event - Event type\n     * @returns Payload object\n     */\n    setEventType(event) {\n        this.Event = event\n        this.log(\"setEventType\")\n        return this\n    }\n    /**\n     * Set the payload game matrix array\n     * @param {PlayerID[]} matrix - An array of length 9 containing PlayerIDs or null\n     * @returns Payload object\n     */\n    setMatrix(matrix) {\n        this.Matrix = matrix\n        this.log(\"setMatrix\")\n        return this\n    }\n    /**\n     * Set the payload chat message\n     * @param {string} message - Chat Message\n     * @returns Payload object\n     */\n    setMessage(message) {\n        this.Message = message\n        this.log(\"setMessage\")\n        return this\n    }\n\n    /**\n     * Exports the payload using JSON.stringify()\n     * @returns {string} Serialized payload object\n     */\n    serialize() {\n        return JSON.stringify({\n            SeriesID: this.SeriesID,\n            Sender: this.Sender,\n            Event: this.Event,\n            Matrix: this.Matrix,\n            Message: this.Message,\n        })\n    }\n\n}\n\nconst EventEnum = {\n    ANYBODYHOME: 1,\n    IAMHERE: 2,\n    CHAT: 3,\n    SNAP: 4,\n    MOVE: 5,\n    NEW: 6,\n}\n\n//# sourceURL=webpack://ui/./src/classes.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: Copy, TooltipBlur */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Copy\", function() { return Copy; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"TooltipBlur\", function() { return TooltipBlur; });\n/* harmony import */ var _classes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./classes.js */ \"./src/classes.js\");\n/* harmony import */ var _services_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./services.js */ \"./src/services.js\");\n/* harmony import */ var _style_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./style.scss */ \"./src/style.scss\");\n/* harmony import */ var _style_scss__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_style_scss__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\n\n\n\n/**\n * Initialize DOM variables\n */\nlet opponent = document.getElementById('opponent')\nlet message = document.getElementById('message')\nlet status = document.getElementById('status')\nlet tally = document.getElementById('tally')\nlet gameTable = document.getElementById('gameTable')\n\nlet instructions = document.getElementById('instructions')\nlet shareLink = document.getElementById('shareLink')\nlet tooltip = document.getElementById(\"tooltip\")\n\nlet opponentTileColor = \"#992222\"\nlet tileColor = \"#229922\"\n\nlet opponentName\n\nlet conn\nlet payload\nlet player = new _classes_js__WEBPACK_IMPORTED_MODULE_0__[\"Player\"]()\nlet series = new _classes_js__WEBPACK_IMPORTED_MODULE_0__[\"Series\"]()\n\nshareLink.value = _getURL() + \"/game?sid=\" + series.getId()\n\nif (window.WebSocket) {\n    conn = new WebSocket(\"ws://\" + document.location.host + \"/ws\")\n    conn.onclose = function () {\n        console.debug(\"Websocket Closed\")\n    }\n    conn.onmessage = function (evt) {\n        let messages = evt.data.split('\\n')\n        for (var i = 0; i < messages.length; i++) {\n            let data = messages[i]\n            try {\n                data = JSON.parse(data)\n            } catch (e) {\n                console.debug(\"WebSocket Payload Parse Error\", data)\n            }\n            if (data.Sender === player.getId() && data.SeriesID === series.getId()) {\n                console.debug(\"WebSocket Payload Ignored\", data)\n                return\n            } else if (data.SeriesID === series.getId()) {\n                console.debug(\"WebSocket Payload Received\", Object.keys(_classes_js__WEBPACK_IMPORTED_MODULE_0__[\"EventEnum\"]).find(k => _classes_js__WEBPACK_IMPORTED_MODULE_0__[\"EventEnum\"][k] === data.Event), data)\n                switch (data.Event) {\n                    case _classes_js__WEBPACK_IMPORTED_MODULE_0__[\"EventEnum\"].ANYBODYHOME:\n                        _showGame()\n                        opponentName = data.Message\n                        opponent.innerText = \"Your opponent is: \" + opponentName\n                        series.setTurn(null)\n                        status.innerText = _possessivizer(opponentName) + \" Turn\"\n                        if (player.getName()) {\n                            payload = new _classes_js__WEBPACK_IMPORTED_MODULE_0__[\"Payload\"](series.getId(), player.getId())\n                                .setEventType(_classes_js__WEBPACK_IMPORTED_MODULE_0__[\"EventEnum\"].IAMHERE)\n                                .setMessage(player.getName())\n                                .setMatrix(series.getGameMatrix())\n                                .serialize()\n                            conn.send(payload)\n                        } else {\n                            let nick = prompt(\"Nickname?\", \"\")\n                            player.setName(nick)\n                            payload = new _classes_js__WEBPACK_IMPORTED_MODULE_0__[\"Payload\"](series.getId(), player.getId())\n                                .setEventType(_classes_js__WEBPACK_IMPORTED_MODULE_0__[\"EventEnum\"].IAMHERE)\n                                .setMessage(player.getName())\n                                .setMatrix(series.getGameMatrix())\n                                .serialize()\n                            conn.send(payload)\n                        }\n                        break;\n                    case _classes_js__WEBPACK_IMPORTED_MODULE_0__[\"EventEnum\"].IAMHERE:\n                        _showGame()\n                        opponentName = data.Message\n                        opponent.innerText = \"Your opponent is: \" + opponentName\n                        series.setTurn(player.getId())\n                        status.innerText = \"Your Turn\"\n                        series.setGameMatrix(data.Matrix)\n                        _renderGame()\n                        break;\n                    case _classes_js__WEBPACK_IMPORTED_MODULE_0__[\"EventEnum\"].CHAT:\n                        message.innerText = \"Your opponent says: \" + data.Message\n                        break;\n                    case _classes_js__WEBPACK_IMPORTED_MODULE_0__[\"EventEnum\"].MOVE:\n                        series.setGameMatrix(data.Matrix)\n                        series.setTurn(player.getId())\n                        status.innerText = \"Your Turn\"\n                        _renderGame()\n                        break;\n                    case _classes_js__WEBPACK_IMPORTED_MODULE_0__[\"EventEnum\"].NEW:\n                        series.logGame()\n                        series.emptyGameMatrix()\n                        series.setTurn(player.getId())\n                        status.innerText = \"Your Turn\"\n                        _renderGame()\n                        break;\n                }\n            }\n        }\n    }\n    conn.onopen = function (evt) {\n        if (player.getName()) {\n            payload = new _classes_js__WEBPACK_IMPORTED_MODULE_0__[\"Payload\"](series.getId(), player.getId())\n                .setEventType(_classes_js__WEBPACK_IMPORTED_MODULE_0__[\"EventEnum\"].ANYBODYHOME)\n                .setMessage(player.getName())\n                .serialize()\n            conn.send(payload)\n        } else {\n            let nick = prompt(\"Nickname?\", \"\")\n            player.setName(nick)\n            payload = new _classes_js__WEBPACK_IMPORTED_MODULE_0__[\"Payload\"](series.getId(), player.getId())\n                .setEventType(_classes_js__WEBPACK_IMPORTED_MODULE_0__[\"EventEnum\"].ANYBODYHOME)\n                .setMessage(player.getName())\n                .serialize()\n            conn.send(payload)\n        }\n    }\n} else {\n    console.error(\"TicTacToe can only be played in a browser that supports a WebSocket connection.\")\n}\n\n\n/**\n * BEGIN Document Listeners\n */\n\nfunction tileListener (event) {\n    let pos = event.target.id.split('_')[1]\n    // validate its my turn\n    if (series.getTurn() !== player.getId()) {\n        console.debug(\"Not my turn\")\n        event.preventDefault()\n        return\n    }\n    // validate position available\n    if (series.getGameMatrix()[pos]) {\n        console.debug(\"Tile not free\")\n        event.preventDefault()\n        return\n    }\n    // set move\n    let matrix = series.getGameMatrix()\n    matrix[pos] = player.getId()\n    series.setGameMatrix(matrix)\n    series.setTurn(null)\n    status.innerText = _possessivizer(opponentName) + \" Turn\"\n\n    _renderGame()\n\n    payload = new _classes_js__WEBPACK_IMPORTED_MODULE_0__[\"Payload\"](series.getId(), player.getId())\n        .setEventType(_classes_js__WEBPACK_IMPORTED_MODULE_0__[\"EventEnum\"].MOVE)\n        .setMatrix(series.getGameMatrix())\n        .serialize()\n    conn.send(payload)\n}\nif (gameTable) {\n    document.querySelectorAll('.tile').forEach(element => {\n        element.addEventListener('click', tileListener)\n    })\n}\n\nfunction _getURL () {\n    return document.location.protocol + '//' + document.location.host\n}\nfunction _showGame() {\n    gameTable.classList.remove(\"hide\")\n    instructions.classList.add(\"hide\")\n}\nfunction _renderGame () {\n    document.querySelectorAll('#gameTable td').forEach(el => el.classList.remove(\"dim\"))\n    document.querySelectorAll('#gameTable td').forEach(el => el.classList.remove(\"highlight\"))\n    let matrix = series.getGameMatrix()\n    for (let i = 0; i < matrix.length; i++) {\n        let playerAt = matrix\n        if (playerAt[i] === player.getId()) {\n            document.getElementById('pos_' + i).style.backgroundColor = tileColor\n        } else if (playerAt[i]) {\n            document.getElementById('pos_' + i).style.backgroundColor = opponentTileColor\n        } else {\n            document.getElementById('pos_' + i).style.backgroundColor = \"unset\"\n        }\n    }\n    let [me, positions] = _analyzeBoard()\n    if (positions)\n        _highlightBoard(positions)\n    if (me) {\n        setTimeout(() => {\n            let playagain = confirm(\"Play another round?\")\n            if (playagain) {\n                series.logGame()\n                series.emptyGameMatrix()\n                _renderGame()\n                payload = new _classes_js__WEBPACK_IMPORTED_MODULE_0__[\"Payload\"](series.getId(), player.getId())\n                    .setEventType(_classes_js__WEBPACK_IMPORTED_MODULE_0__[\"EventEnum\"].NEW)\n                    .serialize()\n                conn.send(payload)\n            }\n        }, 1000)\n    }\n}\nfunction _analyzeBoard() {\n    let matrix = series.getGameMatrix()\n    for (let i = 0; i <= 8; i) {\n        if (matrix[i] && (matrix[i] === matrix[i + 1] && matrix[i] === matrix[i + 2])) {\n            return [matrix[i] == player.getId(), [i, i + 1, i + 2]]\n        }\n        i = i + 3\n    }\n    for (let i = 0; i <= 2; i++) {\n        if (matrix[i] && (matrix[i] === matrix[i + 3] && matrix[i] === matrix[i + 6])) {\n            return [matrix[i] == player.getId(), [i, i + 3, i + 6]]\n        }\n    }\n    if (matrix[0] && (matrix[0] === matrix[4] && matrix[0] === matrix[8])) {\n        return [matrix[0] == player.getId(), [0, 4, 8]]\n    }\n    if (matrix[2] && (matrix[2] === matrix[4] && matrix[2] === matrix[6])) {\n        return [matrix[2] == player.getId(), [2, 4, 6]]\n    }\n    return [false, null]\n}\nfunction _highlightBoard(positions) {\n    document.querySelectorAll('#gameTable td').forEach(el => el.classList.add(\"dim\"))\n    for (let pos of positions) {\n        document.querySelector('#gameTable #pos_' + pos).classList.add(\"highlight\")\n    }\n}\nfunction _possessivizer (name) {\n    if (name.charAt(name.length - 1) === \"s\") {\n        return name + \"'\"\n    } else {\n        return name + \"'s\"\n    }\n}\n\nfunction Copy (context) {\n    context.select()\n    document.execCommand(\"Copy\")\n    tooltip.innerHTML = \"Copied!\"\n}\nfunction TooltipBlur () {\n    tooltip.innerHTML = \"Copy\"\n}\n/*\n\nfunction _renderGame() {\n    console.debug(\"Render Game Board\")\n    _dimBoard(true)\n    for (let i = 0; i < matrix.length; i++) {\n        let playerAt = game.matrix\n        if (playerAt[i] === player.getId()) {\n            document.getElementById('pos_' + i).style.backgroundColor = tileColor\n        } else if (playerAt[i] === game.getOpponent().getId()) {\n            document.getElementById('pos_' + i).style.backgroundColor = opponentTileColor\n        } else { \n            document.getElementById('pos_' + i).style.backgroundColor = \"unset\"\n        }\n    }\n    if (game.turn == player.getId()) {\n        _yourTurn()\n    } else {\n        _theirTurn()\n    }\n    let [done, winner, positions] = _threeInARow()\n    if (done) {\n        gameOver = true\n        game.winner = winner\n        _dimBoard()\n        _highlightBoard(positions)\n        if (winner == player.getId()) {\n            status.innerText = \"You Win!!!\"\n        } else {\n            status.innerText = \"You lose... \" + game.getOpponent().getName() + \" Wins!\"\n        }\n    }\n    if (_draw()) {\n        gameOver = true\n        _dimBoard()\n        status.innerText = \"Its a draw!\"\n    }\n}\n\nfunction _safeCreate() {\n    _createGame().then(resp => {\n        console.debug(\"_createGame() success\", resp)\n        game.setId(resp.id)\n        game.player1 = new Player(resp.player1.id, resp.player1.name)\n        console.debug(game)\n        _showInstructions()\n    }).catch(err => {\n        console.debug(\"_createGame() err\", err)\n    })\n}\nfunction _createGame () {\n    let url = _getUrl()\n    return HTTP.POST(`${url}/game`, JSON.stringify({ player1: player }))\n}\nfunction _updateGameOnServer(updatePayload) {\n    let url = _getUrl() + \"/game/\" + game.getId()\n    return HTTP.POST(url, JSON.stringify(updatePayload))\n}\nfunction _safeRetrieve() {\n    _retrieveGameFromServer().then(resp => {\n        console.debug(\"_retrieveGameFromServer() success\", resp)\n        game.player1 = new Player(resp.player1.id, resp.player1.name)\n        game.player2 = new Player(resp.player2.id, resp.player2.name)\n        game.matrix = resp.matrix || [null, null, null, null, null, null, null, null, null]\n        game.turn = resp.turn\n        _renderGame()\n        console.debug(game)\n    }).catch(err => {\n        console.debug(\"_retrieveGameFromServer() error\", err)\n    })\n}\nfunction _retrieveGameFromServer() {\n    let url = _getUrl() + \"/game/\" + game.getId()\n    return HTTP.GET(url)\n}\nfunction _yourTurn () {\n    status.innerText = \"Your Turn\"\n    game.turn = player.getId()\n}\nfunction _theirTurn () {\n    status.innerText = _possessivizer(game.getOpponent().getName()) + \" Turn\"\n}\nfunction _threeInARow() {\n    for (let i = 0; i <= 8; i) {\n        if (game.matrix[i] && (game.matrix[i] === game.matrix[i + 1] && game.matrix[i] === game.matrix[i + 2]) ) {\n            return [true, game.matrix[i], [i, i + 1, i + 2]]\n        }\n        i = i + 3\n    }\n    for (let i = 0; i <= 2; i++) {\n        if (game.matrix[i] && (game.matrix[i] === game.matrix[i + 3] && game.matrix[i] === game.matrix[i + 6]) ) {\n            return [true, game.matrix[i], [i, i + 3, i + 6]]\n        }\n    }\n    if (game.matrix[0] && (game.matrix[0] === game.matrix[4] && game.matrix[0] === game.matrix[8])) {\n        return [true, game.matrix[0], [0, 4, 8]]\n    }\n    if (game.matrix[2] && (game.matrix[2] === game.matrix[4] && game.matrix[2] === game.matrix[6])) {\n        return [true, game.matrix[2], [2, 4, 6]]\n    }\n    return [false, null, null]\n}\nfunction _draw() {\n    for (let i = 0; i < game.matrix.length; i++) {\n        if (!game.matrix[i]) {\n            return false\n        }\n    }\n    return true\n}\nfunction _dimBoard(reverse) {\n    if (reverse) {\n        document.querySelectorAll('td').forEach(el => el.classList.remove(\"dim\"))\n        document.querySelectorAll('td').forEach(el => el.classList.remove(\"highlight\"))\n    } else {\n        document.querySelectorAll('td').forEach(el => el.classList.add(\"dim\"))\n    }\n}\n*/\n\n//# sourceURL=webpack://ui/./src/index.js?");

/***/ }),

/***/ "./src/services.js":
/*!*************************!*\
  !*** ./src/services.js ***!
  \*************************/
/*! exports provided: GET, POST, _parseOrNot */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"GET\", function() { return GET; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"POST\", function() { return POST; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"_parseOrNot\", function() { return _parseOrNot; });\n\n\nfunction GET (theUrl) {\n    return new Promise((resolve, reject) => {\n        var req = new XMLHttpRequest()\n        req.onreadystatechange = function () {\n            if (req.readyState == 4 && req.status == 200) {\n                resolve(_parseOrNot(req.responseText))\n            } else if (req.readyState == 4) {\n                reject({ status: req.status, message: _parseOrNot(req.responseText) })\n            }\n        }\n        req.open(\"GET\", theUrl, true)\n        req.send(null)\n    })\n}\nfunction POST (theUrl, data) {\n    return new Promise((resolve, reject) => {\n        let req = new XMLHttpRequest()\n        req.onreadystatechange = function () {\n            if (req.readyState == 4 && req.status == 200) {\n                resolve(_parseOrNot(req.responseText))\n            } else if (req.readyState == 4) {\n                reject({ status: req.status, message: _parseOrNot(req.responseText) })\n            }\n        }\n        req.open(\"POST\", theUrl, true)\n        if (data) {\n            req.setRequestHeader(\"Content-Type\", \"application/json\")\n        }\n        req.send(data)\n    })\n}\nfunction _parseOrNot(str) {\n    let data = str\n    try {\n        data = JSON.parse(str)\n    } catch (e) {\n        console.debug(\"Error Parsing JSON:\", str)\n    }\n    return data\n}\n\n//# sourceURL=webpack://ui/./src/services.js?");

/***/ }),

/***/ "./src/style.scss":
/*!************************!*\
  !*** ./src/style.scss ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack://ui/./src/style.scss?");

/***/ }),

/***/ 0:
/*!****************************!*\
  !*** multi ./src/index.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("module.exports = __webpack_require__(/*! ./src/index.js */\"./src/index.js\");\n\n\n//# sourceURL=webpack://ui/multi_./src/index.js?");

/***/ })

/******/ });