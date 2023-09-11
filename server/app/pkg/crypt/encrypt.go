package crypt

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
)



func Encrypt(text string) (string, error) {
	block, err := aes.NewCipher([]byte(secret))
	if err != nil {
	 return "", err
	}
	plainText := []byte(text)
	cfb := cipher.NewCFBEncrypter(block, bytes)
	cipherText := make([]byte, len(plainText))
	cfb.XORKeyStream(cipherText, plainText)
	return Encode(cipherText), nil
}

func Encode(b []byte) string {
	return base64.StdEncoding.EncodeToString(b)
}
   

