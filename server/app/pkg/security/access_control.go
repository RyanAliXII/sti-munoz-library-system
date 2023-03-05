package acl

type Permission struct {
	Name        string `json:"name" db:"name"`
	Description string `json:"description" db:"name"`
}
type Module struct {
	Name                       string       `json:"name"`
	DisplayText                string       `json:"displayText"`
	RequiredPermissionToAccess string       `json:"requiredPermissionToAccess"`
	Permissions                []Permission `json:"permissions"`
}

var Modules = []Module{
	{
		Name:                       "Publisher",
		DisplayText:                "Publisher",
		RequiredPermissionToAccess: "Publisher.Access",
		Permissions: []Permission{
			{
				Name:        "Publisher.Access",
				Description: "User has access to publisher module.",
			},
			{
				Name:        "Publisher.Read",
				Description: "User can view publisher.",
			},
			{
				Name:        "Publisher.Update",
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
		Name:                       "Author",
		DisplayText:                "Author",
		RequiredPermissionToAccess: "Author.Access",
		Permissions: []Permission{
			{
				Name:        "Author.Access",
				Description: "User has access to author module.",
			},

			{
				Name:        "Author.Read",
				Description: "User can view author.",
			},
			{
				Name:        "Author.Update",
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
		Name:                       "Book",
		DisplayText:                "Book",
		RequiredPermissionToAccess: "Book.Access",
		Permissions: []Permission{
			{
				Name:        "Book.Access",
				Description: "User has access to book module.",
			},
			{
				Name:        "Book.Read",
				Description: "User can view book.",
			},
			{
				Name:        "Book.Update",
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
		Name:                       "SOF",
		DisplayText:                "Source of Fund",
		RequiredPermissionToAccess: "SOF.Access",
		Permissions: []Permission{
			{
				Name:        "SOF.Access",
				Description: "User has access to source of fund module.",
			},
			{
				Name:        "SOF.Read",
				Description: "User can view source of fund.",
			},
			{
				Name:        "SOF.Update",
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
		Name:                       "Account",
		DisplayText:                "Account",
		RequiredPermissionToAccess: "Account.Access",
		Permissions: []Permission{
			{
				Name:        "Account.Access",
				Description: "User has access to client's account module.",
			},
			{
				Name:        "Account.Read",
				Description: "User can view client's account.",
			},
			{
				Name:        "Account.Add",
				Description: "User can add source of fund.",
			},
		},
	},
	{
		Name:                       "Accession",
		DisplayText:                "Accession",
		RequiredPermissionToAccess: "Accession.Access",
		Permissions: []Permission{
			{
				Name:        "Accession.Access",
				Description: "User has access to accession module.",
			},
			{
				Name:        "Accession.Read",
				Description: "User can view accession.",
			},
		},
	},
	{
		Name:                       "AccessControl",
		DisplayText:                "Access Control",
		RequiredPermissionToAccess: "AccessControl.Access",
		Permissions: []Permission{
			{
				Name:        "AccessControl.Access",
				Description: "User has access access control module.",
			},
			{
				Name:        "AccessControl.Assign",
				Description: "User can assign role to user.",
			},
			{
				Name:        "AccessControl.CreateRole",
				Description: "User can create role.",
			},
		},
	},
}

// }
