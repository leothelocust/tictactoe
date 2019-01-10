package cache

import (
	"sync"
	"time"

	uuid "github.com/satori/go.uuid"
)

// Item for caching
type Item struct {
	Object     interface{}
	Expiration int64
}

// Cache is a simple in-memory cache for storing things
type Cache struct {
	*cache
}

type cache struct {
	defaultExpiration time.Duration
	items             map[uuid.UUID]Item
	mu                sync.RWMutex
	onEvicted         func(uuid.UUID, interface{})
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
