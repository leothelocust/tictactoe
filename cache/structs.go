package cache

import (
	"sync"
	"time"

	uuid "github.com/satori/go.uuid"
)

// Item for caching
type Item struct {
	Game       Game
	Expiration int64
}

// Game object for binding with JSON POST body
type Game struct {
	ID       string     `json:"id"`
	Player1  *Player    `json:"player1"`
	Player2  *Player    `json:"player2"`
	Turn     *uuid.UUID `json:"turn,omitempty"`
	Draw     *bool      `json:"draw,omitempty"`
	Winner   *uuid.UUID `json:"winner,omitempty"`
	Matrix   Matrix     `json:"matrix"`
	Tally    []*Tally   `json:"tally,omitempty"`
	NextGame string     `json:"next_game"`
	PrevGame string     `json:"previous_game"`
}

// Tally is a log of games won
type Tally struct {
	Player Player `json:"player"`
	Matrix Matrix `json:"matrix"`
}

// Matrix is the game board and player uuids
type Matrix [9]*uuid.UUID

// Player object for binding with JSON POST body
type Player struct {
	UUID uuid.UUID `json:"id"`
	Name string    `json:"name,omitempty"`
}

// Cache is a simple in-memory cache for storing things
type Cache struct {
	*cache
}

type cache struct {
	defaultExpiration time.Duration
	items             map[string]Item
	mu                sync.RWMutex
	onEvicted         func(string, interface{})
	janitor           *janitor
}

const (
	// NoExpiration For use with functions that take an expiration time.
	NoExpiration time.Duration = -1
	// DefaultExpiration For use with functions that take an expiration time.
	// Equivalent to passing in the same expiration duration as was given to
	// New() or NewFrom() when the cache was created (e.g. 5 minutes.)
	DefaultExpiration time.Duration = time.Hour * 1
)
