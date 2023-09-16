package section

type SectionBody struct {
	Name            string `json:"name" binding:"required,max=150,min=1"`
	Prefix          string `json:"prefix" binding:"required,max=150,min=1"`
	HasOwnAccession bool   `json:"hasOwnAccession"`
}
