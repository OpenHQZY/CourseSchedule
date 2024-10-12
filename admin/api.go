package admin

import (
	"os"

	"github.com/gin-gonic/gin"
)

func login(ctx *gin.Context) {
	type requeseBody struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	var body requeseBody
	err := ctx.BindJSON(&body)
	if err != nil {
		ctx.JSON(400, gin.H{
			"message": "bad request",
		})
		ctx.Abort()
		return
	}

	username := body.Username
	password := body.Password

	if username == config.Username && password == config.Password {
		session := createSession()
		ctx.JSON(200, gin.H{
			"token": session,
		})
	} else {
		ctx.JSON(401, gin.H{
			"message": "unauthorized",
		})
	}
}

func logout(ctx *gin.Context) {
	token := ctx.GetHeader("Authorization")
	if checkSession(token) {
		ctx.JSON(200, gin.H{
			"message": "success",
		})
	} else {
		ctx.JSON(401, gin.H{
			"message": "unauthorized",
		})
	}
}

func getDataFiles(ctx *gin.Context) {
	token := ctx.GetHeader("Authorization")
	if !checkSession(token) {
		ctx.JSON(401, gin.H{
			"message": "unauthorized",
		})
		ctx.Abort()
		return
	}
	files, err := os.ReadDir("data")
	if err != nil {
		ctx.JSON(500, gin.H{
			"message": "internal server error",
		})
		return
	}

	filteredFiles := []string{}

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		filteredFiles = append(filteredFiles, file.Name())
	}

	ctx.JSON(200, gin.H{
		"files": filteredFiles,
	})
}

func deleteDataFile(ctx *gin.Context) {
	token := ctx.GetHeader("Authorization")
	if !checkSession(token) {
		ctx.JSON(401, gin.H{
			"message": "unauthorized",
		})
		ctx.Abort()
		return
	}

	filename := ctx.Param("filename")
	err := os.Remove("data/" + filename)
	if err != nil {
		ctx.JSON(500, gin.H{
			"message": "internal server error",
		})
		return
	}

	ctx.JSON(200, gin.H{
		"message": "success",
	})
}

func setNotice(ctx *gin.Context) {
	token := ctx.GetHeader("Authorization")
	type requestBody struct {
		Notice string `json:"notice"`
	}

	if !checkSession(token) {
		ctx.JSON(401, gin.H{
			"message": "unauthorized",
		})
		ctx.Abort()
		return
	}

	body := requestBody{}
	err := ctx.BindJSON(&body)
	if err != nil {
		ctx.JSON(400, gin.H{
			"message": "bad request",
		})
		ctx.Abort()
	}

	config.Notice = body.Notice
	saveConfig()

	ctx.JSON(200, gin.H{
		"message": "success",
	})
}

func getNotice(c *gin.Context) {
	c.JSON(200, gin.H{
		"code":    200,
		"message": "ok",
		"data":    config.Notice,
	})
}

func ping(c *gin.Context) {
	c.JSON(200, gin.H{
		"code":    200,
		"message": "ok",
	})
}

func check(c *gin.Context) {
	token := c.GetHeader("Authorization")
	if checkSession(token) {
		c.JSON(200, gin.H{
			"code":    200,
			"message": "ok",
		})
		return
	}

	c.JSON(401, gin.H{
		"code":    401,
		"message": "unauthorized",
	})
}

func uploadToData(ctx *gin.Context) {
	token := ctx.GetHeader("Authorization")
	if !checkSession(token) {
		ctx.JSON(401, gin.H{
			"message": "unauthorized",
		})
		ctx.Abort()
		return
	}

	form, err := ctx.MultipartForm()
	if err != nil {
		ctx.JSON(400, gin.H{
			"message": "bad request",
		})
		ctx.Abort()
		return
	}

	files := form.File["files"]
	if len(files) == 0 {
		ctx.JSON(400, gin.H{
			"message": "no files uploaded",
		})
		ctx.Abort()
		return
	}

	for _, file := range files {
		if file.Size > 1024*100 {
			ctx.JSON(400, gin.H{
				"message": "file too large",
			})
			ctx.Abort()
			return
		} // 100KB

		if file.Filename[len(file.Filename)-16:] != ".wakeup_schedule" {
			ctx.JSON(400, gin.H{
				"message": "file name should be wakeup_schedule",
			})
			ctx.Abort()
			return
		}

		err := ctx.SaveUploadedFile(file, "data/"+file.Filename)
		if err != nil {
			ctx.JSON(500, gin.H{
				"message": "internal server error",
			})
			return
		}
	}

	ctx.JSON(200, gin.H{
		"message": "success",
	})
}

func cleanData(ctx *gin.Context) {
	token := ctx.GetHeader("Authorization")
	if !checkSession(token) {
		ctx.JSON(401, gin.H{
			"message": "unauthorized",
		})
		ctx.Abort()
		return
	}

	files, err := os.ReadDir("data")
	if err != nil {
		ctx.JSON(500, gin.H{
			"message": "internal server error",
		})
		return
	}

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		err := os.Remove("data/" + file.Name())
		if err != nil {
			ctx.JSON(500, gin.H{
				"message": "internal server error",
			})
			return
		}
	}
}

func RegisterAdminRoutes(r *gin.Engine) {
	api := r.Group("/api")
	api.POST("/login", login)
	api.POST("/logout", logout)
	api.GET("/data", getDataFiles)
	api.DELETE("/data/:filename", deleteDataFile)
	api.POST("/notice", setNotice)
	api.GET("/notice", getNotice)
	api.GET("/ping", ping)
	api.GET("/check", check)
	api.PUT("/upload", uploadToData)
	api.DELETE("/clean", cleanData)
}
