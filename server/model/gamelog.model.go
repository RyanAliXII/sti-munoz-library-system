package model

import "github.com/RyanAliXII/sti-munoz-library-system/server/app/db"

type GameLog struct {
	Id string `json:"id" db:"id"`
	ClientId string `json:"clientId" db:"account_id"`
	Client AccountJSON `json:"client" db:"account"`
	GameId string `json:"gameId" db:"game_id"`
	CreatedAt db.NullableTime `json:"createdAt" db:"created_at"`
}


