package definitions

type CreateCategoryBody struct {
	Name string `json:"name" binding:"required" `
}
