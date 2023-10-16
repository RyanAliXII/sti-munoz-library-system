package objstore
var contentTypes = map[string]string{
	"image/png": ".png",
	"image/jpeg": ".jpg",
	"image/jpg": ".jpg",
	"image/webp": ".webp",
}
func GetFileExtBasedOnContentType(contentType string)string{
	return contentTypes[contentType]
}

