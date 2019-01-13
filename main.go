package main

import (
	"errors"
	"log"
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
		var series Cache.Series
		err := c.BindJSON(&series)
		if err != nil {
			log.Printf("Error Binding Request %s\n", err.Error())
		}
		if len(series.ID) == 0 {
			err = errors.New("id is required")
		}
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		cache.Set(series.ID, series, 0)
		c.JSON(http.StatusOK, series)
	})

	router.GET("/game/:seriesID", func(c *gin.Context) {
		seriesID := c.Params.ByName("seriesID")
		series, found := cache.Get(seriesID)
		if !found {
			c.Status(http.StatusNotFound)
			return
		}
		c.JSON(http.StatusOK, series)
	})

	router.POST("/game/:seriesID", func(c *gin.Context) {
		seriesID := c.Params.ByName("seriesID")
		series, found := cache.Get(seriesID)
		if !found {
			c.Status(http.StatusNotFound)
			return
		}

		var updateSeries Cache.Series
		err := c.BindJSON(&updateSeries)
		if err != nil {
			log.Printf("Error: %s\n", err)
		}

		if updateSeries.Turn != nil {
			series.Turn = updateSeries.Turn
		}
		if (Cache.Matrix{}) != updateSeries.Matrix {
			series.Matrix = updateSeries.Matrix
		}
		// if updateGame.Draw != nil {
		// 	game.Draw = updateGame.Draw
		// }
		// if updateGame.Winner != nil {
		// 	game.Winner = updateGame.Winner
		// }
		if updateSeries.LogTally != nil {
			series.Tally = append(series.Tally[1:], updateSeries.LogTally)
		}
		cache.Set(seriesID, series, 0)
		c.JSON(http.StatusOK, series)
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
