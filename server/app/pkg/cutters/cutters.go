package cutters

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	data "slim-app/server/app/pkg/cutters/data"
	"strings"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

const (
	ALPHABET_STRING string = "abcdefghijklmnopqrstuvwxyz"
	DIRECTORY       string = "app/pkg/cutters/data/"
)

var ALPHABET_ARR []string = strings.Split(ALPHABET_STRING, "")

type Cutters struct {
	Default        map[string]int
	GroupedArray   map[string][]map[string]interface{}
	GroupedObjects map[string]map[string]int
	DefaultArray   []map[string]interface{}
}

func (cutters *Cutters) GenerateCutter(firstname string, lastname string) string {
	caser := cases.Title(language.English)
	firstname = strings.ToLower(firstname)
	lastname = strings.ToLower(lastname)
	firstnameInitialChar := firstname[0:1]
	lastnameInitialChar := lastname[0:1]
	endIndex := strings.Index(ALPHABET_STRING, firstnameInitialChar)
	concatenatedAlphabet := ALPHABET_ARR[0 : endIndex+1]
	alphabetLength := len(concatenatedAlphabet)
	for alphabetLength > 0 {
		alphabetLength--
		letter := concatenatedAlphabet[alphabetLength]
		var key string = fmt.Sprintf("%s, %s.", caser.String(lastname), caser.String(letter))
		number := cutters.Default[key]
		if number != 0 {
			return fmt.Sprint(caser.String(lastnameInitialChar), number)
		}

	}

	var key string = caser.String(lastname)
	for len(key) != 0 {
		fmt.Println(key)
		number := cutters.Default[key]
		if number != 0 {
			return fmt.Sprint(caser.String(lastnameInitialChar), number)
		}
		key = key[0 : len(key)-1]
	}

	return ""

}

func NewCuttersTable() *Cutters {
	return &Cutters{
		Default:        data.CUTTERS_TABLE,
		GroupedArray:   LoadGroupedArray(),
		GroupedObjects: LoadGroupedObjects(),
		DefaultArray:   LoadWholeArray(),
	}
}

func LoadFromJSON() map[string]int {

	jsonFile, jsonReadErr := os.Open("data/data.json")

	if jsonReadErr != nil {
		fmt.Println(jsonReadErr.Error())
	}
	defer jsonFile.Close()
	jsonByte, _ := ioutil.ReadAll(jsonFile)

	cutters := map[string]int{}
	json.Unmarshal(jsonByte, &cutters)
	return cutters
}

func LoadGroupedArray() map[string][]map[string]interface{} {
	jsonFile, jsonReadErr := os.Open(fmt.Sprintf("%s/%s", DIRECTORY, "grouped-array.json"))

	if jsonReadErr != nil {
		fmt.Println(jsonReadErr.Error())
	}
	defer jsonFile.Close()
	jsonByte, _ := ioutil.ReadAll(jsonFile)

	cutters := make(map[string][]map[string]interface{})
	json.Unmarshal(jsonByte, &cutters)
	return cutters
}
func LoadGroupedObjects() map[string]map[string]int {

	jsonFile, jsonReadErr := os.Open(fmt.Sprintf("%s/%s", DIRECTORY, "grouped-objects.json"))

	if jsonReadErr != nil {
		fmt.Println(jsonReadErr.Error())
	}
	defer jsonFile.Close()
	jsonByte, _ := ioutil.ReadAll(jsonFile)

	cutters := make(map[string]map[string]int)
	json.Unmarshal(jsonByte, &cutters)
	return cutters
}
func LoadWholeArray() []map[string]interface{} {

	jsonFile, jsonReadErr := os.Open(fmt.Sprintf("%s/%s", DIRECTORY, "whole-array.json"))

	if jsonReadErr != nil {
		fmt.Println(jsonReadErr.Error())
	}
	defer jsonFile.Close()
	jsonByte, _ := ioutil.ReadAll(jsonFile)

	cutters := make([]map[string]interface{}, 0)
	json.Unmarshal(jsonByte, &cutters)
	return cutters
}

func GenerateCutter(firstname string, lastname string) string {
	caser := cases.Title(language.English)
	firstname = strings.ToLower(firstname)
	lastname = strings.ToLower(lastname)
	firstnameInitialChar := firstname[0:1]
	lastnameInitialChar := lastname[0:1]
	endIndex := strings.Index(ALPHABET_STRING, firstnameInitialChar)
	concatenatedAlphabet := ALPHABET_ARR[0 : endIndex+1]
	alphabetLength := len(concatenatedAlphabet)
	for alphabetLength > 0 {
		alphabetLength--
		letter := concatenatedAlphabet[alphabetLength]
		var key string = fmt.Sprintf("%s, %s.", caser.String(lastname), caser.String(letter))
		number := data.CUTTERS_TABLE[key]
		if number != 0 {
			return fmt.Sprint(caser.String(lastnameInitialChar), number)
		}

	}

	var key string = caser.String(lastname)
	for len(key) != 0 {
		fmt.Println(key)
		number := data.CUTTERS_TABLE[key]
		if number != 0 {
			return fmt.Sprint(caser.String(lastnameInitialChar), number)
		}
		key = key[0 : len(key)-1]
	}

	return ""

}