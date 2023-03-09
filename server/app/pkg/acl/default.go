package acl

import "strings"

type BuiltIn struct {
	Root map[string][]string
	MIS  map[string][]string
}

var BuiltInRoles = BuiltIn{
	Root: buildRootUserPermissions(),
	MIS:  buildMISPermissions(),
}

const (
	Root = "Root"
	MIS  = "All.Read"
)

func buildRootUserPermissions() map[string][]string {
	permissions := map[string][]string{}

	for _, module := range Modules {
		for _, p := range module.Permissions {
			permissions[module.Name] = append(permissions[module.Name], p.Name)
		}
	}

	return permissions
}

func buildMISPermissions() map[string][]string {
	//MIS permissions are read-only.
	permissions := map[string][]string{}
	for _, module := range Modules {
		for _, p := range module.Permissions {
			if strings.Contains(p.Name, "Read") {
				permissions[module.Name] = append(permissions[module.Name], p.Name)
			}
		}
	}
	return permissions
}
