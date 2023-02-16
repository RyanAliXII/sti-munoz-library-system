package model

import (
	"database/sql/driver"
	"encoding/json"
)

type FundSource struct {
	Id   int    `json:"id"`
	Name string `db:"name" json:"name"`
}

type FundSourceJSON struct {
	FundSource
}

func (fundSource *FundSourceJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	if valid {
		unmarshalErr := json.Unmarshal(val, fundSource)
		if unmarshalErr != nil {
			*fundSource = FundSourceJSON{
				FundSource: FundSource{
					Id:   0,
					Name: "",
				},
			}
		}
	} else {
		*fundSource = FundSourceJSON{
			FundSource: FundSource{
				Id:   0,
				Name: "",
			},
		}
	}
	return nil

}
func (fundSource FundSourceJSON) Value(value interface{}) (driver.Value, error) {
	return fundSource, nil
}
