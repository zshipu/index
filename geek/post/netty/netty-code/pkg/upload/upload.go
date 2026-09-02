package upload

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"md2article/pkg/utils"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// FileUploadObj defines the file upload response object structure
type FileUploadObj struct {
	Asc        string `json:"asc"`
	CreatedAt  int64  `json:"createdAt"`
	Creator    string `json:"creator"`
	DeleteFlag int    `json:"deleteFlag"`
	FilePath   string `json:"filePath"`
	ID         int    `json:"id"`
	Modifier   string `json:"modifier"`
	Offset     int    `json:"offset"`
	Order      string `json:"order"`
	Page       int    `json:"page"`
	PageSize   int    `json:"pageSize"`
	UpdatedAt  int64  `json:"updatedAt"`
}

// FileUploadResponse defines the complete response structure
type FileUploadResponse struct {
	Body struct {
		Obj FileUploadObj `json:"obj"`
	} `json:"body"`
	RespHead struct {
		RespCode string `json:"respCode"`
		RespMsg  string `json:"respMsg"`
	} `json:"respHead"`
}

// PicGoUploadResponse defines the PicGo upload API response JSON structure
type PicGoUploadResponse struct {
	Success bool     `json:"success"`
	Message string   `json:"message"`
	Result  []string `json:"result"`
}

// IsUploadedURL checks if the URL is already an uploaded URL
func IsUploadedURL(url string) bool {
	// Add your domain patterns here
	uploadedPatterns := []string{
		"995120",
		"jsdelivr",
		// Add other patterns that indicate an already uploaded URL
	}

	for _, pattern := range uploadedPatterns {
		if strings.Contains(url, pattern) {
			return true
		}
	}
	return false
}

// UploadFile uploads a file to the specified API and returns the file path
func UploadFile(filePath string) (string, error) {
	log.Printf("[DEBUG] Starting file upload for: %s", filePath)

	// Check if URL is already processed
	if IsUploadedURL(filePath) {
		log.Printf("[DEBUG] URL already processed, skipping: %s", filePath)
		return filePath, nil
	}

	var file *os.File
	var err error
	tempFile := ""

	// Check if filePath is a URL
	if strings.HasPrefix(filePath, "http://") || strings.HasPrefix(filePath, "https://") {
		log.Printf("[DEBUG] Detected URL, downloading content")
		data, err := utils.FetchURL(filePath)
		if err != nil {
			return "", fmt.Errorf("error downloading from URL: %v", err)
		}

		// Create temporary file with original extension
		ext := utils.GetImageExtension(filePath)
		log.Println(ext)
		tempFile = filepath.Join(os.TempDir(), utils.GenFileName()) + "." + ext
		log.Println(tempFile)
		if err := os.WriteFile(tempFile, data, 0644); err != nil {
			return "", fmt.Errorf("error writing temporary file: %v", err)
		}
		log.Printf("[DEBUG] Created temporary file: %s", tempFile)

		filePath = tempFile
		file, err = os.Open(tempFile)
	} else {
		file, err = os.Open(filePath)
	}

	if err != nil {
		log.Printf("[DEBUG] Error opening file: %v", err)
		return "", fmt.Errorf("error opening file: %v", err)
	}
	defer func() {
		file.Close()
		// Clean up temporary file if it exists
		if tempFile != "" {
			log.Printf("[DEBUG] Cleaning up temporary file: %s", tempFile)
			os.Remove(tempFile)
		}
	}()

	// Get file info for logging
	fileInfo, err := file.Stat()
	if err == nil {
		log.Printf("[DEBUG] File size: %d bytes", fileInfo.Size())
	}

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	log.Printf("[DEBUG] Creating multipart form")
	part, err := writer.CreateFormFile("file", filepath.Base(filePath))
	if err != nil {
		log.Printf("[DEBUG] Error creating form file: %v", err)
		return "", fmt.Errorf("error creating form file: %v", err)
	}

	log.Printf("[DEBUG] Copying file content to form")
	if _, err = io.Copy(part, file); err != nil {
		log.Printf("[DEBUG] Error copying file content: %v", err)
		return "", fmt.Errorf("error copying file content: %v", err)
	}

	if err = writer.Close(); err != nil {
		log.Printf("[DEBUG] Error closing writer: %v", err)
		return "", fmt.Errorf("error closing writer: %v", err)
	}

	log.Printf("[DEBUG] Creating HTTP request to upload endpoint")
	req, err := http.NewRequest("POST", "https://api.995120.cn/file/upload/", body)
	if err != nil {
		log.Printf("[DEBUG] Error creating request: %v", err)
		return "", fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())
	log.Printf("[DEBUG] Content-Type: %s", writer.FormDataContentType())

	client := &http.Client{}
	log.Printf("[DEBUG] Sending upload request")
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[DEBUG] Error sending request: %v", err)
		return "", fmt.Errorf("error sending request: %v", err)
	}
	defer resp.Body.Close()

	log.Printf("[DEBUG] Received response with status: %s", resp.Status)
	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("[DEBUG] Error reading response: %v", err)
		return "", fmt.Errorf("error reading response: %v", err)
	}
	log.Printf("[DEBUG] Response body size: %d bytes", len(respBody))

	var uploadResp FileUploadResponse
	if err = json.Unmarshal(respBody, &uploadResp); err != nil {
		log.Printf("[DEBUG] Error parsing response: %v", err)
		log.Printf("[DEBUG] Raw response: %s", string(respBody))
		return "", fmt.Errorf("error parsing response: %v", err)
	}

	if uploadResp.RespHead.RespCode != "000" {
		log.Printf("[DEBUG] Upload failed with code %s: %s",
			uploadResp.RespHead.RespCode,
			uploadResp.RespHead.RespMsg)
		return "", fmt.Errorf("upload failed: %s", uploadResp.RespHead.RespMsg)
	}

	log.Printf("[DEBUG] Upload successful, file path: %s", uploadResp.Body.Obj.FilePath)
	return uploadResp.Body.Obj.FilePath, nil
}
