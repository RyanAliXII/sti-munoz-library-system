package model

import validation "github.com/go-ozzo/ozzo-validation"


type Model struct {

}

func (m * Model) Validate(structPtr interface{}, fields ...*validation.FieldRules)(validation.Errors, error) {
	err :=  validation.ValidateStruct(structPtr, fields...)
	if err != nil {
		validationErrors, isValidationErr := err.(validation.Errors)
		if isValidationErr {
				return validationErrors, err
		}
	}
	return validation.Errors{}, nil
}