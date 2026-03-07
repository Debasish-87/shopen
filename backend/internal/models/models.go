package models

import "time"

// Shop represents a shop entry in the database.
type Shop struct {
	ID          int       `json:"id"          db:"id"`
	Name        string    `json:"name"        db:"name"`
	Category    string    `json:"category"    db:"category"`
	Subcat      string    `json:"subcat"      db:"subcat"`
	Icon        string    `json:"icon"        db:"icon"`
	Address     string    `json:"address"     db:"address"`
	Phone       string    `json:"phone"       db:"phone"`
	Hours       string    `json:"hours"       db:"hours"`
	IsOpen      bool      `json:"is_open"     db:"is_open"`
	Description string    `json:"description" db:"description"`
	PhotoURL    string    `json:"photo_url"   db:"photo_url"`
	MapQuery    string    `json:"map_query"   db:"map_query"`
	CreatedAt   time.Time `json:"created_at"  db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"  db:"updated_at"`
}

// CreateShopRequest is the payload for creating a new shop.
type CreateShopRequest struct {
	Name        string `json:"name"        validate:"required,min=1,max=200"`
	Category    string `json:"category"    validate:"required,oneof=Food Medical Café"`
	Subcat      string `json:"subcat"      validate:"required"`
	Icon        string `json:"icon"`
	Address     string `json:"address"`
	Phone       string `json:"phone"`
	Hours       string `json:"hours"`
	IsOpen      bool   `json:"is_open"`
	Description string `json:"description"`
	PhotoURL    string `json:"photo_url"`
	MapQuery    string `json:"map_query"`
}

// UpdateShopRequest is the payload for updating a shop.
type UpdateShopRequest struct {
	Name        *string `json:"name"`
	Category    *string `json:"category"`
	Subcat      *string `json:"subcat"`
	Icon        *string `json:"icon"`
	Address     *string `json:"address"`
	Phone       *string `json:"phone"`
	Hours       *string `json:"hours"`
	IsOpen      *bool   `json:"is_open"`
	Description *string `json:"description"`
	PhotoURL    *string `json:"photo_url"`
	MapQuery    *string `json:"map_query"`
}

// Admin represents an admin user.
type Admin struct {
	ID        int       `json:"id"         db:"id"`
	Username  string    `json:"username"   db:"username"`
	Password  string    `json:"-"          db:"password"` // never exposed in JSON
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// LoginRequest is the admin login payload.
type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

// LoginResponse is returned on successful login.
type LoginResponse struct {
	Token    string `json:"token"`
	Username string `json:"username"`
	Message  string `json:"message"`
}

// ShopFilter holds query params for listing shops.
type ShopFilter struct {
	Category string // "Food", "Medical", "Café", or ""
	Subcat   string // sub-category filter
	Status   string // "open", "closed", or ""
	Search   string // name/address free text
}

// StatsResponse is the admin dashboard stats payload.
type StatsResponse struct {
	Total    int `json:"total"`
	Open     int `json:"open"`
	Closed   int `json:"closed"`
	OpenRate int `json:"open_rate"` // percentage
}

// APIResponse is a generic JSON wrapper.
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}
