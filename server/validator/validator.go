package validator

import (
	"github.com/jmoiron/sqlx"
)

type Validator struct{
	AuthorValidator authorValidator
	PublisherValidator publisherValidator
	CollectionValidator collectionValidator
	ScannerAcountValidator scannerAccountValidator
	PenaltyClassValidator penaltyClassValidator
	TimeSlotValidator timeSlotValidator
}
func NewValidator(db * sqlx.DB)Validator{
	return Validator{
		AuthorValidator:  NewAuthorValidator(db),
		PublisherValidator: NewPublisherValidator(db),
		CollectionValidator: NewCollectionValidator(db),
		ScannerAcountValidator:  NewScannerAccountValidator(db),
		PenaltyClassValidator: NewPenaltyClassValidator(db),
		TimeSlotValidator: NewTimeSlotValidator(db),
	}
}