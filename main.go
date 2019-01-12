package main

import (
	"errors"
	"log"
	"math/rand"
	"net/http"
	"os"
	Cache "tictactoe-api/cache"
	"time"

	"github.com/gin-contrib/multitemplate"
	"github.com/gin-gonic/autotls"
	"github.com/gin-gonic/gin"
)

func setupRender() multitemplate.Renderer {
	r := multitemplate.NewRenderer()
	r.AddFromFiles("index", "dist/index.html")
	r.AddFromFiles("join", "dist/join.html")
	return r
}

const charBytes = "abcdefghijkmnopqrstuvwxyz023456789"

func generateRandom(n int) string {
	b := make([]byte, n)
	for i := range b {
		b[i] = charBytes[rand.Int63()%int64(len(charBytes))]
	}
	return string(b)
}

func main() {
	hub := newHub()
	go hub.run()
	cache := Cache.NewCache(time.Minute*10, time.Minute)
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

	router.GET("/join", func(c *gin.Context) {
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
		var game Cache.Game
		err := c.BindJSON(&game)
		if err != nil {
			log.Printf("Error Binding Request %s\n", err.Error())
		}
		count := 0
	generate:
		game.ID = generateRandom(6)
		_, found := cache.Get(game.ID)
		if found {
			count = count + 1
			log.Printf("GAME FOUND, trying again: %s\n", game.ID)
			if count >= 3 {
				err = errors.New("Could not generate a new game (too many games in progress)")
			} else {
				goto generate
			}
		}
		if err != nil {
			c.JSON(http.StatusConflict, gin.H{
				"error": err.Error(),
			})
		} else {
			game.Turn = &game.Player1.UUID
			cache.Set(game.ID, game, 0)
			c.JSON(http.StatusOK, game)
		}
	})

	router.GET("/game/:gameID", func(c *gin.Context) {
		gameID := c.Params.ByName("gameID")
		game, found := cache.Get(gameID)
		if !found {
			c.Status(http.StatusNotFound)
			return
		}
		c.JSON(http.StatusOK, game)
	})

	router.POST("/game/:gameID", func(c *gin.Context) {
		gameID := c.Params.ByName("gameID")
		game, found := cache.Get(gameID)
		if !found {
			c.Status(http.StatusNotFound)
			return
		}

		var updateGame Cache.Game
		err := c.BindJSON(&updateGame)
		if err != nil {
			log.Printf("Error: %s\n", err)
		}

		if updateGame.ID != "" {
			game.ID = updateGame.ID
		}
		if updateGame.Player1 != nil {
			game.Player1 = updateGame.Player1
		}
		if updateGame.Player2 != nil {
			game.Player2 = updateGame.Player2
		}
		if updateGame.Turn != nil {
			game.Turn = updateGame.Turn
		}
		if (Cache.Matrix{}) != updateGame.Matrix {
			game.Matrix = updateGame.Matrix
		}
		// if updateGame.Draw != nil {
		// 	game.Draw = updateGame.Draw
		// }
		// if updateGame.Winner != nil {
		// 	game.Winner = updateGame.Winner
		// }
		// if updateGame.Tally != nil {
		// 	game.Tally = append(game.Tally, updateGame.Tally[0])
		// }
		cache.Set(gameID, game, 0)
		c.JSON(http.StatusOK, game)
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
