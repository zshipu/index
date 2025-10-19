package utils

import (
	"bufio"
	"crypto/rand"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"path"
	"path/filepath"
	"strings"
)

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

// GetImageExtension gets the file extension from a URL
func GetImageExtension(urlOrPath string) string {
	u, err := url.Parse(urlOrPath)
	if err == nil {
		// 检查域名是否为 qpic.cn
		if strings.Contains(urlOrPath, "qpic.cn") {
			// 尝试从查询参数中获取 wx_fmt 作为后缀名
			wxFmt := u.Query().Get("wx_fmt")
			log.Println(wxFmt)
			if wxFmt != "" {
				return wxFmt
			}
		}

		// 如果不是 qpic.cn 或 wx_fmt 不存在，尝试从URL路径中获取后缀名
		ext := strings.TrimPrefix(filepath.Ext(u.Path), ".")
		if ext != "" {
			return ext
		}
	}
	// 如果URL中没有后缀名或解析失败，尝试通过读取文件头部字节来确定格式
	resp, err := http.Get(urlOrPath)
	if err != nil {
		return ""
	}
	defer resp.Body.Close()

	// 读取文件头部字节
	buffer := make([]byte, 8)
	reader := bufio.NewReader(resp.Body)
	_, err = reader.Read(buffer)
	if err != nil {
		return ""
	}

	// 匹配签名
	for ext, signature := range imageSignatures {
		fmt.Println(ext)
		if bytesMatch(buffer, signature) {
			fmt.Println("结果：" + ext)
			return ext
		}
	}

	return ""
}

// FetchURL downloads content from a URL
func FetchURL(url string) ([]byte, error) {
	log.Printf("[DEBUG] Fetching content from URL: %s", url)
	resp, err := http.Get(url)
	if err != nil {
		log.Printf("[DEBUG] Error fetching URL: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("[DEBUG] Error reading response body: %v", err)
		return nil, err
	}

	log.Printf("[DEBUG] Successfully fetched %d bytes", len(data))
	return data, nil
}

// GenFileName generates a random filename
func GenFileName() string {
	log.Printf("[DEBUG] Generating random filename")
	b := make([]byte, 8)
	rand.Read(b)
	filename := fmt.Sprintf("%x", b)
	log.Printf("[DEBUG] Generated filename: %s", filename)
	return filename
}

// SplitPath splits a path into directory and filename
func SplitPath(filePath string) (string, string) {
	log.Printf("[DEBUG] Splitting path: %s", filePath)
	dir, file := path.Split(filePath)
	log.Printf("[DEBUG] Split result - dir: %s, file: %s", dir, file)
	return dir, file
}

// ExtractURL extracts URL from a string
func ExtractURL(s string) string {
	log.Printf("[DEBUG] Extracting URL from string, length: %d", len(s))
	if strings.Contains(s, "http") {
		parts := strings.Split(s, "http")
		if len(parts) > 1 {
			url := "http" + strings.Split(parts[1], " ")[0]
			log.Printf("[DEBUG] Extracted URL: %s", url)
			return url
		}
	}
	log.Printf("[DEBUG] No URL found, returning original string")
	return s
}

// GetMagicNumber gets the magic number (file signature) from data
func GetMagicNumber(data []byte) string {
	log.Printf("[DEBUG] Getting magic number from data, size: %d bytes", len(data))
	if len(data) < 8 {
		log.Printf("[DEBUG] Data too short for magic number detection")
		return ""
	}

	signatures := map[string][]byte{
		"png":  {0x89, 'P', 'N', 'G', '\r', '\n', 0x1a, '\n'},
		"jpg":  {0xFF, 0xD8},
		"jpeg": {0xFF, 0xD8},
		"gif":  {'G', 'I', 'F'},
		"bmp":  {'B', 'M'},
		"webp": {'R', 'I', 'F', 'F'},
	}

	for ext, sig := range signatures {
		if len(data) >= len(sig) && BytesMatch(data[:len(sig)], sig) {
			log.Printf("[DEBUG] Found file signature: %s", ext)
			return ext
		}
	}

	log.Printf("[DEBUG] No known file signature found")
	return ""
}

// BytesMatch checks if two byte slices match
func BytesMatch(b1, b2 []byte) bool {
	if len(b1) != len(b2) {
		return false
	}
	for i := range b1 {
		if b1[i] != b2[i] {
			return false
		}
	}
	return true
}
