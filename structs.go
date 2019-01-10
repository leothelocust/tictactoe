package main

import (
	uuid "github.com/satori/go.uuid"
)

// Game object for binding with JSON POST body
type Game struct {
	UUID    uuid.UUID     `json:"id" binding:"required"`
	Players []*Player     `json:"players"`
	Turn    *uuid.UUID    `json:"turn"`
	Draw    *bool         `json:"draw,omitempty"`
	Winner  *uuid.UUID    `json:"winner,omitempty"`
	Matrix  [9]*uuid.UUID `json:"matrix" binding:"min=9,max=9"`
}

// Player object for binding with JSON POST body
type Player struct {
	UUID *uuid.UUID `json:"id"`
	Name string     `json:"name,omitempty"`
}
