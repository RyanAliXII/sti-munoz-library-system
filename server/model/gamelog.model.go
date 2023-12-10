package model

import "github.com/RyanAliXII/sti-munoz-library-system/server/app/db"

type GameLog struct {
	Id string `json:"id" db:"id"`
	AccountId string `json:"accountId" db:"account_id"`
	Client AccountJSON `json:"client" db:"client"`
	GameId string `json:"gameId" db:"game_id"`
	Game GameJSON `json:"game" db:"game"`
	LoggedOutAt  db.NullableTime `json:"loggedOutAt" db:"logged_out_at"`
	IsLoggedOut bool `json:"isLoggedOut" db:"is_logged_out"`
	CreatedAt db.NullableTime `json:"createdAt" db:"created_at"`
}


