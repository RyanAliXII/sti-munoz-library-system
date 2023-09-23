package scanner


type NewAccountBody struct{
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required,min=10"`
	Description string `json:"description" binding:"required,max=150"`
}