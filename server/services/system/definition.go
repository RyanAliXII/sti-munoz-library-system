package system

type RoleBody struct {
	Name        string              `json:"name" binding:"required"`
	Permissions map[string][]string `json:"permissions"`
}

type AssignBody []struct {
	Role    AssignRoleBody    `json:"role" binding:"dive"`
	Account AssignAccountBody `json:"account" binding:"dive"`
}
type AssignRoleBody struct {
	Id int `json:"id" binding:"required,min=1"`
}
type AssignAccountBody struct {
	Id string `json:"id" binding:"required,uuid"`
}
