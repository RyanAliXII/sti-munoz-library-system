package scanner


type NewAccountBody struct{
	Username string `json:"username" binding:"required,max=50"`
	Password string `json:"password" binding:"required,min=10,max=50"`
	Description string `json:"description" binding:"required,max=150"`
}

type UpdateAccountBody struct{
	Username string `json:"username" binding:"required,max=50"`
	Password string `json:"password"`
	Description string `json:"description" binding:"required,max=150"`
}