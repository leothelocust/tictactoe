package main

import (
	"log"
	"net/http"
	"os"
	"time"

	cache "tictactoe-api/cache"

	"github.com/gin-contrib/multitemplate"
	"github.com/gin-gonic/autotls"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
)

func setupRender() multitemplate.Renderer {
	r := multitemplate.NewRenderer()
	r.AddFromFiles("index", "dist/index.html")
	r.AddFromFiles("join", "dist/join.html")
	return r
}

func main() {
	hub := newHub()
	go hub.run()
	cache := cache.NewCache(time.Minute*10, time.Minute)
	router := gin.Default()
	router.HTMLRender = setupRender()
	router.Static("/static", "dist")

	router.GET("/favicon.ico", func(c *gin.Context) {
		c.File("dist/favicon.ico")
	})

	router.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})
	router.Any("/ws", func(c *gin.Context) {
		serveWs(hub, c.Writer, c.Request)
	})

	//
	//
	//

	router.GET("/join/:gameUUID", func(c *gin.Context) {
		c.HTML(http.StatusOK, "join", gin.H{
			"title": "Play Game",
		})
	})

	router.GET("/game", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index", gin.H{
			"title": "Start New Game",
		})
	})

	router.POST("/game", func(c *gin.Context) {
		var game Game
		err := c.BindJSON(&game)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		game.Turn = game.Players[0].UUID
		cache.Set(game.UUID, game, 0)
		c.JSON(http.StatusOK, game)
	})

	router.GET("/game/:gameUUID", func(c *gin.Context) {
		gameUUID, err := uuid.FromString(c.Params.ByName("gameUUID"))
		if err != nil {
			log.Printf("UUID Parse Failed: %s\n", err)
		}
		game, found := cache.Get(gameUUID)
		if !found {
			c.Status(http.StatusNotFound)
			return
		}
		c.JSON(http.StatusOK, game)
	})

	router.POST("/game/:gameUUID/player/:playerUUID", func(c *gin.Context) {
		gameUUID, err := uuid.FromString(c.Params.ByName("gameUUID"))
		if err != nil {
			log.Printf("UUID Game Parse Failed: %s\n", err)
		}
		playerUUID, err := uuid.FromString(c.Params.ByName("playerUUID"))
		if err != nil {
			log.Printf("UUID Player Parse Failed: %s\n", err)
		}
		game, found := cache.Get(gameUUID)
		if !found {
			c.Status(http.StatusNotFound)
			return
		}
		_game := game.(Game)

		var player Player
		err = c.BindJSON(&player)
		if err != nil {
			log.Printf("Error: %s\n", err)
		}

		if len(_game.Players) > 1 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "TicTacToe can only be played with two players."})
			return
		}

		_game.Players = append(_game.Players, &Player{
			UUID: &playerUUID,
			Name: player.Name,
		})
		cache.Set(gameUUID, _game, 0)
		c.JSON(http.StatusOK, _game)
	})

	//
	//
	//

	if os.Getenv("GIN_MODE") == "release" {
		log.Fatal(autotls.Run(router, "tictactoe.l3vi.co"))
	} else {
		log.Fatal(router.Run(":80"))
	}
}
