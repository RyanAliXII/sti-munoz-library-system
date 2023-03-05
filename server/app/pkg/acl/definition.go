package acl

type Permission struct {
	Name        string `json:"name" db:"name"`
	Description string `json:"description" db:"name"`
}
type Module struct {
	Name        string       `json:"name"`
	DisplayText string       `json:"displayText"`
	Permissions []Permission `json:"permissions"`
}

// returns a flat list of permissions
