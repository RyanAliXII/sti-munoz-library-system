package section

type SectionBody struct {
	Name            string `json:"name" binding:"required"`
	HasOwnAccession bool   `json:"hasOwnAccession"`
}
