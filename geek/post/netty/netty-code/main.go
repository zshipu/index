package main

import (
	"bufio"
	"bytes"
	"context"
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"io/ioutil"
	"log"
	"md2article/pkg/upload"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"

	"github.com/fsnotify/fsnotify"
)

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
		if strings.Contains(oldURL, "jsdelivr") || strings.Contains(oldURL, "995120") || strings.Contains(oldURL, "zshipu") {
			continue
		}
		newURL, err := upload.UploadFile(oldURL)
		if err != nil {
			// 再试一次
			newURL, err = upload.UploadFile(oldURL)
			if err != nil {
				log.Println("second download error :" + oldURL)
				continue
			}

		}

		log.Println("oldURL:" + oldURL + " \t" + "newURL:" + newURL)
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

	_, err := os.Getwd()
	if err != nil {
		log.Println(err)
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
		if strings.Contains(oldURL, "jsdelivr") || strings.Contains(oldURL, "995120") || strings.Contains(oldURL, "zshipu") {
			continue
		}

		newURL, err := upload.UploadFile(oldURL) // 上传图片并获取新的URL
		if err != nil {

			// 重试一次
			newURL, err = upload.UploadFile(oldURL) // 上传图片并获取新的URL
			if err != nil {
				log.Println("second download error :" + oldURL)
				continue
			}

		}
		log.Println("oldURL:" + oldURL + " \t" + "newURL:" + newURL)

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
	log.Println("filePath:" + filePath + " newFileName:" + newFileName + "-")
	if strings.Contains(filePath, "--知识铺") {
		return
	}

	if newFileName == "" || len(newFileName) <= 0 {

		// 打开文件
		file, err := os.Open(filePath)
		if err != nil {
			log.Println("Error opening file:", err)
			return
		}

		// 创建新的 bufio.Scanner
		scanner := bufio.NewScanner(file)

		// 扫描第一行
		scanner.Scan()
		scanner.Scan()

		// 读取第二行
		text := scanner.Text()

		log.Println("1:" + text)
		text = strings.Replace(text, "title: ", "", -1)
		text = strings.Replace(text, ":", "", -1)
		log.Println("2:" + text)
		newFileName = text

		file.Close()
	}

	if newFileName == "" || len(newFileName) <= 0 || newFileName == "--知识铺" {
		log.Println("newFileName:" + newFileName)
		return
	}
	// 获取原文件目录
	//dir := path.Dir(filePath)
	// 获取文件所在的目录
	dir := filepath.Dir(filePath)

	// 新文件名加上后缀
	newFilePath := path.Join(dir, newFileName+".md")
	newFilePath = strings.Replace(newFilePath, ":", "", -1)

	log.Println("filePath:" + filePath)
	log.Println("newFilePath:" + newFilePath)

	// 读取文件内容
	data, err := ioutil.ReadFile(filePath)
	if err != nil {
		log.Println("Error reading file:", err)
		return
	}

	contentStr := string(data)
	// 过滤a标签，添加前缀 http://zshipu.com/t/index.html?url=
	contentStr = replaceAurl(contentStr)
	data = []byte(contentStr)

	// 写入文件
	err = ioutil.WriteFile(newFilePath, data, 0644)
	if err != nil {
		log.Println("Error writing file:", err)
		return
	}

	// 上传文件到REST API
	file, err := os.Open(newFilePath)
	if err != nil {
		log.Println("Error opening file for upload:", err)
		return
	}
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("file", filepath.Base(newFilePath))
	if err != nil {
		log.Println("Error creating form file:", err)
		return
	}
	_, err = io.Copy(part, file)
	if err != nil {
		log.Println("Error copying file to form:", err)
		return
	}
	writer.Close()

	// 发送POST请求到上传API
	req, err := http.NewRequest("POST", "http://192.168.9.136:8080/upload", body)
	if err != nil {
		log.Println("Error creating request:", err)
		return
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Error sending request:", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Upload failed with status: %d\n", resp.StatusCode)
		return
	}

	log.Println("File uploaded successfully to REST API")

	// 删除原文件
	err = os.Remove(filePath)
	if err != nil {
		log.Println("Error deleting file:", err)
		return
	}

	log.Println("File renamed successfully!")
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
		"00\x00\x01\x00":                   ".ico",  // ICO
		"00\x00\x02\x00":                   ".cur",  // CUR
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
		log.Println("Not an image format.")
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

		if strings.Contains(url, "jsdelivr") || strings.Contains(url, "995120") || strings.Contains(url, "zshipu") {
			return fmt.Sprintf("[%s](%s)", text, url)
		}
		log.Println("img url:" + url)
		// 图片不进行替换
		if isImageExtension(url) {
			log.Println("img url:" + url)
			// 返回替换后的字符串
			return fmt.Sprintf("[%s](%s)", text, url)
		}
		if strings.Contains(url, "cdn.jsdelivr.net") {
			log.Println("local img url:" + url)
			// 返回替换后的字符串
			return fmt.Sprintf("[%s](%s)", text, url)
		}

		// 替换 URL
		url = newURL + url
		log.Println("a newURL:" + url)
		// 返回替换后的字符串
		return fmt.Sprintf("[%s](%s)", text, url)
	})

	// 打印替换后的 Markdown 文档
	//log.Println(newMarkdown)
	if len(newMarkdown) <= 0 {
		return markdown
	}
	return newMarkdown
}

