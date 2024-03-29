package main

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/fs"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"

	"github.com/fsnotify/fsnotify"
)

// ReplaceImageURLs 读取Markdown文件，找到所有<img>标签，并替换它们的URL
func ReplaceImageURLs(filePath string) error {
	// 读取Markdown文件
	content, err := ioutil.ReadFile(filePath)
	if err != nil {
		return err
	}

	// 正则表达式查找所有<img>标签的URL
	re := regexp.MustCompile(`<img[^>]+src="([^">]+)"`)
	matches := re.FindAllStringSubmatch(string(content), -1)

	for _, match := range matches {
		oldURL := match[1]
		if strings.Contains(oldURL, "jsdelivr") {
			continue
		}
		newURL, err := PicGoUpload(oldURL)
		if err != nil {
			// 再试一次
			newURL, err = PicGoUpload(oldURL)
			if err != nil {
				fmt.Println("second download error :" + oldURL)
				continue
			}

		}

		fmt.Println("oldURL:" + oldURL + " \t" + "newURL:" + newURL)
		// 替换URL
		content = []byte(strings.Replace(string(content), oldURL, newURL, 1))
	}

	// 将更改写回文件
	err = ioutil.WriteFile(filePath, content, os.ModePerm)
	if err != nil {
		return err
	}

	return nil
}

func ReplaceImageURLsMd(filePath string) error {

	currentDir, err := os.Getwd()
	if err != nil {
		fmt.Println(err)
		return err
	}

	// 读取Markdown文件
	content, err := ioutil.ReadFile(filePath)
	if err != nil {
		return err
	}

	contentStr := string(content)

	// 正则表达式查找Markdown图片链接
	// 例如：![alt text](http://example.com/image.jpg)
	re := regexp.MustCompile(`!\[.*?\]\((.*?)\)`)
	matches := re.FindAllStringSubmatch(contentStr, -1)

	for _, match := range matches {
		oldURL := match[1]
		if strings.Contains(oldURL, "jsdelivr") {
			continue
		}
		if !strings.HasPrefix(oldURL, "https:") && !strings.HasPrefix(oldURL, "http:") {

			// 读取文件
			fmt.Println("filePath:" + filePath + " \toldURL:" + oldURL)
			newURL, err := PicGoUploadLocal(oldURL, currentDir)
			if err != nil {

				// 重试一次
				newURL, err = PicGoUploadLocal(oldURL, currentDir) // 上传图片并获取新的URL
				if err != nil {
					fmt.Println("second download error :" + oldURL)
					continue
				}

			}
			fmt.Println("oldURL:" + oldURL + " \t" + "newURL:" + newURL)

			// 替换URL
			contentStr = strings.Replace(contentStr, oldURL, newURL, 1)
			continue
		}

		newURL, err := PicGoUpload(oldURL) // 上传图片并获取新的URL
		if err != nil {

			// 重试一次
			newURL, err = PicGoUpload(oldURL) // 上传图片并获取新的URL
			if err != nil {
				fmt.Println("second download error :" + oldURL)
				continue
			}

		}
		fmt.Println("oldURL:" + oldURL + " \t" + "newURL:" + newURL)

		// 替换URL
		contentStr = strings.Replace(contentStr, oldURL, newURL, 1)
	}

	// 将更改写回文件
	err = ioutil.WriteFile(filePath, []byte(contentStr), os.ModePerm)
	if err != nil {
		return err
	}

	return nil
}

