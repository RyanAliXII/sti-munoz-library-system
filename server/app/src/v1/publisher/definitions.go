package publishersrc

type PublisherBody struct {
	Name string `json:"name" binding:"required,max=150,min=1"`
}
