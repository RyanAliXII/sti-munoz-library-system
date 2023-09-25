package scanner

import "github.com/gin-gonic/gin"


type ScannerController interface {
	Login (ctx * gin.Context)
}

type Scanner struct {


}
func(c * Scanner) Login (ctx * gin.Context){

}


func NewScannerController () ScannerController{

	return &Scanner{}
}