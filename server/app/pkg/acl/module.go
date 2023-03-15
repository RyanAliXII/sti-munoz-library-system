package acl


var Modules = []Module{
	{	
		Id: 1,
		Name:        "Publisher",
		DisplayText: "Publisher",
		Permissions: []Permission{
			{
				Name:        "Publisher.Read",
				Description: "User can view publisher.",
			},
			{
				Name:        "Publisher.Edit",
				Description: "User can update publisher.",
			},
			{
				Name:        "Publisher.Delete",
				Description: "User can delete publisher.",
			},
			{
				Name:        "Publisher.Add",
				Description: "User can add publisher.",
			},
		},
	},
	{
		Id: 2,
		Name:        "Section",
		DisplayText: "Section",
		Permissions: []Permission{
			{
				Name:        "Section.Read",
				Description: "User can update section.",
			},
			{
				Name:        "Section.Edit",
				Description: "User can update section.",
			},
			{
				Name:        "Section.Delete",
				Description: "User can delete section.",
			},
			{
				Name:        "Section.Add",
				Description: "User can add section.",
			},
		},
	},
	{
		Id: 3,
		Name:        "Author",
		DisplayText: "Author",
		Permissions: []Permission{
			{
				Name:        "Author.Read",
				Description: "User can view author.",
			},
			{
				Name:        "Author.Edit",
				Description: "User can update author.",
			},
			{
				Name:        "Author.Delete",
				Description: "User can delete author.",
			},
			{
				Name:        "Author.Add",
				Description: "User can add author.",
			},
		},
	},
	{
		Id: 4,
		Name:        "Book",
		DisplayText: "Book",
		Permissions: []Permission{
			{
				Name:        "Book.Read",
				Description: "User can view book.",
			},
			{
				Name:        "Book.Edit",
				Description: "User can update book",
			},
			{
				Name:        "Book.Delete",
				Description: "User can weed or delete book.",
			},
			{
				Name:        "Book.Add",
				Description: "User can add book.",
			},
		},
	},
	{
		Id:5,
		Name:        "SOF",
		DisplayText: "Source of Fund",
		Permissions: []Permission{
			{
				Name:        "SOF.Read",
				Description: "User can view source of fund.",
			},
			{
				Name:        "SOF.Edit",
				Description: "User can update source of fund.",
			},
			{
				Name:        "SOF.Delete",
				Description: "User can delete source of fund.",
			},
			{
				Name:        "SOF.Add",
				Description: "User can add source of fund.",
			},
		},
	},
	{
		Id: 6,
		Name:        "Account",
		DisplayText: "Account",
		Permissions: []Permission{
			{
				Name:        "Account.Read",
				Description: "User can view client's account.",
			},
			{
				Name:        "Account.Add",
				Description: "User can add client's account.",
			},
		},
	},
	{
		Id: 7,
		Name:        "Accession",
		DisplayText: "Accession",

		Permissions: []Permission{
			{
				Name:        "Accession.Read",
				Description: "User can view accession.",
			},
		},
	},
	{
		Id: 8,
		Name:        "AccessControl",
		DisplayText: "Access Control",
		Permissions: []Permission{
			{
				Name:        "AccessControl.Role.Read",
				Description: "User can view user roles and permission.",
			},
			{
				Name:        "AccessControl.Role.Assign",
				Description: "User can assign role to user.",
			},
			{
				Name:        "AccessControl.Role.Add",
				Description: "User can create role.",
			},
			{
				Name:        "AccessControl.Role.Edit",
				Description: "User can edit role.",
			},
			{
				Name:        "AccessControl.Role.Delete",
				Description: "User can edit role.",
			},
		},
	},
}
var PermissionsFlatArray = getModulesPermissionsFlatArray()
var PermissionsStructuredMap = getModulesPermissionsStructuredMap()
var PermissionsFlatMap = getModulesPermissionsFlatMap()

func getModulesPermissionsFlatArray() []Permission {
	permissions := make([]Permission, 0)
	for _, module := range Modules {
		permissions = append(permissions, module.Permissions...)
	}
	return permissions

}

func getModulesPermissionsStructuredMap() map[string]map[string]Permission {
	permissions := map[string]map[string]Permission{}

	for _, module := range Modules {
		for _, p := range module.Permissions {
			permissions[module.Name] = map[string]Permission{
				p.Name: p,
			}
		}
	}
	return permissions
}

func getModulesPermissionsFlatMap() map[string]Permission {
	permissions := map[string]Permission{}

	for _, module := range Modules {
		for _, p := range module.Permissions {
			permissions[p.Name] = p
		}
	}
	return permissions
}
