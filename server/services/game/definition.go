package game
type GameBody struct {
	Name string `json:"name" binding:"required,max=100,min=1"`
	Description string `json:"description" binding:"required,min=1,max=255"`
}

type GameLogBody struct {
	AccountId string `json:"accountId" binding:"required,uuid"`
	GameId string `json:"gameId" binding:"required,uuid"`
}