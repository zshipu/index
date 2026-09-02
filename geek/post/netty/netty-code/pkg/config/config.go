package config

import (
	"encoding/json"
	"log"
	"os"
)

// Config represents the application configuration
type Config struct {
	APIEndpoint string `json:"api_endpoint"`
	APIKey      string `json:"api_key"`
	UploadURL   string `json:"upload_url"`
	WatchDir    string `json:"watch_dir"`
}

// LoadConfig loads configuration from a JSON file
func LoadConfig(filename string) (*Config, error) {
	log.Printf("[DEBUG] Loading configuration from file: %s", filename)
	file, err := os.Open(filename)
	if err != nil {
		log.Printf("[DEBUG] Error opening config file: %v", err)
		return nil, err
	}
	defer file.Close()

	config := &Config{}
	decoder := json.NewDecoder(file)
	err = decoder.Decode(config)
	if err != nil {
		log.Printf("[DEBUG] Error decoding config file: %v", err)
		return nil, err
	}

	log.Printf("[DEBUG] Successfully loaded configuration: %+v", config)
	return config, nil
}

// SaveConfig saves configuration to a JSON file
func SaveConfig(config *Config, filename string) error {
	log.Printf("[DEBUG] Saving configuration to file: %s", filename)
	file, err := os.Create(filename)
	if err != nil {
		log.Printf("[DEBUG] Error creating config file: %v", err)
		return err
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "    ")
	err = encoder.Encode(config)
	if err != nil {
		log.Printf("[DEBUG] Error encoding config: %v", err)
		return err
	}

	log.Printf("[DEBUG] Successfully saved configuration")
	return nil
}
