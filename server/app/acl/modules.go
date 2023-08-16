package acl


type Module struct {
	Id int `json:"id"`
	Name string `json:"name"`
	Value string `json:"value"`
	Description string `json:"description"`
}


var Modules = []Module{
	{
		Id: 1,
		Value:"Book.Access",
		Description: "Allows user to access book module.",
	},
	{
		Id: 2, 
		Value: "Author.Access",
		Description: "Allows user to access author module.",
	},
	{
		Id: 3,
		Value: "Publisher.Access",
		Description: "Allows user to access publisher module.",
	},
	{
		Id: 4,
		Value: "Section.Access", 
		Description: "Allows user to access book section module." ,
	},
	{
		Id: 5,
		Value:"FundSource.Access",
		Description: "Allows user to access source of fund module.",
	},
	{
		Id: 6,
		Value:"Account.Access",
		Description: "Allows user to access account module.",
	},
	{
		Id: 7,
		Value: "Audit.Access",
		Description: "Allows user to access audit module.",
	},
	{
		Id: 8,
		Value: "ACL.Access",
		Description: "Allows user to access access control module.",
	},
	{
		Id: 9,
		Value: "Settings.Access",
		Description: "Allows user to access settings module.",
	},
	{
		Id: 10, 
		Value: "Borrowing.Access",
		Description: "Allows user to access borrowing module.",
	},
	{
		Id: 11, 
		Value: "Penalty.Access",
		Description: "Allows user to access penalty module.",
	},
}


