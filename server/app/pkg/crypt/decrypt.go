package crypt

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
)


func Decode(s string) ([]byte, error) {
	data, err := base64.StdEncoding.DecodeString(s)	
	return data, err
} 

func Decrypt(text string ) (string, error) {
	block, err := aes.NewCipher([]byte(secret))
	if err != nil {
	 return "", err
	}
	cipherText, decodeErr := Decode(text)
	cfb := cipher.NewCFBDecrypter(block, bytes)
	plainText := make([]byte, len(cipherText))
	cfb.XORKeyStream(plainText, cipherText)
	return string(plainText), decodeErr
}