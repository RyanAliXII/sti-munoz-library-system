package dewey

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

const (
	DIRECTORY string = "app/pkg/dewey/data/"
)

type DeweyDecimal struct {
	Name   string  `json:"name"`
	Number float64 `json:"number"`
}

func LoadFromJSON() []DeweyDecimal {

	jsonFile, jsonReadErr := os.Open(fmt.Sprintf("%s/%s", DIRECTORY, "data.json"))

	if jsonReadErr != nil {
		fmt.Println(jsonReadErr.Error())
	}
	defer jsonFile.Close()
	jsonByte, _ := ioutil.ReadAll(jsonFile)

	ddc := make([]DeweyDecimal, 0)
	json.Unmarshal(jsonByte, &ddc)

	return ddc
}
