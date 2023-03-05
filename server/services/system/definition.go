package system

type RoleBody struct {
	Name        string              `json:"name" binding:"required"`
	Permissions map[string][]string `json:"permissions"`
}
