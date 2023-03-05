package security

type Permission struct {
	Name        string `json:"name" db:"name"`
	IsRoot      bool   `json:"isRoot" db:"isRoot"`
	Description string `json:"description" db:"name"`
}

var Permissions = map[string][]Permission{

	"publisher": {
		{
			Name:        "Publisher.Access",
			Description: "User has access to publisher module.",
			IsRoot:      true,
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

	"author": {
		{
			Name:        "Author.Access",
			Description: "User has access to author module.",
			IsRoot:      true,
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
	"book": {
		{
			Name:        "Book.Access",
			Description: "User has access to book module.",
			IsRoot:      true,
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
	"source": {
		{
			Name:        "SOF.Access",
			Description: "User has access to source of fund module.",
			IsRoot:      true,
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
	"account": {
		{
			Name:        "Account.Access",
			Description: "User has access to client's account module.",
			IsRoot:      true,
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
	"accession": {
		{
			Name:        "Accession.Access",
			Description: "User has access to accession module.",
			IsRoot:      true,
		},
		{
			Name:        "Accession.Read",
			Description: "User can view accession.",
		},
	},
	"security": {
		{
			Name:        "AccessControl.Security",
			IsRoot:      true,
			Description: "User can view security access control module.",
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
}

// func createPermission(domain string){
// permissions := []string{
// 	".NoAccess",
// 	".Read",
// 	".Update",
// 	".Add",
// 	".Delete",
// }

// }
