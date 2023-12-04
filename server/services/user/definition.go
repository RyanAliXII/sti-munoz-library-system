package user
type UserType struct {
	Name string `json:"name" binding:"required,max=50"`
	HasProgram bool `json:"hasProgram"`
}

type UserTypeFilter struct {
	HasProgram bool `form:"hasProgram"`
}
type UserProgram struct {
	Code string `json:"code" binding:"required,max=50"`
	Name string `json:"name" binding:"required,max=255"`
	UserTypeId int `json:"userTypeId" binding:"required,min=1"`
}