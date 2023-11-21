package device


type DeviceBody struct {
	Name string `json:"name" binding:"required,max=100"`
	Description string `json:"description" binding:"required,max=255"`
	Available int `json:"available" binding:"required,min=1"`
}