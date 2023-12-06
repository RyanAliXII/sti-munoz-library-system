package section

type SectionBody struct {
	Name            string `json:"name" binding:"required,max=150,min=1"`
	Prefix          string `json:"prefix" binding:"required,max=150,min=1"`
	HasOwnAccession bool   `json:"hasOwnAccession"`
}


type UpdateSectionBody struct {
	Name            string `json:"name" binding:"required,max=150,min=1"`
	Prefix          string `json:"prefix" binding:"required,max=150,min=1"`
	LastValue        int `json:"lastValue" binding:"required,min=0"`
}


type CollectionFilter struct {
	IsMain bool `json:"isMain" form:"isMain"`
}
