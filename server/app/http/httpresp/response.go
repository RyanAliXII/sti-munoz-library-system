package httpresp

import "net/http"

type HttpResponse struct {
	Status  string                 `json:"status"`
	Code    int                    `json:"code"`
	Data    map[string]interface{} `json:"data"`
	Message string                 `json:"message"`
}

func Fail(code int, data map[string]interface{}, message string) (int, HttpResponse) {
	return code, HttpResponse{
		Status:  "fail",
		Code:    code,
		Data:    data,
		Message: message,
	}
}

func Success(code int, data map[string]interface{}, message string) (int, HttpResponse) {
	return code, HttpResponse{
		Status:  "success",
		Code:    code,
		Data:    data,
		Message: message,
	}
}

func Success200(data map[string]interface{}, message string) (int, HttpResponse) {
	return http.StatusOK, HttpResponse{
		Status:  "success",
		Code:    http.StatusOK,
		Data:    data,
		Message: message,
	}
}

func Fail400(data map[string]interface{}, message string) (int, HttpResponse) {
	return http.StatusBadRequest, HttpResponse{
		Status:  "fail",
		Code:    http.StatusBadRequest,
		Data:    data,
		Message: message,
	}
}
