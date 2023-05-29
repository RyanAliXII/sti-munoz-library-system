package penalty

import "github.com/gin-gonic/gin"





type PenaltyController struct{

}

func (ctrler * PenaltyController) GetPenalties (ctx * gin.Context){

}



func NewInventoryController() PenaltyControllerInterface {

	return &PenaltyController{
		
	}

}

type PenaltyControllerInterface interface {
	GetPenalties (ctx * gin.Context)
}