func replaceFileName(filePath, newFileName string) {
	fmt.Println("filePath:" + filePath + " newFileName:" + newFileName + "-")
	if strings.Contains(filePath, "--知识铺") {
		return
	}

	if newFileName == "" || len(newFileName) <= 0 {

		// 打开文件
		file, err := os.Open(filePath)
		if err != nil {
			fmt.Println("Error opening file:", err)
			return
		}

		// 创建新的 bufio.Scanner
		scanner := bufio.NewScanner(file)

		// 扫描第一行
		scanner.Scan()
		scanner.Scan()

		// 读取第二行
		text := scanner.Text()

		fmt.Println("1:" + text)
		text = strings.Replace(text, "title: ", "", -1)
		text = strings.Replace(text, ":", "", -1)
		fmt.Println("2:" + text)
		newFileName = text

		file.Close()
	}

	if newFileName == "" || len(newFileName) <= 0 || newFileName == "--知识铺" {
		fmt.Println("newFileName:" + newFileName)
		return
	}
	// 获取原文件目录
	//dir := path.Dir(filePath)
	// 获取文件所在的目录
	dir := filepath.Dir(filePath)

	// 新文件名加上后缀
	newFilePath := path.Join(dir, newFileName+".md")
	newFilePath = strings.Replace(newFilePath, ":", "", -1)

	fmt.Println("filePath:" + filePath)
	fmt.Println("newFilePath:" + newFilePath)

	// 读取文件内容
	data, err := ioutil.ReadFile(filePath)
	if err != nil {
		fmt.Println("Error reading file:", err)
		return
	}

	contentStr := string(data)
	// 过滤a标签，添加前缀 http://zshipu.com/t/index.html?url=
	contentStr = replaceAurl(contentStr)
	data = []byte(contentStr)

	// 写入文件
	err = ioutil.WriteFile(newFilePath, data, 0644)
	if err != nil {
		fmt.Println("Error writing file:", err)
		return
	}

	// 删除原文件
	err = os.Remove(filePath)
	if err != nil {
		fmt.Println("Error deleting file:", err)
		return
	}

	fmt.Println("File renamed successfully!")
}

// 分割路径
func splitName(path string) (string, string) {
	// 查找最后一个"/"的位置
	index := strings.LastIndex(path, "\\")
	if index == -1 {
		return "", path
	}

	// 返回父级目录和文件目录
	return path[:index], path[index+1:]
}

// 声明全局变量 startTime
var startTime time.Time

// 声明全局变量 i
var i int

func ExtractTags(filePath string) []string {
	// 提取中间部分的文件目录
	dirs := strings.Split(filePath, string(os.PathSeparator))
	var tagArr []string
	if len(dirs) >= 3 {
		tagArr = append(tagArr, dirs[len(dirs)-3])
	}
	if len(dirs) <= 1 {
		return nil
	}
	tagArr = append(tagArr, dirs[len(dirs)-2])
	return tagArr
}

func GetImageExtension(url string) string {
	ext := path.Ext(url)
	if ext == "" {
		return ""
	}
	return "." + ext[1:]
}

func fetchURL(url string) ([]byte, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP status code %d", resp.StatusCode)
	}

	return ioutil.ReadAll(resp.Body)
}

func getMagicNumber(data []byte) string {
	magicNumbers := map[string]string{
		"\xFF\xD8\xFF":                     ".jpg",  // JPEG
		"\x89\x50\x4E\x47\x0D\x0A\x1A\x0A": ".png",  // PNG
		"GIF87a":                           ".gif",  // GIF
		"GIF89a":                           ".gif",  // GIF
		"\x42\x4D":                         ".bmp",  // BMP
		"\x49\x49\x2A\x00":                 ".tif",  // TIFF (Little-endian)
		"\x4D\x4D\x00\x2A":                 ".tif",  // TIFF (Big-endian)
		"\x52\x49\x46\x46\x57\x45\x42\x50": ".webp", // WebP
		"\x52\x49\x46\x46\x43\x72\x65\x61": ".webp", // WebP (Lossless)
		"\x00\x00\x01\x00":                 ".ico",  // ICO
		"\x00\x00\x02\x00":                 ".cur",  // CUR
		"%!PS":                             ".eps",  // EPS
		"<svg":                             ".svg",  // SVG
		"%PDF":                             ".pdf",  // PDF
		"25\x50\x44\x46":                   ".ai",   // AI (Adobe Illustrator)
		"\x0A\x01":                         ".pcx",  // PCX
		"45\x78\x69\x66":                   ".exif", // EXIF
		"46\x4C\x49\x43":                   ".fpx",  // FPX
		"38\x42\x50\x53":                   ".psd",  // PSD
		"AF\x12":                           ".fli",  // FLIC
		"D7\xCD\xC6":                       ".wmf",  // WMF
		"01\x00\x00\x00":                   ".emf",  // EMF
	}

	for magic, ext := range magicNumbers {
		if len(data) >= len(magic) && string(data[:len(magic)]) == magic {
			return ext
		}
	}
	return ""
}

