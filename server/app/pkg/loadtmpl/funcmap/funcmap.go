package funcmap

import (
	"fmt"
	"html/template"
)


var FuncMap template.FuncMap = template.FuncMap{
    "add" : Add,
    "ordinal": Ordinal,
}


func Add (num1 int, num2 int)int  {
    return num1 + num2
}
func Ordinal(n int) string {
    if n >= 11 && n <= 13 {
        return fmt.Sprintf("%dth", n)
    }

    switch n % 10 {
    case 1:
        return fmt.Sprintf("%dst", n)
    case 2:
        return fmt.Sprintf("%dnd", n)
    case 3:
        return fmt.Sprintf("%drd", n)
    default:
        return fmt.Sprintf("%dth", n)
    }
}