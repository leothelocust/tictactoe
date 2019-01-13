package cache

import (
	"sync"
	"time"

	uuid "github.com/satori/go.uuid"
)

// Item for caching
type Item struct {
	Series     Series
	Expiration int64
}

// Series object for binding with JSON POST body
type Series struct {
	ID       string     `json:"id"`
	Turn     *uuid.UUID `json:"turn,omitempty"`
	Matrix   Matrix     `json:"matrix"`
	Tally    []*Matrix  `json:"tally,omitempty"`
	LogTally *Matrix    `json:"log_match,omitempty"`
}

// Matrix is the game board and player uuids
type Matrix [9]*uuid.UUID

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