// 正则表达式匹配Markdown中的代码块
var codeBlockRegex = regexp.MustCompile("(?s)(```.+?```)")

// 正则表达式匹配HTML代码
var htmlCodeRegex = regexp.MustCompile(`<[^>]+>`)

// 将HTML标签转换为Markdown格式
func convertHTMLToMarkdown(html string) string {
	// 这里只是一个示例，实际转换可能需要更复杂的逻辑
	// 例如，将 <b> 转换为 **，将 <i> 转换为 * 等
	html = strings.Replace(html, "<b>", "**", -1)
	html = strings.Replace(html, "</b>", "**", -1)
	html = strings.Replace(html, "<i>", "*", -1)
	html = strings.Replace(html, "</i>", "*", -1)

	// 将<br>标签替换为Markdown的换行格式（两个空格加回车）
	html = strings.Replace(html, "<br>", "  \n", -1)
	html = strings.Replace(html, "<span>", "", -1)
	html = strings.Replace(html, "</span>", "", -1)
	html = strings.Replace(html, "<code>", "", -1)
	html = strings.Replace(html, "</code>", "", -1)
	html = strings.Replace(html, "&nbsp;", " ", -1)
	return html
}

// 替换HTML代码块为Markdown格式
func replaceCodeHTML(content string) string {
	// 使用正则表达式查找所有代码块
	matches := codeBlockRegex.FindAllStringSubmatch(content, -1)
	for _, match := range matches {
		code := match[1] // 这里的match[1]是捕获组的内容，即代码块
		// 去除最外层的```，因为FindStringSubmatch包含了整个匹配项
		innerCode := code[3 : len(code)-3]
		if htmlCodeRegex.MatchString(innerCode) {
			// 如果是HTML代码，转换为Markdown
			code = convertHTMLToMarkdown(innerCode)
			// 替换原始内容中的代码块为转换后的Markdown代码块
			content = strings.Replace(content, match[0], fmt.Sprintf("```%s```", code), 1)
		}
	}
	return content
}

func AddTitle(filePath string) (string, error) {

	log.Println("filePath:" + filePath)
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

	newFilename = newFilename + " --知识铺"
	log.Println("newFilename:" + newFilename)

	// 计算新的时间
	newTime := startTime.Add(time.Duration(i) * time.Minute)
	// 格式化时间字符串
	timeStr := newTime.Format("2006-01-02 15:04:05")

	i = i + 1
	log.Println("newTime:" + timeStr)

	// result, err := getKeysOpenRouter(newFilename)

	// if err != nil {
	// 	result, err = getKeysOpenRouter(newFilename)
	// 	if err != nil {
	// 		result, err = getKeysOpenRouter(newFilename)
	// 		if err != nil {
	// 			result, err = getKeysOpenRouter(newFilename)
	// 			if err != nil {
	// 				result, err = getKeysOpenRouter(newFilename)
	// 			}
	// 		}
	// 	}
	// }
	// tagstr := result.Tags
	// title := result.Title + " --  知识铺"

	tagstr := ""
	title := newFilename

	title = strings.Replace(title, ":", "", -1)

	author := "知识铺"

	str := fmt.Sprintf("---\ntitle: %s\ndescription: %s\ndate: %s\ncategory:\n  - %s\ntag:\n%s\n---\n",
		title,
		title,
		timeStr,
		author,
		formatTags(tagstr))
	log.Println(str)

	//contentStrC, err := getContentDify(contentStr)
	//if err == nil {
	//	contentStr = str + contentStrC
	//} else {
	//	contentStr = str + contentStr
	//}

	contentStr = str + contentStr

	// 替换带代码片段中的html
	contentStr = replaceCodeHTML(contentStr)
	// 将更改写回文件
	err = ioutil.WriteFile(filePath, []byte(contentStr), os.ModePerm)
	if err != nil {
		return fileName, err
	}

	return fileName, nil
}

