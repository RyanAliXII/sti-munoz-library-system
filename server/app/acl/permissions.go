package acl


type Permission struct {
	
	Name string `json:"name"`
	Value string `json:"value"`
	Description string `json:"description"`
}

var ClientPermissions = []string{"Catalog.Read", "Bag.Read","Book.Borrow","Profile.Read"}
var Permissions = []Permission{
	{
		Name: "View Book",
		Value:"Book.Read",
		Description: "Allows user to view books.",
	},
	{
		Name: "Add Book",
		Value:"Book.Add",
		Description: "Allows user to add books.",
	},
	{
		Name: "Edit Book",
		Value:"Book.Edit",
		Description: "Allows user to edit books.",
	},

	{
		Name: "View Author",
		Value:"Author.Read",
		Description: "Allows user to view author.",
	},
	{
	
		Name: "Add Author",
		Value: "Author.Add",
		Description: "Allows user to add author.",
	},
	
	{
	
		Name: "Edit Author",
		Value: "Author.Edit",
		Description: "Allows user to edit author.",
	},
	{
		Name: "Delete Author",
		Value: "Author.Delete",
		Description: "Allows user to delete author.",
	},
	{
		
		Name: "View Publisher",
		Value: "Publisher.Read",
		Description: "Allows user to view publisher.",
	},
	{
		Name: "Add Publisher",
		Value: "Publisher.Add",
		Description: "Allows user to add publisher.",
	},
	{
		Name: "Edit Publisher",
		Value: "Publisher.Edit",
		Description: "Allows user to edit publisher.",
	},
	{
		Name: "Delete Publisher",
		Value: "Publisher.Delete",
		Description: "Allows user to delete publisher.",
	},
	{
		Name: "View Collection",
		Value: "Collection.Read", 
		Description: "Allows user to view Collection." ,
	},
	{
		Name: "Add Collection",
		Value: "Collection.Add",
		Description: "Allows user to add collection.",
	},
	{
		Name: "Edit Collection",
		Value: "Collection.Edit",
		Description: "Allows user to edit collection.",
	},
	{
		Name: "Delete Collection",
		Value: "Collection.Delete",
		Description: "Allows user to delete collection.",
	},
	{
	
		Name: "Inventory Audit",
		Value: "Audit.Access",
		Description: "Allows user to access inventory audit module.",
	},	
	{
		Name: "View Account",
		Value: "Account.Read",
		Description: "Allows user to view account.",
	},
	{
		Name: "Add Account",
		Value: "Account.Add",
		Description: "Allows user to add account.",
	},
	{
		Name: "Edit Account",
		Value: "Account.Edit",
		Description: "Allows user to edit account.",
	},
	{
		Name: "View Borrowed Books",
		Value:  "BorrowedBook.View",
		Description: "Allows user to view borrowed book.",
	},
	{
		Name: "Add Borrowed Books",
		Value:  "BorrowedBook.View",
		Description: "Allows user to checkout book.",
	},

	{
		Name: "Edit Borrowed Books",
		Value:  "BorrowedBook.Edit",
		Description: "Allows user to edit borrowed book or its status.",
	},
	{
		Name: "View Queue",
		Value: "Queue.View",
		Description: "Allows user to view queue.",
	},
	{
		Name: "View Penalty",
		Value: "Penalty.Read",
		Description: "Allows user to view penalty.",
	},
	{
		Name: "Add Penalty",
		Value: "Penalty.Add",
		Description: "Allows user to add penalty.",
	},
	{
		Name: "Edit Penalty",
		Value: "Penalty.Edit",
		Description: "Allows user to edit penalty.",
	},
	{
		Name: "View Role",
		Value: "Role.Read",
		Description: "Allows user to view role.",
	},
	{
		Name: "Add Role",
		Value: "Role.Add",
		Description: "Allows user to add role.",
	},
	{
		Name: "Edit Role",
		Value: "Role.Edit",
		Description: "Allows user to edit role.",
	},
	{
		Name: "Delete Role",
		Value: "Role.Delete",
		Description: "Allows user to delete role.",
	},
	{
		Name: "Delete Role",
		Value: "Role.Delete",
		Description: "Allows user to delete role.",
	},
	{
		Name: "View Scanner Account",
		Value: "ScannerAccount.Read",
		Description: "Allows user to view scanner account.",
	},
	{
		Name: "Add Scanner Account",
		Value: "ScannerAccount.Add",
		Description: "Allows user to add scanner account.",
	},
	{
		Name: "Edit Scanner Account",
		Value: "ScannerAccount.Edit",
		Description: "Allows user to edit scanner account.",
	},
	{
		Name: "Delete Scanner Account",
		Value: "ScannerAccount.Delete",
		Description: "Allows user to delete scanner account.",
	},
	{
		Name: "View Patron Log",
		Value: "PatronLog.Read",
		Description: "Allows user to view patron log.",
	},
	{
		Name: "View Settings",
		Value: "Settings.Read",
		Description: "Allows user to view setting",
	},
	{
		Name: "Edit Settings",
		Value: "Settings.Edit",
		Description: "Allows user to edit setting",
	},
}




