package content

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"
)

// SafetyRating represents content safety rating
type SafetyRating struct {
	Category    int     `json:"Category"`
	Probability float64 `json:"Probability"`
	Blocked     bool    `json:"Blocked"`
}

// Content represents message content
type Content struct {
	Parts []string `json:"Parts"`
	Role  string   `json:"Role"`
}

// DifyMessage represents a message to Dify API
type DifyMessage struct {
	Query            string                 `json:"query"`
	Inputs           map[string]interface{} `json:"inputs"`
	ResponseMode     string                 `json:"response_mode"`
	User             string                 `json:"user"`
	Files            []FileInfo             `json:"files,omitempty"`
	ConversationID   string                 `json:"conversation_id,omitempty"`
	AutoGenerateName bool                   `json:"auto_generate_name,omitempty"`
}

// FileInfo represents file information for API
type FileInfo struct {
	Type           string `json:"type"`
	TransferMethod string `json:"transfer_method"`
	URL            string `json:"url,omitempty"`
	UploadFileID   string `json:"upload_file_id,omitempty"`
}

// Message represents a chat message
type Message struct {
	Role   string `json:"role"`
	Answer string `json:"answer"`
}

// DifyResponse represents response from Dify API
type DifyResponse struct {
	Event          string `json:"event"`
	TaskID         string `json:"task_id"`
	ID             string `json:"id"`
	MessageID      string `json:"message_id"`
	ConversationID string `json:"conversation_id"`
	Mode           string `json:"mode"`
	Answer         string `json:"answer"`
}

// Usage represents token usage information
type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

// DifyResult represents processed result from Dify
type DifyResult struct {
	Title string `json:"title"`
	Tags  string `json:"tags"`
}

// DifyContentResult represents content result from Dify
type DifyContentResult struct {
	Content string `json:"content"`
	Tags    string `json:"tags"`
}

// ProcessContent processes content using Dify API
func ProcessContent(content string, apiEndpoint string, apiKey string) (*DifyContentResult, error) {
    message := DifyMessage{
        Query:            content,
        Inputs:           map[string]interface{}{},
        ResponseMode:     "blocking",
        User:             "default_user",
        AutoGenerateName: true,
    }

    jsonData, err := json.Marshal(message)
    if err != nil {
        return nil, fmt.Errorf("error marshaling request: %v", err)
    }

    req, err := http.NewRequest("POST", apiEndpoint, bytes.NewBuffer(jsonData))
    if err != nil {
        return nil, fmt.Errorf("error creating request: %v", err)
    }

    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer "+apiKey)

    client := &http.Client{
        Timeout: 30 * time.Second,
    }

    resp, err := client.Do(req)
    if err != nil {
        return nil, fmt.Errorf("error sending request: %v", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("API request failed with status %d", resp.StatusCode)
    }

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return nil, fmt.Errorf("error reading response: %v", err)
    }

    var difyResp DifyResponse
    if err := json.Unmarshal(body, &difyResp); err != nil {
        return nil, fmt.Errorf("error parsing response: %v", err)
    }

    if difyResp.Answer == "" {
        return nil, errors.New("empty response from API")
    }

    result := &DifyContentResult{
        Content: difyResp.Answer,
        Tags:    "",
    }

    return result, nil
}

// ExtractJSON extracts JSON strings from content
func ExtractJSON(input string) []string {
	log.Printf("[DEBUG] Extracting JSON from input string, length: %d", len(input))
	var results []string
	var start, bracketCount int
	var inString bool
	var escaped bool

	for i, char := range input {
		switch {
		case char == '\\' && inString:
			escaped = !escaped
		case char == '"' && !escaped:
			inString = !inString
		case char == '{' && !inString:
			if bracketCount == 0 {
				start = i
			}
			bracketCount++
		case char == '}' && !inString:
			bracketCount--
			if bracketCount == 0 {
				jsonStr := input[start : i+1]
				// Validate if it's valid JSON
				var js json.RawMessage
				if json.Unmarshal([]byte(jsonStr), &js) == nil {
					log.Printf("[DEBUG] Found valid JSON string at position %d", start)
					results = append(results, jsonStr)
				}
			}
		default:
			escaped = false
		}
	}

	log.Printf("[DEBUG] Extracted %d JSON strings from input", len(results))
	return results
}
