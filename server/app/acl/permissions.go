package acl


type Permission struct {
	Id int `json:"id"`
	Name string `json:"name"`
	Value string `json:"value"`
	Description string `json:"description"`
}


var Permissions = []Permission{
	{
		Id: 1,
		Name: "Book Module",
		Value:"Book.Access",
		Description: "Allows user to access book module.",
	},
	{
		Id: 2, 
		Name: "Author Module",
		Value: "Author.Access",
		Description: "Allows user to access author module.",
	},
	{
		Id: 3,
		Name: "Publisher Module",
		Value: "Publisher.Access",
		Description: "Allows user to access publisher module.",
	},
	{
		Id: 4,
		Name: "Section Module",
		Value: "Section.Access", 
		Description: "Allows user to access book section module." ,
	},
	{
		Id: 5,
		Name: "Source of Fund Module",
		Value:"FundSource.Access",
		Description: "Allows user to access source of fund module.",
	},
	{
		Id: 6,
		Name: "Account Module",
		Value:"Account.Access",
		Description: "Allows user to access account module.",
	},
	{
		Id: 7,
		Name: "Inventory Module",
		Value: "Audit.Access",
		Description: "Allows user to access audit module.",
	},
	{
		Id: 8,
		Name: "Access Control Module",
		Value: "ACL.Access",
		Description: "Allows user to access access control module.",
	},
	{
		Id: 9,
		Name: "Settings Module",
		Value: "Settings.Access",
		Description: "Allows user to access settings module.",
	},
	{
		Id: 10, 
		Name: "Borrowing Module",
		Value: "Borrowing.Access",
		Description: "Allows user to access borrowing module.",
	},
	{
		Id: 11, 
		Name: "Penalty Module",
		Value: "Penalty.Access",
		Description: "Allows user to access penalty module.",
	},
}