func isImageExtension(url string) bool {

	// 获取远程 URL 的内容
	data, err := fetchURL(url)
	if err != nil {
		fmt.Printf("Error fetching URL: %v\n", err)
		return false
	}
	// 判断是否为图片格式
	ext := getMagicNumber(data)
	if ext != "" {
		return true
	} else {
		fmt.Println("Not an image format.")
		ext := GetImageExtension(url)
		switch ext {
		case ".jpg", ".jpeg", ".webp", ".png", ".gif", ".bmp", ".tif",
			".svg", ".eps", ".ai", ".pcx", ".tga", ".exif", ".fpx", ".psd",
			".cdr", ".pcd", ".dxf", ".ufo", ".raw", ".wmf", ".flic", ".emf",
			".ico":
			return true
		default:
			return false
		}
	}

}

func replaceAurl(markdown string) string {
	// 定义要替换的字符串
	newURL := "http://zshipu.com/t/index.html?url="

	// 创建正则表达式
	re := regexp.MustCompile(`\[(.*?)\]\((.*?)\)`)

	// 替换 URL
	newMarkdown := re.ReplaceAllStringFunc(markdown, func(match string) string {

		// 获取链接文本和 URL
		text := re.FindStringSubmatch(match)[1]
		url := re.FindStringSubmatch(match)[2]

		fmt.Println("img url:" + url)
		// 图片不进行替换
		if isImageExtension(url) {
			fmt.Println("img url:" + url)
			// 返回替换后的字符串
			return fmt.Sprintf("[%s](%s)", text, url)
		}

		// 替换 URL
		url = newURL + url
		fmt.Println("a newURL:" + url)
		// 返回替换后的字符串
		return fmt.Sprintf("[%s](%s)", text, url)
	})

	// 打印替换后的 Markdown 文档
	//fmt.Println(newMarkdown)
	if len(newMarkdown) <= 0 {
		return markdown
	}
	return newMarkdown
}
func AddTitle(filePath string) (string, error) {

	fmt.Println("filePath:" + filePath)
	// 读取Markdown文件
	content, err := ioutil.ReadFile(filePath)
	if err != nil {
		return "", err
	}

	contentStr := string(content)
	if strings.HasPrefix(contentStr, "---") {
		return "", nil
	}
	// 获取父级目录和文件目录
	_, fileName := splitName(filePath)
	newFilename := strings.TrimSuffix(fileName, ".md")

	newFilename = strings.Replace(newFilename, "-今日头条", "", -1)
	newFilename = strings.Replace(newFilename, "东方财富网", "", -1)
	newFilename = strings.Replace(newFilename, "medium", "", -1)

	contentStr = strings.Replace(contentStr, "-今日头条", "", -1)
	contentStr = strings.Replace(contentStr, "东方财富网", "", -1)
	contentStr = strings.Replace(contentStr, "medium", "", -1)
	contentStr = strings.Replace(contentStr, "主力资金加仓名单实时更新，APP内免费看>>", "", -1)

	newFilename = newFilename + " -- 知识铺"
	fmt.Println("newFilename:" + newFilename)

	// 计算新的时间
	newTime := startTime.Add(time.Duration(i) * time.Minute)
	// 格式化时间字符串
	timeStr := newTime.Format("2006-01-02 15:04:05")

	i = i + 1
	fmt.Println("newTime:" + timeStr)

	// tag
	// tags := ExtractTags(filePath)
	// tagstr := ""
	// if tags != nil {
	// 	tagstr = strings.Join(tags, ",")
	// 	fmt.Println("tag:" + tagstr)
	// }
	result, err := getKeysDify(contentStr)

	if err != nil {
		result, err = getKeysDify(contentStr)
		if err != nil {
			result, err = getKeysDify(contentStr)
			if err != nil {
				result, err = getKeysDify(contentStr)
				if err != nil {
					result, err = getKeysDify(contentStr)
				}
			}
		}
	}
	tagstr := result.Tags
	title := result.Title + " -- 知识铺"

	title = strings.Replace(title, ":", "", -1)

	author := "知识铺"

	str := fmt.Sprintf("---\ntitle: %s\nauthor: %s\ndate: %s\ntags: [%s] \n---\n", title, author, timeStr, tagstr)
	fmt.Println(str)

	contentStr = str + contentStr

	// 将更改写回文件
	err = ioutil.WriteFile(filePath, []byte(contentStr), os.ModePerm)
	if err != nil {
		return "", err
	}
	if len(result.Title) <= 0 {
		return fileName + "--知识铺", nil
	}

	return result.Title + "--知识铺", nil
}

