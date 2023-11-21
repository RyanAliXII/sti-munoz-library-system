package device

import "github.com/gin-gonic/gin"


type Device struct {}

func NewDeviceController() DeviceController{
	return &Device{}
}
type DeviceController interface{
	NewDevice(ctx * gin.Context)
}
func(ctrler * Device) NewDevice (ctx * gin.Context){

}