package user
type UserType struct {
	Name string `json:"name" binding:"required,max=50"`
	HasProgram bool `json:"hasProgram"`
}