func formatTags(tags string) string {
	tagsArr := strings.Split(tags, ",")
	var tagsStr string
	for _, tag := range tagsArr {
		tagsStr += "- " + tag + "\n"
	}
	return tagsStr
}

// PicGoUploadResponse 定义了PicGo上传接口返回的JSON结构
type PicGoUploadResponse struct {
	Success bool     `json:"success"`
	Message string   `json:"message"`
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

func PicGoUploadLocal(imagePathparm, currentDir string) (string, error) {

	// 获取父级目录和文件目录
	_, imagePath := splitPath(imagePathparm)
	if !strings.HasPrefix(imagePath, "/") {
		imagePath = "/" + imagePath
	}

	currentDir = currentDir + imagePath

	// 读取文件
	log.Println("currentDirFile:" + currentDir)

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
		return "", fmt.Errorf("upload failed: %s", uploadResp.Message)
	}

	return uploadResp.Result[0], nil
}

func extractUrl(s string) string {
	index := strings.Index(s, " ")
	if index <= 0 {
		return s
	}
	return s[:index]
}
func genFileName() string {
	// 生成12字节的随机数
	b := make([]byte, 12)
	_, err := io.ReadFull(rand.Reader, b)
	if err != nil {
		panic(err)
	}

	// 将随机字节转换为十进制字符串
	randomString := fmt.Sprintf("%x", b)
	return randomString
}

var imageSignatures = map[string][]byte{
	"png":  {137, 'P', 'N', 'G', '\r', '\n', 26, 10}, // PNG图像
	"jpg":  {255, 216},                               // JPEG图像 (SOI)
	"jpeg": {255, 216},                               // JPEG图像 (SOI)
	"gif":  {71, 'A', 'S', 'B'},                      // GIF图像
	"bmp":  {66, 77},                                 // BMP图像
	"tiff": {73, 73, 42},                             // TIFF图像 (II*)
	"webp": {255, 'W', 'E', 'B', 'P'},                // WebP图像
	"ico":  {0, 0, 1, 0},                             // ICO图像
	"psd":  {80, 83, 71, 68},                         // Photoshop (PSD)图像
	"svg":  {65, 118, 103, 83, 84, 82, 65, 86},       // SVG图像
	// 其他格式可以根据需要添加
}

// bytesMatch 检查两个字节切片是否匹配
func bytesMatch(b1, b2 []byte) bool {
	// 将字节切片转换为十六进制字符串
	for i := range b2 {
		if b1[i] != b2[i] {
			return false
		}
	}
	return true
}

// getExtension 尝试从URL或文件中获取图片的后缀名
func getExtension(urlOrPath string) (string, error) {
	u, err := url.Parse(urlOrPath)
	if err == nil {
		// 检查域名是否为 qpic.cn
		if strings.Contains(urlOrPath, "qpic.cn") {
			// 尝试从查询参数中获取 wx_fmt 作为后缀名
			wxFmt := u.Query().Get("wx_fmt")
			log.Println(wxFmt)
			if wxFmt != "" {
				return wxFmt, nil
			}
		}

		// 如果不是 qpic.cn 或 wx_fmt 不存在，尝试从URL路径中获取后缀名
		ext := strings.TrimPrefix(filepath.Ext(u.Path), ".")
		if ext != "" {
			return ext, nil
		}
	}
	// 如果URL中没有后缀名或解析失败，尝试通过读取文件头部字节来确定格式
	resp, err := http.Get(urlOrPath)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// 读取文件头部字节
	buffer := make([]byte, 8)
	reader := bufio.NewReader(resp.Body)
	_, err = reader.Read(buffer)
	if err != nil {
		return "", err
	}

	// 匹配签名
	for ext, signature := range imageSignatures {
		log.Println(ext)
		if bytesMatch(buffer, signature) {
			log.Println("结果：" + ext)
			return ext, nil
		}
	}

	return "", fmt.Errorf("unable to determine the file extension")
}

