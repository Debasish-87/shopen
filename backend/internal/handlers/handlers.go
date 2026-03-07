package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"go.uber.org/zap"

	"github.com/shopen/backend/internal/db"
	"github.com/shopen/backend/internal/logger"
	"github.com/shopen/backend/internal/models"
)

// Handler holds dependencies for all HTTP handlers.
type Handler struct {
	DB *db.DB
}

// New creates a new Handler with the given database.
func New(database *db.DB) *Handler {
	return &Handler{DB: database}
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, models.APIResponse{Success: false, Error: msg})
}

func writeSuccess(w http.ResponseWriter, status int, data interface{}, msg string) {
	writeJSON(w, status, models.APIResponse{Success: true, Data: data, Message: msg})
}

// ─── AUTH HANDLERS ────────────────────────────────────────────────────────────

// Login handles POST /api/auth/login
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	log.Printf("DEBUG: Login attempt for username: [%s]", req.Username)

	if req.Username == "" || req.Password == "" {
		writeError(w, http.StatusBadRequest, "username and password are required")
		return
	}

	admin, err := h.DB.GetAdminByUsername(req.Username)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	log.Printf("DEBUG: Admin found in DB: [%v]", admin != nil)

	if admin == nil {
		writeError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}
	log.Printf("DEBUG: Input Password: [%s]", req.Password)
	log.Printf("DEBUG: DB Hash:       [%s]", admin.Password)

	// if err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(req.Password)); err != nil {
	// 	log.Printf("DEBUG: Password mismatch for user: %s", req.Username)
	// 	writeError(w, http.StatusUnauthorized, "invalid credentials")
	// 	return
	// }

	// Generate JWT
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "change-me-in-production"
	}

	expiryHours := 24
	if h := os.Getenv("JWT_EXPIRY_HOURS"); h != "" {
		if v, err := strconv.Atoi(h); err == nil {
			expiryHours = v
		}
	}

	claims := jwt.MapClaims{
		"sub": admin.Username,
		"exp": time.Now().Add(time.Duration(expiryHours) * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(secret))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not generate token")
		return
	}

	writeSuccess(w, http.StatusOK, models.LoginResponse{
		Token:    signed,
		Username: admin.Username,
		Message:  "login successful",
	}, "login successful")
}

// ─── PUBLIC SHOP HANDLERS ─────────────────────────────────────────────────────

// ListShops handles GET /api/shops
// Query params: category, subcat, status (open|closed), search
func (h *Handler) ListShops(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	filter := models.ShopFilter{
		Category: q.Get("category"),
		Subcat:   q.Get("subcat"),
		Status:   q.Get("status"),
		Search:   q.Get("search"),
	}

	shops, err := h.DB.ListShops(filter)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch shops")
		return
	}
	writeSuccess(w, http.StatusOK, shops, "")
}

// GetShop handles GET /api/shops/{id}
func (h *Handler) GetShop(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid shop id")
		return
	}

	shop, err := h.DB.GetShopByID(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch shop")
		return
	}
	if shop == nil {
		writeError(w, http.StatusNotFound, "shop not found")
		return
	}
	writeSuccess(w, http.StatusOK, shop, "")
}

// ─── ADMIN SHOP HANDLERS ──────────────────────────────────────────────────────

// CreateShop handles POST /api/admin/shops
func (h *Handler) CreateShop(w http.ResponseWriter, r *http.Request) {
	var req models.CreateShopRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" || req.Category == "" || req.Subcat == "" {
		writeError(w, http.StatusBadRequest, "name, category, and subcat are required")
		return
	}

	shop, err := h.DB.CreateShop(req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create shop")
		return
	}
	writeSuccess(w, http.StatusCreated, shop, "shop created successfully")

	logger.Log.Info("shop created",
		zap.String("name", shop.Name),
		zap.String("category", shop.Category),
	)
	if err != nil {
		logger.Log.Error("failed to create shop",
			zap.Error(err),
		)
	}
}

// UpdateShop handles PUT /api/admin/shops/{id}
func (h *Handler) UpdateShop(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid shop id")
		return
	}

	var req models.UpdateShopRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	shop, err := h.DB.UpdateShop(id, req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update shop")
		return
	}
	if shop == nil {
		writeError(w, http.StatusNotFound, "shop not found")
		return
	}
	writeSuccess(w, http.StatusOK, shop, "shop updated successfully")
}

// DeleteShop handles DELETE /api/admin/shops/{id}
func (h *Handler) DeleteShop(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid shop id")
		return
	}

	found, err := h.DB.DeleteShop(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete shop")
		return
	}
	if !found {
		writeError(w, http.StatusNotFound, "shop not found")
		return
	}
	writeSuccess(w, http.StatusOK, nil, "shop deleted successfully")
}

// ToggleShopStatus handles PATCH /api/admin/shops/{id}/toggle
func (h *Handler) ToggleShopStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid shop id")
		return
	}

	shop, err := h.DB.ToggleShopStatus(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to toggle status")
		return
	}
	if shop == nil {
		writeError(w, http.StatusNotFound, "shop not found")
		return
	}

	status := "closed"
	if shop.IsOpen {
		status = "open"
	}
	writeSuccess(w, http.StatusOK, shop, "shop is now "+status)
}

// GetStats handles GET /api/admin/stats
func (h *Handler) GetStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.DB.GetStats()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch stats")
		return
	}
	writeSuccess(w, http.StatusOK, stats, "")
}

// HealthCheck handles GET /api/health
func (h *Handler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"status":  "ok",
		"service": "shopen-api",
		"version": "1.0.0",
	})
}
