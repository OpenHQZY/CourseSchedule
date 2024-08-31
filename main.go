package main

import (
	"flag"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-resty/resty/v2"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

var courseList []string
var DATA_DIR = "data"
var tempMap = make(map[string]*CourseTemp)
var port int

type Course struct {
	Name string `json:"name"`
	Flag int    `json:"flag"` // 搜索相关性
	Icon string `json:"icon"`
}

var icons = map[string]string{
	"机器人": "机器人", "计": "计算机", "沃尔沃营销": "沃尔沃", "物联网": "物联网", "数控": "数控", "电信": "电信",
	"大众技术": "大众",
	"大众营销": "大众", "时尚表演": "时尚表演", "龙神": "龙神", "航材": "航材", "无人机": "无人机", "美": "美术",
	"军士汽检": "军士汽检",
	"服":    "服装", "中车电动": "中车", "福特技术": "福特", "高职电商": "电商", "大众新能源": "大众",
	"大众非技术": "大众", "汽制": "汽车制造",
	"汽电": "汽车电子技术", "用友新道": "用友", "智联": "智联", "机制": "机制", "宝马非技术": "宝马",
	"保时捷技术": "保时捷",
	"宝马营销":  "宝马", "北汽技术": "北汽", "旅游": "旅游", "广本机修": "广本", "电商": "电商", "福特营销": "福特",
	"计算机": "计算机",
	"机工":  "数控", "广本营销": "广本", "高职应电": "扳手", "财管": "财务管理", "服装": "服装", "航装": "航材",
	"龙神钣喷": "龙神",

	"信息安全": "信息安全", "视传": "视传", "军士机制": "军士机制", "大数据": "大数据", "服设": "服设",
	"飞修":   "飞修",
	"军士汽制": "军士汽制", "人力": "人力", "航发": "航发", "数影": "数影", "军士信安": "军士信安", "室内": "室内",
	"北汽": "北汽", "军士网络": "军士网络", "智交": "智交", "新能源": "新能源", "移动互联": "移动互联",
	"服装表演": "服装表演", "网络": "网络", "软件": "软件", "商英": "商英", "车辆职": "车辆职", "电子": "电子",
	"中车焊接": "中车焊接", "宝马技术": "宝马技术", "轮机": "轮机", "陕汽技术": "陕汽技术", "中车": "中车",
	"车改":   "车改",
	"通用技术": "通用技术", "数媒": "数媒", "沃尔沃技术": "沃尔沃技术", "高职服装": "高职服装", "工程": "工程",
	"飞制": "飞制", "沃尔沃非技术": "沃尔沃非技术", "会计": "会计", "电气": "电气", "产品": "产品", "美术": "美术",
	"汽智": "汽智", "跨境电商": "跨境电商", "模具": "模具", "汽检": "汽检", "车工": "车工", "风电": "风电",
	"中车工艺": "中车工艺", "电会": "电会", "智控": "智控", "钣喷": "钣喷", "理想": "理想",
	"工业机器人": "工业机器人",
	"汽营":    "汽营", "电": "电", "营销": "营销", "机电": "机电", "广本钣喷": "广本钣喷", "国贸": "国贸",
	"福特非技术": "福特非技术",
}

func getIcon(courseName string) string {
	name := strings.ReplaceAll(courseName, "（中）", "")
	for key, value := range icons {
		if strings.Contains(name, key) {
			return value
		}
	}
	return "其他"
}

func log(time, word, ip string) {
	file, err := os.OpenFile("log.txt", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Println("open file error:", err)
		return
	}
	defer file.Close()

	urlencoded := strings.ReplaceAll(word, "|", "%7C")
	logEntry := fmt.Sprintf("%s|%s|%s\n", time, urlencoded, ip)

	_, err = file.Write([]byte(logEntry))
	if err != nil {
		fmt.Println("write log error:", err)
		return
	}
}

func Search(c *gin.Context) {
	type Request struct {
		Keyword string `json:"keyword"`
	}

	var request Request
	err := c.BindJSON(&request)
	if err != nil {
		c.JSON(200, gin.H{
			"code":    400,
			"message": "request args error",
			"data":    nil,
		})
		return
	}

	if strings.Trim(request.Keyword, " ") == "" {
		c.JSON(200, gin.H{
			"code":    400,
			"message": "keyword is empty",
			"data":    nil,
		})
		return
	}

	res := search_(request.Keyword)
	c.JSON(200, gin.H{
		"code":    200,
		"message": "ok",
		"data":    res,
	})
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
	thirtyMinutes := int64(30 * 60)
	if temp != nil && temp.Time+thirtyMinutes > (time.Now().Unix()) {
		ctx.JSON(200, gin.H{
			"code":    200,
			"message": "ok",
			"data":    temp.Code,
		})
		return
	}

	path := DATA_DIR + "/" + request.Keyword + ".wakeup_schedule"
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
	//app.Use(func(ctx *gin.Context) {
	//	ctx.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	//	ctx.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
	//	ctx.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	//	ctx.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	//
	//	if ctx.Request.Method == "OPTIONS" {
	//		ctx.AbortWithStatus(204)
	//		ctx.Abort()
	//		return
	//	}
	//	ctx.Next()
	//	return
	//})

	api := app.Group("/api")

	api.GET("/notice", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"code":    200,
			"message": "ok",
			"data":    notice,
		})
	})
	api.POST("/search", Search)
	api.POST("/get_code", getCourseCode)

	app.Static("/assets", "dist/assets")
	app.NoRoute(func(c *gin.Context) {
		c.File("dist/index.html")
	})
	if err := app.Run(fmt.Sprintf(":%d", port)); err != nil {
		panic(err)
	}
}

func search_(query string) []Course {
	query = strings.ReplaceAll(query, "班", "")
	var queryList []Course

	for _, item := range courseList {
		num := 0
		if len(query) > 0 && item[0] == query[0] {
			num += 4
		}

		for _, word := range query {
			if strings.ContainsRune(item, word) {
				if word >= '0' && word <= '9' {
					num += 1
				} else {
					num += 5
				}
			}
		}

		if num != 0 {
			icon := getIcon(item)
			queryList = append(queryList, Course{Name: item, Flag: num, Icon: icon})
		}
	}

	// 筛选相关性
	var resSlice []Course
	for _, c := range queryList {
		if c.Flag > 9 {
			resSlice = append(resSlice, c)
		}
	}

	sort.Slice(resSlice, func(i, j int) bool {
		return resSlice[i].Flag > resSlice[j].Flag
	})

	return resSlice
}

var notice string

func init() {
	flag.StringVar(&notice, "notice", "", "设置公告")
	flag.IntVar(&port, "port", 5001, "设置端口")
	flag.Parse()

	files, err := os.ReadDir(DATA_DIR)
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