func PicGoUpload(imgURL string) (string, error) {

	fileFormat, err := getExtension(imgURL)
	if err != nil {
		log.Println(" get extension err", err)
	}
	// 构造文件名
	fileName := "downloadedImage" + genFileName() + "." + fileFormat
	filePath := filepath.Join(".", fileName)

	// 下载图片并保存到当前目录
	resp, err := http.Get(imgURL)
	if err != nil {
		log.Println("Error downloading image: ", err)
		return "", err
	}
	defer resp.Body.Close()

	out, err := os.Create(filePath)
	if err != nil {
		log.Println("Error creating file: ", err)
		return "", err
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	if err != nil {
		log.Println("Error writing image to file: ", err)
		return "", err
	}

	out.Close()

	// 获取当前工作目录
	dir, err := os.Getwd()

	imgpath, err := PicGoUploadUp(dir + "/" + filePath)
	if err != nil {
		log.Println("upload err : ", err)
		return "", err
	}
	// 清理本地文件
	err = os.Remove(filePath)
	if err != nil {
		log.Println("Error removing file: ", err)
		return "", err
	}

	log.Println("Local file cleaned up.")

	return imgpath, nil
}

// PicGoUpload 上传图片到PicGo并返回新的URL
func PicGoUploadUp(imagePath string) (string, error) {
	if len(imagePath) > 0 {
		imagePath = extractUrl(imagePath)
	}
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
		return "", fmt.Errorf("upload failed: %s", uploadResp.Message)
	}

	return uploadResp.Result[0], nil
}

