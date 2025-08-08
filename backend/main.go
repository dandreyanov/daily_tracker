// backend/main.go
package main

import (
	"encoding/json"
	"github.com/golang-jwt/jwt/v4"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

var jwtKey = []byte("my_secret_key")

// Простые учётки
var users = map[string]string{
	"admin":  "password123",
	"nastya": "4524190",
}

type Credentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

type Task struct {
	ID   string `json:"id"`
	Text string `json:"text"`
	Done bool   `json:"done"`
}

type Column struct {
	ID    string `json:"id"`
	Title string `json:"title"`
	Tasks []Task `json:"tasks"`
}

func loadData() ([]Column, error) {
	f, err := os.Open("data.json")
	if err != nil {
		return nil, err
	}
	defer f.Close()
	var cols []Column
	if err := json.NewDecoder(f).Decode(&cols); err != nil {
		return nil, err
	}
	return cols, nil
}

func saveData(cols []Column) error {
	f, err := os.Create("data.json")
	if err != nil {
		return err
	}
	defer f.Close()
	enc := json.NewEncoder(f)
	enc.SetIndent("", "  ")
	return enc.Encode(cols)
}

func loginHandler(c *gin.Context) {
	var creds Credentials
	if err := c.BindJSON(&creds); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad request"})
		return
	}
	pass, ok := users[creds.Username]
	if !ok || pass != creds.Password {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}
	expiration := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		Username: creds.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiration),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not sign token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": tokenString})
}

func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if len(auth) < 7 || auth[:7] != "Bearer " {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
			return
		}
		tokenString := auth[7:]
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		c.Next()
	}
}

func main() {
	r := gin.Default()
	r.Use(cors.Default())

	r.POST("/api/login", loginHandler)

	auth := r.Group("/api", authMiddleware())
	{
		auth.GET("/board", func(c *gin.Context) {
			cols, err := loadData()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, cols)
		})
		auth.POST("/board", func(c *gin.Context) {
			var cols []Column
			if err := c.BindJSON(&cols); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			if err := saveData(cols); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.Status(http.StatusNoContent)
		})
	}

	r.Run(":8080")
}