// PicGoUploadResponse 定义了PicGo上传接口返回的JSON结构
type PicGoUploadResponse struct {
	Success bool     `json:"success"`
	Result  []string `json:"result"` // 假设返回的是一个URL列表
}

// 分割路径
func splitPath(path string) (string, string) {
	// 查找最后一个"/"的位置
	index := strings.LastIndex(path, "../")
	if index == -1 {
		return "", path
	}

	// 返回父级目录和文件目录
	return path[:index] + "../", path[index+2:]
}

// PicGoUploadLocal 上传图片到PicGo并返回新的URL
func PicGoUploadLocal(imagePathparm, currentDir string) (string, error) {

	// 获取父级目录和文件目录
	_, imagePath := splitPath(imagePathparm)
	if !strings.HasPrefix(imagePath, "/") {
		imagePath = "/" + imagePath
	}

	currentDir = currentDir + imagePath

	// 读取文件
	fmt.Println("currentDirFile:" + currentDir)

	// 构造请求体
	requestBody, err := json.Marshal(map[string][]string{
		"list": {currentDir},
	})
	if err != nil {
		return "", err
	}

	// 发送POST请求到PicGo上传接口
	picGoURL := "http://127.0.0.1:36677/upload" // PicGo服务地址
	resp, err := http.Post(picGoURL, "application/json", bytes.NewBuffer(requestBody))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// 读取并解析响应
	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var uploadResp PicGoUploadResponse
	err = json.Unmarshal(respBody, &uploadResp)
	if err != nil {
		return "", err
	}

	if !uploadResp.Success || len(uploadResp.Result) == 0 {
		return "", fmt.Errorf("upload failed: %s", uploadResp.Result)
	}

	return uploadResp.Result[0], nil
}

// PicGoUpload 上传图片到PicGo并返回新的URL
func PicGoUpload(imagePath string) (string, error) {
	// 构造请求体
	requestBody, err := json.Marshal(map[string][]string{
		"list": {imagePath},
	})
	if err != nil {
		return "", err
	}

	// 发送POST请求到PicGo上传接口
	picGoURL := "http://127.0.0.1:36677/upload" // PicGo服务地址
	resp, err := http.Post(picGoURL, "application/json", bytes.NewBuffer(requestBody))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// 读取并解析响应
	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var uploadResp PicGoUploadResponse
	err = json.Unmarshal(respBody, &uploadResp)
	if err != nil {
		return "", err
	}

	if !uploadResp.Success || len(uploadResp.Result) == 0 {
		return "", fmt.Errorf("upload failed: %s", uploadResp.Result)
	}

	return uploadResp.Result[0], nil
}

// walkMarkdownFiles 遍历目录及其子目录寻找Markdown文件
func walkMarkdownFiles(rootPath string) error {
	return filepath.Walk(rootPath, func(path string, info fs.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && strings.HasSuffix(info.Name(), ".md") {
			//fmt.Printf("Processing file: %s\n", path)

			title, _ := AddTitle(path)
			fmt.Println(title)
			ReplaceImageURLsMd(path)
			ReplaceImageURLs(path)
			replaceFileName(path, title)
			return nil
		}
		return nil
	})
}
func getRelativePath(base, path string) string {
	// 将路径转换为绝对路径
	absPath, err := filepath.Abs(path)
	if err != nil {
		return ""
	}

	// 将基目录转换为绝对路径
	baseAbsPath, err := filepath.Abs(base)
	if err != nil {
		return ""
	}

	// 判断是否在基目录下
	if !strings.HasPrefix(absPath, baseAbsPath) {
		return ""
	}

	// 计算相对路径
	relPath := strings.TrimPrefix(absPath, baseAbsPath)

	return relPath
}