func walkMarkdownFiles(rootPath string) error {
	log.Println("walkMarkdownFiles")

	return filepath.Walk(rootPath, func(path string, info fs.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && strings.HasSuffix(info.Name(), ".md") {
			//fmt.Printf("Processing file: %s\n", path)

			ReplaceImageURLsMd(path)
			ReplaceImageURLs(path)

			title, _ := AddTitle(path)
			log.Println(title)

			//replaceFileName(path, title)
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
		log.Println(err)
		return
	}
	defer watcher.Close()

	// 添加当前目录
	err = watcher.Add(".")
	if err != nil {
		log.Println(err)
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
		log.Println(err)
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
					log.Println("New file dir:", event.Name)
					if err != nil {
						log.Println(err)
					}
				}
			}
			// 检查事件类型和文件名
			if event.Op&fsnotify.Create == fsnotify.Create && filepath.Ext(event.Name) == ".md" && strings.Index(event.Name, ".~") != 0 {
				// 获取相对路径
				//relPath := getRelativePath(dir, event.Name)
				//go func() {
				relPath := event.Name
				// 打印相对路径
				log.Println("New file:", relPath)

				title, _ := AddTitle(relPath)
				log.Println(title)

				ReplaceImageURLsMd(relPath)
				ReplaceImageURLs(relPath)
				//replaceFileName(relPath, title)
				//}()
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
	//yesterday := now.AddDate(0, 0, 0)
	yesterday := now.Add(-time.Duration(8) * time.Hour)

	// 格式化时间输出
	log.Println("Yesterday at this time was:", yesterday.Format("2006-01-02 15:04:05"))

	// 解析开始时间
	var err error
	startTime, err = time.Parse("2006-01-02 15:04:05", yesterday.Format("2006-01-02 15:04:05"))
	if err != nil {
		log.Println("Error parsing start time:", err)
		return true
	}
	return false
}

func splitword() {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Println("Error:", err)
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
					log.Println("Modified file:", event.Name)
					updateSensitiveWords(event.Name)
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				log.Println("Error:", err)
			}
		}
	}()

	err = watcher.Add("sensitive_words.js")
	if err != nil {
		log.Println("Error:", err)
		return
	}

	// Initialize sensitive words list
	updateSensitiveWords("sensitive_words.js")

	// Your application logic here
	input := "This is a sample string with 1 and 2 ."
	filteredInput := filterSensitiveWords(input)
	log.Println("Filtered input:", filteredInput)

	<-done
}
func updateSensitiveWords(filename string) {
	file, err := os.Open(filename)
	if err != nil {
		log.Println("Error:", err)
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
type DifyContentResult struct {
	Content string `json:"content"`
	Tags    string `json:"tags"`
}

func extractJSON(input string) []string {
	var jsonMatches []string
	stack := make([]int, 0)

	for i, r := range input {
		if r == '{' {
			stack = append(stack, i)
		} else if r == '}' {
			if len(stack) > 0 {
				start := stack[len(stack)-1]
				stack = stack[:len(stack)-1]
				jsonMatches = append(jsonMatches, input[start:i+1])
			}
		}
	}

	return jsonMatches
}

func getKeysDify(content string) (DifyResult, error) {

	// Replace {api_key} with your actual Dify API key
	//apiKey := "app-5FeFjDWTuofa5buu9uDMGVmW"
	apiKey := "app-c5HISlVDIbEv8R20o0X8VmHj"

	var result DifyResult

	message := DifyMessage{
		Inputs: map[string]interface{}{
			"": "",
		},
		Query: content +
			"注意：请根据上面内容，做到下面操作 " +
			"1.总结标题并提取3个关键词 " +
			"2.必须是严格的JSON格式 " +
			"3.JSON格式如：{\"title\":\"标题\",\"tags\":\"云服务, 金融科技, AI技术\"} ",
		ResponseMode: "blocking",
		User:         "Sunny",
	}

	jsonData, err := json.Marshal(message)
	if err != nil {
		log.Println("Error marshalling JSON:", err)
		return result, err
	}

	//req, err := http.NewRequest("POST", "https://api.dify.ai/v1/chat-messages", bytes.NewBuffer(jsonData))
	req, err := http.NewRequest("POST", "http://122.225.207.105:8188/v1/chat-messages", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Println("Error creating request:", err)
		return result, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Error sending request:", err)
		return result, err
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println("Error reading response body:", err)
		return result, err
	}

	msg := string(body)

	// Parse the JSON response
	var response DifyResponse
	err2 := json.Unmarshal([]byte(msg), &response)
	if err2 != nil {
		log.Println("Error parsing JSON:", err2)
		return result, err2
	}

	// Print only the answer
	log.Println("Answer1:", response.Answer)

	answer := response.Answer

	answer = strings.Replace(answer, "\n", "", -1)
	answer = strings.Replace(answer, "```json", "", -1)
	answer = strings.Replace(answer, "```", "", -1)
	answer = strings.Replace(answer, " \"image.png\"", "", -1)
	answer = strings.Replace(answer, "http://", "http:##", -1)
	answer = strings.Replace(answer, "https://", "https:##", -1)

	log.Println("Answer2:", answer)

	// 提取JSON结构
	jsonMatches := extractJSON(answer)

	if len(jsonMatches) <= 0 {
		return result, errors.New("json 不完整")
	}
	answer = jsonMatches[0]

	log.Println("Answer3:", answer)

	err3 := json.Unmarshal([]byte(answer), &result)
	if err3 != nil {
		log.Println("Error parsing JSON:", err3)
		return result, err3
	}

	// Print only the answer
	log.Println("title:", result.Title)
	log.Println("tags:", result.Tags)

	return result, nil
}

// OpenRouter API Structures
type OpenRouterMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OpenRouterRequest struct {
	Model    string              `json:"model"`
	Messages []OpenRouterMessage `json:"messages"`
}

type OpenRouterChoice struct {
	Message struct {
		Content string `json:"content"`
	} `json:"message"`
}

type OpenRouterResponse struct {
	Choices []OpenRouterChoice `json:"choices"`
}

func getKeysOpenRouter(content string) (DifyResult, error) {
	// It's recommended to move the API key to a configuration file or environment variable.
	apiKey := "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" // TODO: Replace with your actual OpenRouter API key

	var result DifyResult

	requestPayload := OpenRouterRequest{
		Model: "x-ai/grok-4-fast:free", // Using the model from the user's example
		Messages: []OpenRouterMessage{
			{
				Role: "user",
				Content: content +
					"\n\n注意：请根据上面内容，做到下面操作 " +
					"\n1.总结标题并提取3个关键词 " +
					"\n2.必须是严格的JSON格式 " +
					"\n3.JSON格式如：{\"title\":\"标题\",\"tags\":\"云服务, 金融科技, AI技术\"}",
			},
		},
	}

	jsonData, err := json.Marshal(requestPayload)
	if err != nil {
		log.Println("Error marshalling OpenRouter JSON:", err)
		return result, err
	}

	req, err := http.NewRequest("POST", "https://openrouter.ai/api/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Println("Error creating OpenRouter request:", err)
		return result, err
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("HTTP-Referer", "http://zshipu.com") // Optional: Replace with your site URL
	req.Header.Set("X-Title", "zshipu-blog-gen")        // Optional: Replace with your site name

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Error sending OpenRouter request:", err)
		return result, err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println("Error reading OpenRouter response body:", err)
		return result, err
	}

	var openRouterResp OpenRouterResponse
	err = json.Unmarshal(body, &openRouterResp)
	if err != nil {
		log.Println("Error parsing OpenRouter JSON response:", err, "Body:", string(body))
		return result, err
	}

	if len(openRouterResp.Choices) == 0 {
		return result, errors.New("no choices returned from OpenRouter")
	}

	answer := openRouterResp.Choices[0].Message.Content
	log.Println("OpenRouter Answer Raw:", answer)

	answer = strings.Replace(answer, "\n", "", -1)
	answer = strings.Replace(answer, "```json", "", -1)
	answer = strings.Replace(answer, "```", "", -1)

	jsonMatches := extractJSON(answer)
	if len(jsonMatches) == 0 {
		return result, errors.New("incomplete JSON from OpenRouter")
	}

	finalJSON := jsonMatches[0]
	log.Println("OpenRouter Answer JSON:", finalJSON)

	err = json.Unmarshal([]byte(finalJSON), &result)
	if err != nil {
		log.Println("Error parsing final JSON from OpenRouter:", err)
		return result, err
	}

	log.Println("OpenRouter Title:", result.Title)
	log.Println("OpenRouter Tags:", result.Tags)

	return result, nil
}

func getContenDify(content string) (DifyContentResult, error) {

	// Replace {api_key} with your actual Dify API key
	//apiKey := "app-5FeFjDWTuofa5buu9uDMGVmW"
	apiKey := "app-08C4Xr3Oy4UfLd6Kq8nmVb39"

	var result DifyContentResult

	message := DifyMessage{
		Inputs: map[string]interface{}{
			"": "",
		},
		Query: content +
			"注意：请根据上面内容，做到下面操作 " +
			"1.根据内容重新编写内容，把新写的内容放到字段content,内容要有条理性，有结构性。内容使用markdown格式输出。content 中的 \n 换成 aaaaaaaa " +
			"2.必须是严格的JSON格式 " +
			"3.JSON格式如：{\"content\":\"内容\",\"tags\":\"固定\"} ",
		ResponseMode: "blocking",
		User:         "Sunny",
	}

	jsonData, err := json.Marshal(message)
	if err != nil {
		log.Println("Error marshalling JSON:", err)
		return result, err
	}

	log.Println("开始等待...")
	time.Sleep(10 * time.Second)
	log.Println("等待结束！")

	//req, err := http.NewRequest("POST", "https://api.dify.ai/v1/chat-messages", bytes.NewBuffer(jsonData))
	req, err := http.NewRequest("POST", "http://122.225.207.105:8188/v1/chat-messages", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Println("Error creating request:", err)
		return result, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Error sending request:", err)
		return result, err
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println("Error reading response body:", err)
		return result, err
	}

	msg := string(body)

	// Parse the JSON response
	var response DifyResponse
	err2 := json.Unmarshal([]byte(msg), &response)
	if err2 != nil {
		log.Println("Error parsing JSON:", err2)
		return result, err2
	}

	answer := response.Answer

	// 提取JSON结构
	jsonMatches := extractJSON(answer)

	if len(jsonMatches) <= 0 {
		return result, errors.New("json 不完整")
	}
	answer = jsonMatches[0]
	answer = strings.Replace(answer, "\\n\\n", "aaaaaaaa", -1)
	answer = strings.Replace(answer, "\n\n", "aaaaaaaa", -1)
	answer = strings.Replace(answer, "\n", "", -1)
	log.Println("替换前：" + answer)

	err3 := json.Unmarshal([]byte(answer), &result)
	if err3 != nil {
		log.Println("Error parsing JSON:", err3)
		return result, err3
	}
	result.Content = strings.Replace(result.Content, "aaaaaaaa", "\n", -1)
	result.Content = strings.Replace(result.Content, "- ", "\n- ", -1)

	// 定义正则表达式
	re := regexp.MustCompile(`(\d+\. \*\*)`)
	// 使用正则表达式替换
	result.Content = re.ReplaceAllString(result.Content, "\n$1")

	log.Println("替换原：" + result.Content)

	return result, nil
}
func getKeys(content string) string {
	ctx := context.Background()
	// Access your API key as an environment variable (see "Set up your API key" above)
	client, err := genai.NewClient(ctx, option.WithAPIKey("AIzaSyDmmRKrKGWVO_QNrK_Jmar08z5Uy8m3qjo"))
	if err != nil {
		log.Println(err)
		return ""
	}
	defer client.Close()

	// For text-only input, use the gemini-pro model
	model := client.GenerativeModel("gemini-pro")
	resp, err := model.GenerateContent(ctx, genai.Text(content+"  请提取这句话的5个关键词,输出逗号分隔字符串"))
	if err != nil {
		log.Println(err)
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

// content markdown 格式
func getContentDify(markdown string) (string, error) {

	sections, err := splitMarkdown(markdown)
	if err != nil {
		log.Println("Error splitting markdown:", err)
		return "", err
	}

	var sectionsResult []string
	// 打印拆分后的各部分
	for _, section := range sections {
		if strings.Index(section, "![") == 0 || strings.Index(section, "```") == 0 {
			//fmt.Printf("分隔行：%s\n", section)
			sectionsResult = append(sectionsResult, section)
		} else {
			if len(section) > 300 {
				result, err := getContenDify(section)
				if err == nil {
					//fmt.Printf("重写后: %s\n", result.Content)
					sectionsResult = append(sectionsResult, result.Content)
				} else {
					//fmt.Printf("未重写行：%s\n", section)
					sectionsResult = append(sectionsResult, section)
				}
			} else {
				//fmt.Printf("正常行：%s\n", section)
				sectionsResult = append(sectionsResult, section)
			}
		}
	}

	return strings.Join(sectionsResult, "  \n"), nil
}

func splitMarkdown(markdown string) ([]string, error) {
	// 正则表达式匹配 Markdown 中的图片资源
	imageRegex := regexp.MustCompile(`(!\[.*?\]\s*\(.*?\))`)
	// 正则表达式匹配 Markdown 中的代码块
	codeBlockRegex := regexp.MustCompile("((?:```[\\s\\S]*?```)|(?:` + \"`\" + `(?:[^` + \"`\" + `]+|` + \"`\" + `|` + \"`\" + `)*))")

	var sections []string

	// 使用图片和代码块作为分隔符拆分 Markdown
	images := imageRegex.FindAllStringIndex(markdown, -1)
	codeBlocks := codeBlockRegex.FindAllStringIndex(markdown, -1)

	// 合并分隔符数组，根据在文档中的位置排序
	var delimiters [][2]int
	for _, image := range images {
		delimiters = append(delimiters, [2]int{image[0], image[1]})
	}
	for _, codeBlock := range codeBlocks {
		delimiters = append(delimiters, [2]int{codeBlock[0], codeBlock[1]})
	}

	// 根据起始位置对分隔符进行排序
	sort.Slice(delimiters, func(i, j int) bool {
		return delimiters[i][0] < delimiters[j][0]
	})

	// 根据分隔符拆分文档
	lastIndex := 0
	for _, delimiter := range delimiters {
		if lastIndex < delimiter[0] {
			// 添加非分隔符的文本
			sections = append(sections, markdown[lastIndex:delimiter[0]])
		}
		sections = append(sections, markdown[delimiter[0]:delimiter[1]])
		lastIndex = delimiter[1]
	}
	if lastIndex < len(markdown) {
		sections = append(sections, markdown[lastIndex:])
	}

	return sections, nil
}

func main() {

	// 设置日志格式，包含日期、时间、文件名和行号
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)

	if InitTime() {
		return
	}

	walkMarkdownFiles(".")

	watchDir()

	// test
	// filepath, err := PicGoUpload("https://media.licdn.com/dms/image/D5612AQEfvCWY3MUaCA/article-inline_image-shrink_1000_1488/0/1720664999408?e=2147483647&v=beta&t=FxY6kc5aPZin7lY7_dgMnydWqNkN1IChvQEafUJqZnI")
	// log.Println(filepath)
	// log.Println(err)

	// test
	// filename := "a.md"
	// content, err := ioutil.ReadFile(filename)
	// if err != nil {
	// 	log.Println("Error reading file:", err)
	// }
	// markdown := string(content)
	// getContentDify(markdown)

}
