package repository

import "github.com/RyanAliXII/sti-munoz-library-system/server/model"

func (repo * PenaltyRepository)NewPenaltyClassification (class model.PenaltyClassification)(error){
	 _, err := repo.db.Exec(`INSERT INTO 
	 fee.penalty_classification(name, description, amount)VALUES($1, $2, $3)`, 
	 class.Name, class.Description, class.Amount)
	 return err
}
func (repo * PenaltyRepository)UpdatePenaltyClassification (class model.PenaltyClassification)(error){
	_, err := repo.db.Exec(`UPDATE fee.penalty_classification set name = $1, description = $2, amount = $3 where id = $4`, 
	class.Name, class.Description, class.Amount, class.Id)
	return err
}
func (repo * PenaltyRepository)GetPenaltyClassifications()([]model.PenaltyClassification, error){
	classes := make([]model.PenaltyClassification,0)
	err := repo.db.Select(&classes, "SELECT id, name, description, amount FROM fee.penalty_classification where deleted_at is null ORDER BY created_at desc")
	return classes, err
}
func (repo * PenaltyRepository)DeletePenaltyClassification(id string) error {
	_, err := repo.db.Exec("UPDATE fee.penalty_classification SET deleted_at = now() where id = $1 and deleted_at is null", id)
	return err
} 