func watchDir() {
	// 创建一个新的 fsnotify 实例
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		fmt.Println(err)
		return
	}
	defer watcher.Close()

	// 添加当前目录
	err = watcher.Add(".")
	if err != nil {
		fmt.Println(err)
		return
	}

	// 递归遍历当前目录及子目录
	err = filepath.Walk(".", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			// 添加目录
			err = watcher.Add(path)
			if err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		fmt.Println(err)
		return
	}

	// 监听新增文件
	go func() {
		for {
			event := <-watcher.Events
			// 检查事件类型
			if event.Op&fsnotify.Create == fsnotify.Create {
				// 判断是否是目录
				if info, err := os.Lstat(event.Name); err == nil && info.IsDir() {
					// 添加新增目录
					err = watcher.Add(event.Name)
					// 打印相对路径
					fmt.Println("New file dir:", event.Name)
					if err != nil {
						fmt.Println(err)
					}
				}
			}
			// 检查事件类型和文件名
			if event.Op&fsnotify.Create == fsnotify.Create && filepath.Ext(event.Name) == ".md" {
				// 获取相对路径
				//relPath := getRelativePath(dir, event.Name)
				go func() {
					relPath := event.Name
					// 打印相对路径
					fmt.Println("New file:", relPath)

					title, _ := AddTitle(relPath)
					fmt.Println(title)

					ReplaceImageURLsMd(relPath)
					ReplaceImageURLs(relPath)
					replaceFileName(relPath, title)
				}()
			}
		}
	}()

	// 等待事件
	select {}
}

func InitTime() bool {
	// 获取当前时间
	now := time.Now()

	// 计算前一天的时间
	yesterday := now.AddDate(0, 0, -1)

	// 格式化时间输出
	fmt.Println("Yesterday at this time was:", yesterday.Format("2006-01-02 15:04:05"))

	// 解析开始时间
	var err error
	startTime, err = time.Parse("2006-01-02 15:04:05", yesterday.Format("2006-01-02 15:04:05"))
	if err != nil {
		fmt.Println("Error parsing start time:", err)
		return true
	}
	return false
}

func splitword() {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	defer watcher.Close()

	done := make(chan bool)
	go func() {
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				if event.Op&fsnotify.Write == fsnotify.Write {
					fmt.Println("Modified file:", event.Name)
					updateSensitiveWords(event.Name)
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				fmt.Println("Error:", err)
			}
		}
	}()

	err = watcher.Add("sensitive_words.js")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	// Initialize sensitive words list
	updateSensitiveWords("sensitive_words.js")

	// Your application logic here
	input := "This is a sample string with 1 and 2 ."
	filteredInput := filterSensitiveWords(input)
	fmt.Println("Filtered input:", filteredInput)

	<-done
}
func updateSensitiveWords(filename string) {
	file, err := os.Open(filename)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	defer file.Close()

	// Create a map to store the sensitive words
	newSensitiveWords := make(map[string]bool)

	// Read lines from the file
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		word := strings.TrimSpace(line)
		if word != "" {
			newSensitiveWords[word] = true
		}
	}

	// Use a lock to synchronize access to the sensitive words list
	mutex.Lock()
	sensitiveWords = newSensitiveWords
	mutex.Unlock()
}

var mutex sync.Mutex
var sensitiveWords map[string]bool

func filterSensitiveWords(input string) string {
	// Use a lock to synchronize access to the sensitive words list
	mutex.Lock()
	defer mutex.Unlock()

	// Filter sensitive words in the input string
	words := strings.Fields(input)
	filteredWords := make([]string, 0)
	for _, word := range words {
		if !sensitiveWords[word] {
			filteredWords = append(filteredWords, word)
		}
	}
	output := strings.Join(filteredWords, " ")

	return output
}

type SafetyRating struct {
	Category    int     `json:"Category"`
	Probability float64 `json:"Probability"`
	Blocked     bool    `json:"Blocked"`
}

type Content struct {
	Parts []string `json:"Parts"`
	Role  string   `json:"Role"`
}

type Candidate struct {
	Index            int            `json:"Index"`
	Content          Content        `json:"Content"`
	FinishReason     int            `json:"FinishReason"`
	SafetyRatings    []SafetyRating `json:"SafetyRatings"`
	CitationMetadata interface{}    `json:"CitationMetadata"`
	TokenCount       int            `json:"TokenCount"`
}

type PromptFeedback struct {
	BlockReason   int            `json:"BlockReason"`
	SafetyRatings []SafetyRating `json:"SafetyRatings"`
}

type Response struct {
	Candidates     []Candidate    `json:"Candidates"`
	PromptFeedback PromptFeedback `json:"PromptFeedback"`
}

