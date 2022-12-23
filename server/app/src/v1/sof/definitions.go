package sofsrc

type SourceBody struct {
	Name string `json:"name" binding:"required,max=100,min=1"`
}
