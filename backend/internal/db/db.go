package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	_ "github.com/lib/pq"

	"github.com/shopen/backend/internal/models"
)

// DB wraps *sql.DB and provides all database operations.
type DB struct {
	conn *sql.DB
}

// New opens a PostgreSQL connection and verifies it with a ping.
func New() (*DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		getenv("DB_HOST", "localhost"),
		getenv("DB_PORT", "5432"),
		getenv("DB_USER", "postgres"),
		getenv("DB_PASSWORD", "pass"),
		getenv("DB_NAME", "shopen"),
		getenv("DB_SSLMODE", "disable"),
	)

	conn, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("open db: %w", err)
	}

	conn.SetMaxOpenConns(25)
	conn.SetMaxIdleConns(10)
	conn.SetConnMaxLifetime(5 * time.Minute)

	if err = conn.Ping(); err != nil {
		return nil, fmt.Errorf("ping db: %w", err)
	}

	log.Println("✅ Connected to PostgreSQL")
	return &DB{conn: conn}, nil
}

// Close closes the underlying database connection.
func (d *DB) Close() error { return d.conn.Close() }

// ─── SHOP QUERIES ─────────────────────────────────────────────────────────────

// ListShops returns all shops matching the given filter.
func (d *DB) ListShops(f models.ShopFilter) ([]models.Shop, error) {
	query := `
		SELECT id, name, category, subcat, icon, address, phone, hours,
		       is_open, description, photo_url, map_query, created_at, updated_at
		FROM shops
		WHERE 1=1`

	args := []interface{}{}
	argIdx := 1

	if f.Category != "" {
		query += fmt.Sprintf(" AND category = $%d", argIdx)
		args = append(args, f.Category)
		argIdx++
	}
	if f.Subcat != "" {
		query += fmt.Sprintf(" AND subcat = $%d", argIdx)
		args = append(args, f.Subcat)
		argIdx++
	}
	if f.Status == "open" {
		query += " AND is_open = TRUE"
	} else if f.Status == "closed" {
		query += " AND is_open = FALSE"
	}
	if f.Search != "" {
		query += fmt.Sprintf(
			" AND (name ILIKE $%d OR address ILIKE $%d OR subcat ILIKE $%d)",
			argIdx, argIdx+1, argIdx+2,
		)
		like := "%" + f.Search + "%"
		args = append(args, like, like, like)
		argIdx += 3
	}

	query += " ORDER BY created_at DESC"

	rows, err := d.conn.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("list shops: %w", err)
	}
	defer rows.Close()

	var shops []models.Shop
	for rows.Next() {
		var s models.Shop
		if err := rows.Scan(
			&s.ID, &s.Name, &s.Category, &s.Subcat, &s.Icon,
			&s.Address, &s.Phone, &s.Hours, &s.IsOpen,
			&s.Description, &s.PhotoURL, &s.MapQuery,
			&s.CreatedAt, &s.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan shop: %w", err)
		}
		shops = append(shops, s)
	}
	if shops == nil {
		shops = []models.Shop{}
	}
	return shops, rows.Err()
}

// GetShopByID returns a single shop by its ID.
func (d *DB) GetShopByID(id int) (*models.Shop, error) {
	const query = `
		SELECT id, name, category, subcat, icon, address, phone, hours,
		       is_open, description, photo_url, map_query, created_at, updated_at
		FROM shops WHERE id = $1`

	var s models.Shop
	err := d.conn.QueryRow(query, id).Scan(
		&s.ID, &s.Name, &s.Category, &s.Subcat, &s.Icon,
		&s.Address, &s.Phone, &s.Hours, &s.IsOpen,
		&s.Description, &s.PhotoURL, &s.MapQuery,
		&s.CreatedAt, &s.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get shop: %w", err)
	}
	return &s, nil
}

// CreateShop inserts a new shop and returns it with its generated ID.
func (d *DB) CreateShop(req models.CreateShopRequest) (*models.Shop, error) {
	const query = `
		INSERT INTO shops (name, category, subcat, icon, address, phone, hours,
		                   is_open, description, photo_url, map_query)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
		RETURNING id, name, category, subcat, icon, address, phone, hours,
		          is_open, description, photo_url, map_query, created_at, updated_at`

	icon := req.Icon
	if icon == "" {
		icon = "🏪"
	}

	var s models.Shop
	err := d.conn.QueryRow(query,
		req.Name, req.Category, req.Subcat, icon,
		req.Address, req.Phone, req.Hours, req.IsOpen,
		req.Description, req.PhotoURL, req.MapQuery,
	).Scan(
		&s.ID, &s.Name, &s.Category, &s.Subcat, &s.Icon,
		&s.Address, &s.Phone, &s.Hours, &s.IsOpen,
		&s.Description, &s.PhotoURL, &s.MapQuery,
		&s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create shop: %w", err)
	}
	return &s, nil
}

