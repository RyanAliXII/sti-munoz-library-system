package utils
var contentTypeExts = map[string]string{
	"image/png": ".png",
	"image/jpeg": ".jpg",
	"image/jpg": ".jpg",
	"image/webp": ".webp",
}
func GetFileExtBasedOnContentType(contentType string)string{
	return contentTypeExts[contentType]
}

