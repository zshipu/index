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
			fmt.Println("filePath:" + oldURL)
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

// PicGoUploadResponse 定义了PicGo上传接口返回的JSON结构
type PicGoUploadResponse struct {
	Success bool     `json:"success"`
	Result  []string `json:"result"` // 假设返回的是一个URL列表
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
			fmt.Printf("Processing file: %s\n", path)

			ReplaceImageURLsMd(path)
			return ReplaceImageURLs(path)
		}
		return nil
	})
}

func main() {
	walkMarkdownFiles(".")
}
