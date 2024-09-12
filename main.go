package main

import (
	"flag"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-resty/resty/v2"
)

var courseList []string
var DataDir = "data"
var tempMap = make(map[string]*CourseTemp)
var port int

func log(time, word, ip string) {
	file, err := os.OpenFile("log.txt", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Println("open file error:", err)
		return
	}
	defer func(file *os.File) {
		err := file.Close()
		if err != nil {

		}
	}(file)

	urlencoded := strings.ReplaceAll(word, "|", "%7C")
	logEntry := fmt.Sprintf("%s|%s|%s\n", time, urlencoded, ip)

	_, err = file.Write([]byte(logEntry))
	if err != nil {
		fmt.Println("write log error:", err)
		return
	}
}

func getCourseCode(ctx *gin.Context) {
	type Request struct {
		Keyword string `json:"keyword"`
	}

	var request Request
	err := ctx.BindJSON(&request)
	if err != nil {
		ctx.JSON(200, gin.H{
			"code":    400,
			"message": "request args error",
			"data":    nil,
		})
		return
	}

	log(time.Now().Format("2006-01-02 15:04:05"), request.Keyword, ctx.ClientIP())

	temp := tempMap[request.Keyword]
	// 30分钟内有效
	thirtyMinutes := int64(28 * 60)
	if temp != nil && temp.Time+thirtyMinutes > (time.Now().Unix()) {
		ctx.JSON(200, gin.H{
			"code":    200,
			"message": "ok",
			"data":    temp.Code,
		})
		return
	}

	path := DataDir + "/" + request.Keyword + ".wakeup_schedule"
	_, err = os.Stat(path)
	if err != nil {
		ctx.JSON(400, gin.H{
			"code":    400,
			"message": "文件未找到",
			"data":    nil,
		})
		return
	}

	file, err := os.Open(path)
	if err != nil {
		ctx.JSON(400, gin.H{
			"code":    400,
			"message": "文件打开失败",
			"data":    nil,
		})
		return
	}
	fileContent, err := io.ReadAll(file)
	if err != nil {
		ctx.JSON(400, gin.H{
			"code":    400,
			"message": "文件读取失败",
			"data":    nil,
		})
		return
	}

	data := map[string]string{
		"schedule": string(fileContent),
		"data":     request.Keyword,
	}
	url := "https://i.wakeup.fun/share_schedule"
	headers := map[string]string{
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
		"version":    "241",
	}
	req := resty.New()
	type Result struct {
		Data string `json:"data"`
	}
	result := &Result{}
	_, err = req.R().
		SetHeaders(headers).
		SetFormData(data).
		SetResult(result).
		Post(url)

	if err != nil {
		ctx.JSON(400, gin.H{
			"code":    400,
			"message": "请求失败",
			"data":    nil,
		})
		return
	}

	if strings.Trim(result.Data, " ") == "" {
		ctx.JSON(400, gin.H{
			"code":    400,
			"message": "访问人数过多，由于分享次数限制，请稍后再试",
			"data":    nil,
		})
		return
	}

	resData := fmt.Sprintf("这是来自「WakeUp课程表」的课表分享，30分钟内有效哦，如果失效请再获取一次叭。为了保护隐私我们选择不监听你的剪贴板，请复制这条消息后，打开【WakeUp】的主界面，右上角第二个按钮 -> 从分享口令导入，按操作提示即可完成导入~分享口令为「%s」",
		result.Data,
	)

	ctx.JSON(200, gin.H{
		"code":    200,
		"message": "ok",
		"data":    resData,
	})

	tempMap[request.Keyword] = &CourseTemp{
		Keyword: request.Keyword,
		Code:    resData,
		Time:    time.Now().Unix(),
	}

	return
}

// CourseTemp 课表分享数据缓存
type CourseTemp struct {
	Keyword string `json:"keyword"`
	Code    string `json:"code"`
	Time    int64  `json:"time"`
}

func main() {

	app := gin.Default()

	// 调试模式 跨域
	app.Use(func(ctx *gin.Context) {
		ctx.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		ctx.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		ctx.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		ctx.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if ctx.Request.Method == "OPTIONS" {
			ctx.AbortWithStatus(204)
			ctx.Abort()
			return
		}
		ctx.Next()
		return
	})

	api := app.Group("/api")

	api.GET("/notice", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"code":    200,
			"message": "ok",
			"data":    notice,
		})
	})
	api.POST("/get_code", getCourseCode)

	app.Static("/assets", "dist/assets")
	app.NoRoute(func(c *gin.Context) {
		c.File("dist/index.html")
	})
	if err := app.Run(fmt.Sprintf(":%d", port)); err != nil {
		panic(err)
	}
}

var notice string

func init() {
	flag.StringVar(&notice, "notice", "", "设置公告")
	flag.IntVar(&port, "port", 5001, "设置端口")
	flag.Parse()

	files, err := os.ReadDir(DataDir)
	if err != nil {
		fmt.Println("Error reading !data directory!")
		os.Exit(1)
	}

	for _, file := range files {
		if !file.IsDir() {
			Ext := filepath.Ext(file.Name())
			if Ext == ".wakeup_schedule" {
				courseList = append(courseList, strings.ReplaceAll(file.Name(), ".wakeup_schedule", ""))
			}
		}
	}
}
