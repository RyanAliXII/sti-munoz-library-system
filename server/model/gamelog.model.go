package model

import "github.com/RyanAliXII/sti-munoz-library-system/server/app/db"

type GameLog struct {
	Id string `json:"id" db:"id"`
	AccountId string `json:"accountId" db:"account_id"`
	Client AccountJSON `json:"client" db:"account"`
	GameId string `json:"gameId" db:"game_id"`
	Game GameJSON `json:"game" db:"game"`
	CreatedAt db.NullableTime `json:"createdAt" db:"created_at"`
}


