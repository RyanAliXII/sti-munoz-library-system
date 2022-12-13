package definitions

type NewAuthorBody struct {
	Firstname string `json:"firstname" binding:"required" `
	Lastname  string `json:"lastname" binding:"required" `
}
