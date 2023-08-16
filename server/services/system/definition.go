package system


type PermissionBody struct {
	Id int `json:"id"  binding:"required,min=1"`
	Name string `json:"name" binding:"required,min=1"`
	Value string `json:"value"  binding:"required"`
	Description string `json:"description"  binding:"required"`
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

type AccountBody struct {
	Id          string `json:"id" binding:"required,uuid"`
	DisplayName string `json:"displayName" binding:"required"`
	GivenName   string `json:"givenName" binding:"required"`
	Surname     string `json:"surname" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
}


type SettingsValueBody struct {
	DuePenalty SettingsFieldIntBody `json:"app.due-penalty" binding:"required,dive"`
}
type SettingsFieldIntBody struct {
	Id string `json:"id" binding:"required"`
	Label string `json:"label"  binding:"required"`
	Description string `json:"description"  binding:"required"`
	Value int `json:"value"  binding:"required,gte=0"`

}