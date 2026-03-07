package middleware

import (
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/shopen/backend/internal/metrics"
)

func MetricsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		start := time.Now()

		next.ServeHTTP(w, r)

		duration := time.Since(start).Seconds()

		metrics.RequestLatency.
			WithLabelValues(r.Method, r.URL.Path).
			Observe(duration)

		metrics.RequestCount.
			WithLabelValues(r.Method, r.URL.Path, "200").
			Inc()
	})
}

// expose /metrics endpoint
func MetricsHandler() http.Handler {
	return promhttp.Handler()
}
