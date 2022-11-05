package loadtmpl

import (
	"fmt"
	"io/fs"
	"path/filepath"
)

func LoadHTMLFiles(path string) []string {
	templateList := []string{}
	fmt.Println("LOADED TEMPLATES")
	filepath.Walk(path, func(path string, info fs.FileInfo, err error) error {
		if !info.IsDir() {
			fileExtension := filepath.Ext(path)
			if fileExtension == ".html" {
				templateList = append(templateList, path)
				fmt.Println(path)
			}

		}
		return nil
	})
	return templateList
}
