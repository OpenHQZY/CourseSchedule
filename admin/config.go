package admin

import (
	"encoding/json"
	"math/rand"
	"os"
	"time"
)

type Config struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Notice   string `json:"notice"`
}

var config Config

func randomString(length int) string {
	seededRand := rand.New(rand.NewSource(time.Now().UnixNano()))
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}

func createConfig() Config {
	config := Config{
		Username: "admin",
		Password: randomString(16),
	}

	file, err := json.MarshalIndent(config, "", " ")
	if err != nil {
		panic(err)
	}

	err = os.WriteFile("config.json", file, 0644)
	if err != nil {
		panic(err)
	}

	return config
}

func readConfig() Config {
	file, err := os.ReadFile("config.json")
	if err != nil {
		panic(err)
	}

	var config Config
	err = json.Unmarshal(file, &config)
	if err != nil {
		panic(err)
	}

	return config
}

func init() {
	_, err := os.ReadFile("config.json")
	if err != nil {
		config = createConfig()
	} else {
		config = readConfig()
	}
}

type Session struct {
	Token string `json:"token"`
}

var sessions []Session

func createSession() string {
	token := randomString(32)
	sessions = append(sessions, Session{Token: token})
	return token
}

func checkSession(token string) bool {
	for _, session := range sessions {
		if session.Token == token {
			return true
		}
	}
	return false
}

func saveConfig() {
	file, err := json.MarshalIndent(config, "", " ")
	if err != nil {
		panic(err)
	}

	err = os.WriteFile("config.json", file, 0644)
	if err != nil {
		panic(err)
	}
}
