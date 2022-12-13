package pkg

import "fmt"

func GetCuttersTable() {
	var alphabet [26]string = [26]string{
		"a", "b", "c", "d", "e", "f",
		"g", "h", "i", "j", "k", "l",
		"m", "n", "o", "p", "q", "r",
		"s", "t", "u", "v", "w", "x",
		"y", "z"}

	fmt.Println(alphabet)

}
