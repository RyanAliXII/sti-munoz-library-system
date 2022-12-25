package categorysrc

type CategoryBody struct {
	Name string `json:"name" binding:"required,alphanum"`
}