// UpdateShop applies partial updates to a shop.
func (d *DB) UpdateShop(id int, req models.UpdateShopRequest) (*models.Shop, error) {
	setClauses := []string{}
	args := []interface{}{}
	argIdx := 1

	if req.Name != nil        { setClauses = append(setClauses, fmt.Sprintf("name=$%d", argIdx));        args = append(args, *req.Name);        argIdx++ }
	if req.Category != nil    { setClauses = append(setClauses, fmt.Sprintf("category=$%d", argIdx));    args = append(args, *req.Category);    argIdx++ }
	if req.Subcat != nil      { setClauses = append(setClauses, fmt.Sprintf("subcat=$%d", argIdx));      args = append(args, *req.Subcat);      argIdx++ }
	if req.Icon != nil        { setClauses = append(setClauses, fmt.Sprintf("icon=$%d", argIdx));        args = append(args, *req.Icon);        argIdx++ }
	if req.Address != nil     { setClauses = append(setClauses, fmt.Sprintf("address=$%d", argIdx));     args = append(args, *req.Address);     argIdx++ }
	if req.Phone != nil       { setClauses = append(setClauses, fmt.Sprintf("phone=$%d", argIdx));       args = append(args, *req.Phone);       argIdx++ }
	if req.Hours != nil       { setClauses = append(setClauses, fmt.Sprintf("hours=$%d", argIdx));       args = append(args, *req.Hours);       argIdx++ }
	if req.IsOpen != nil      { setClauses = append(setClauses, fmt.Sprintf("is_open=$%d", argIdx));     args = append(args, *req.IsOpen);      argIdx++ }
	if req.Description != nil { setClauses = append(setClauses, fmt.Sprintf("description=$%d", argIdx)); args = append(args, *req.Description); argIdx++ }
	if req.PhotoURL != nil    { setClauses = append(setClauses, fmt.Sprintf("photo_url=$%d", argIdx));   args = append(args, *req.PhotoURL);    argIdx++ }
	if req.MapQuery != nil    { setClauses = append(setClauses, fmt.Sprintf("map_query=$%d", argIdx));   args = append(args, *req.MapQuery);    argIdx++ }

	if len(setClauses) == 0 {
		return d.GetShopByID(id)
	}

	query := fmt.Sprintf(`
		UPDATE shops SET %s, updated_at=NOW()
		WHERE id=$%d
		RETURNING id, name, category, subcat, icon, address, phone, hours,
		          is_open, description, photo_url, map_query, created_at, updated_at`,
		strings.Join(setClauses, ", "), argIdx,
	)
	args = append(args, id)

	var s models.Shop
	err := d.conn.QueryRow(query, args...).Scan(
		&s.ID, &s.Name, &s.Category, &s.Subcat, &s.Icon,
		&s.Address, &s.Phone, &s.Hours, &s.IsOpen,
		&s.Description, &s.PhotoURL, &s.MapQuery,
		&s.CreatedAt, &s.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("update shop: %w", err)
	}
	return &s, nil
}

// DeleteShop removes a shop by ID. Returns false if not found.
func (d *DB) DeleteShop(id int) (bool, error) {
	res, err := d.conn.Exec("DELETE FROM shops WHERE id=$1", id)
	if err != nil {
		return false, fmt.Errorf("delete shop: %w", err)
	}
	n, _ := res.RowsAffected()
	return n > 0, nil
}

// ToggleShopStatus flips the is_open boolean for a given shop.
func (d *DB) ToggleShopStatus(id int) (*models.Shop, error) {
	const query = `
		UPDATE shops SET is_open = NOT is_open, updated_at = NOW()
		WHERE id = $1
		RETURNING id, name, category, subcat, icon, address, phone, hours,
		          is_open, description, photo_url, map_query, created_at, updated_at`

	var s models.Shop
	err := d.conn.QueryRow(query, id).Scan(
		&s.ID, &s.Name, &s.Category, &s.Subcat, &s.Icon,
		&s.Address, &s.Phone, &s.Hours, &s.IsOpen,
		&s.Description, &s.PhotoURL, &s.MapQuery,
		&s.CreatedAt, &s.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("toggle status: %w", err)
	}
	return &s, nil
}

// GetStats returns aggregate shop statistics.
func (d *DB) GetStats() (models.StatsResponse, error) {
	const query = `
		SELECT
			COUNT(*)                                  AS total,
			COUNT(*) FILTER (WHERE is_open = TRUE)    AS open,
			COUNT(*) FILTER (WHERE is_open = FALSE)   AS closed
		FROM shops`

	var s models.StatsResponse
	err := d.conn.QueryRow(query).Scan(&s.Total, &s.Open, &s.Closed)
	if err != nil {
		return s, fmt.Errorf("get stats: %w", err)
	}
	if s.Total > 0 {
		s.OpenRate = int(float64(s.Open) / float64(s.Total) * 100)
	}
	return s, nil
}

// ─── ADMIN QUERIES ────────────────────────────────────────────────────────────

// GetAdminByUsername looks up an admin by username.
func (d *DB) GetAdminByUsername(username string) (*models.Admin, error) {
	const query = `SELECT id, username, password, created_at, updated_at FROM admins WHERE username=$1`
	var a models.Admin
	err := d.conn.QueryRow(query, username).Scan(
		&a.ID, &a.Username, &a.Password, &a.CreatedAt, &a.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get admin: %w", err)
	}
	return &a, nil
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
