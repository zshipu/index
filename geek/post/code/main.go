package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/fs"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
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
	tagArr = append(tagArr, dirs[len(dirs)-2])
	return tagArr
}

func AddTitle(filePath string) error {

	// 读取Markdown文件
	content, err := ioutil.ReadFile(filePath)
	if err != nil {
		return err
	}

	contentStr := string(content)

	// 获取父级目录和文件目录
	_, fileName := splitName(filePath)
	newFilename := strings.TrimSuffix(fileName, ".md")

	fmt.Println("fileName:" + newFilename)

	// 计算新的时间
	newTime := startTime.Add(time.Duration(i) * time.Minute)
	// 格式化时间字符串
	timeStr := newTime.Format("2006-01-02 15:04:05")

	i = i + 1
	fmt.Println("newTime:" + timeStr)

	// tag
	tags := ExtractTags(filePath)
	tagstr := strings.Join(tags, ",")
	fmt.Println("tag:" + tagstr)

	author := "知识铺"

	str := fmt.Sprintf("---\ntitle: %s\nauthor: %s\ndate: %s\ntags: [%s] \n---\n", newFilename, author, timeStr, tagstr)
	fmt.Println(str)

	contentStr = str + contentStr
	// 将更改写回文件
	err = ioutil.WriteFile(filePath, []byte(contentStr), os.ModePerm)
	if err != nil {
		return err
	}

	return nil
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

			AddTitle(path)
			ReplaceImageURLsMd(path)
			return ReplaceImageURLs(path)
		}
		return nil
	})
}

func main() {
	// 解析开始时间
	var err error
	startTime, err = time.Parse("2006-01-02 15:04:05", "2024-03-06 10:30:00")
	if err != nil {
		fmt.Println("Error parsing start time:", err)
		return
	}

	walkMarkdownFiles(".")
}