type DifyMessage struct {
	Inputs         map[string]interface{} `json:"inputs,omitempty"`
	Query          string                 `json:"query"`
	ResponseMode   string                 `json:"response_mode"`
	ConversationID string                 `json:"conversation_id,omitempty"`
	User           string                 `json:"user"`
}

type DifyResponse struct {
	Event          string                 `json:"event"`
	TaskID         string                 `json:"task_id"`
	ID             string                 `json:"id"`
	MessageID      string                 `json:"message_id"`
	Mode           string                 `json:"mode"`
	Answer         string                 `json:"answer"`
	Metadata       map[string]interface{} `json:"metadata"`
	CreatedAt      int64                  `json:"created_at"`
	ConversationID string                 `json:"conversation_id"`
}

type DifyResult struct {
	Title string `json:"title"`
	Tags  string `json:"tags"`
}

func getKeysDify(content string) (DifyResult, error) {

	// Replace {api_key} with your actual Dify API key
	//apiKey := "app-5FeFjDWTuofa5buu9uDMGVmW"
	apiKey := "app-08C4Xr3Oy4UfLd6Kq8nmVb39"

	var result DifyResult

	message := DifyMessage{
		Inputs: map[string]interface{}{
			"": "",
		},
		Query: content + "  请总结标题并提取5个关键词，输出json格式，如：{\"title\":\"标题\",\"tags\":\"云服务, 金融科技, AI技术, 企业服务, 稳步增长\"}，结果只能有json结构，不需要多出任意其他字符，导致提供给外部的json结构校验失败。" +
			"无论何时都不能出现下面这种代码块标识符： ```json  和 ``` ,结果只保留最纯粹的json结构。 ", //请提取5个关键词，返回逗号拼接的字符串
		ResponseMode: "blocking",
		User:         "Sunny",
	}

	jsonData, err := json.Marshal(message)
	if err != nil {
		fmt.Println("Error marshalling JSON:", err)
		return result, err
	}

	//req, err := http.NewRequest("POST", "https://api.dify.ai/v1/chat-messages", bytes.NewBuffer(jsonData))
	req, err := http.NewRequest("POST", "http://122.225.207.105:8188/v1/chat-messages", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error creating request:", err)
		return result, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error sending request:", err)
		return result, err
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return result, err
	}

	msg := string(body)
	msg = strings.Replace(msg, "```json", "", -1)
	msg = strings.Replace(msg, "```", "", -1)
	// Parse the JSON response
	var response DifyResponse
	err2 := json.Unmarshal([]byte(msg), &response)
	if err2 != nil {
		fmt.Println("Error parsing JSON:", err2)
		return result, err2
	}

	// Print only the answer
	fmt.Println("Answer:", response.Answer)

	err3 := json.Unmarshal([]byte(response.Answer), &result)
	if err3 != nil {
		fmt.Println("Error parsing JSON:", err3)
		return result, err3
	}

	// Print only the answer
	fmt.Println("title:", result.Title)
	fmt.Println("tags:", result.Tags)

	return result, nil
}
func getKeys(content string) string {
	ctx := context.Background()
	// Access your API key as an environment variable (see "Set up your API key" above)
	client, err := genai.NewClient(ctx, option.WithAPIKey("AIzaSyDmmRKrKGWVO_QNrK_Jmar08z5Uy8m3qjo"))
	if err != nil {
		log.Fatal(err)
		return ""
	}
	defer client.Close()

	// For text-only input, use the gemini-pro model
	model := client.GenerativeModel("gemini-pro")
	resp, err := model.GenerateContent(ctx, genai.Text(content+"  请提取这句话的5个关键词,输出逗号分隔字符串"))
	if err != nil {
		log.Fatal(err)
		return ""
	}
	// Check if there are any candidates in the response
	if len(resp.Candidates) == 0 {
		log.Println("No candidates found in response")
		return ""
	}

	// Check if the content of the first candidate is empty
	if resp.Candidates[0].Content == nil {
		log.Println("Content of first candidate is empty")
		return ""
	}

	// Check if the content of the first candidate is empty
	if resp.Candidates[0].Content.Parts == nil {
		log.Println("Content of first candidate parts is empty")
		return ""
	}

	fmt.Printf("Response: %+v\n", resp)
	msg := fmt.Sprintf("%+v\n", resp.Candidates[0].Content.Parts)
	return msg
}
func main() {
	if InitTime() {
		return
	}

	walkMarkdownFiles(".")

	watchDir()

}
