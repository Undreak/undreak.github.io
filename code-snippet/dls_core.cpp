/**
 * Active Brownian Particle DLS Simulation - C++ Core Implementation
 * ==================================================================
 */

// ReSharper disable All
#include "dls_core.hpp"

#include <cmath>
#include <random>
#include <stdexcept>

#ifdef _OPENMP
#include <omp.h>
#endif

namespace dls {

std::vector<double> simulate_active_brownian_1d(
    const std::size_t n_particles,
    const std::size_t n_steps,
    const double dt,
    const double D,
    const double v,
    const unsigned int seed
) {
    if (n_particles == 0 || n_steps == 0) {
        throw std::invalid_argument("n_particles and n_steps must be positive");
    }

    std::vector<double> positions(n_particles * n_steps, 0.0);

    const double sigma = std::sqrt(2.0 * D * dt);
    const double ballistic = v * dt;

    // Use hardware random device for seed if not specified
    unsigned int actual_seed = seed;
    if (seed == 0) {
        std::random_device rd;
        actual_seed = rd();
    }

    // Parallel simulation - each particle is independent
    #pragma omp parallel default(none) \
        shared(positions, n_particles, n_steps, sigma, actual_seed, ballistic)
    {
        // Thread-local RNG with unique seed per thread
        #ifdef _OPENMP
        const int thread_id = omp_get_thread_num();
        #else
        const int thread_id = 0;
        #endif
        std::mt19937_64 rng(actual_seed + static_cast<unsigned int>(thread_id) * 12345u);
        std::normal_distribution<double> normal(0.0, sigma);

        #pragma omp for schedule(static)
        for (std::size_t p = 0; p < n_particles; ++p) {
            double* row = positions.data() + p * n_steps;
            // row[0] = 0.0 already set

            for (std::size_t t = 1; t < n_steps; ++t) {
                row[t] = row[t - 1] + ballistic + normal(rng);
            }
        }
    }

    return positions;
}

std::vector<double> simulate_active_brownian_2d(
    const std::size_t n_particles,
    const std::size_t n_steps,
    const double dt,
    const double D,
    const double v,
    const double alpha,
    const unsigned int seed
) {
    if (n_particles == 0 || n_steps == 0) {
        throw std::invalid_argument("n_particles and n_steps must be positive");
    }

    // Only store x-positions (projection onto q direction)
    std::vector<double> positions_x(n_particles * n_steps, 0.0);

    const double sigma = std::sqrt(2.0 * D * dt);
    const double vx = v * std::cos(alpha) * dt;  // x-component of velocity step
    // vy = v * std::sin(alpha) * dt; // Not needed - we only track x

    // Use hardware random device for seed if not specified
    unsigned int actual_seed = seed;
    if (seed == 0) {
        std::random_device rd;
        actual_seed = rd();
    }

    // Parallel simulation - each particle is independent
    #pragma omp parallel default(none) \
        shared(positions_x, n_particles, n_steps, sigma, actual_seed, vx)
    {
        // Thread-local RNG with unique seed per thread
        #ifdef _OPENMP
        const int thread_id = omp_get_thread_num();
        #else
        const int thread_id = 0;
        #endif
        std::mt19937_64 rng(actual_seed + static_cast<unsigned int>(thread_id) * 12345u);
        std::normal_distribution<double> normal(0.0, sigma);

        #pragma omp for schedule(static)
        for (std::size_t p = 0; p < n_particles; ++p) {
            double* row = positions_x.data() + p * n_steps;
            // row[0] = 0.0 already set

            for (std::size_t t = 1; t < n_steps; ++t) {
                // Only x-component matters for DLS (projection onto q)
                // y-diffusion happens but doesn't affect x-position
                row[t] = row[t - 1] + vx + normal(rng);
            }
        }
    }

    return positions_x;
}

std::vector<double> simulate_active_brownian_2d_full(
    const std::size_t n_particles,
    const std::size_t n_steps,
    const double dt,
    const double D,
    const double v,
    const double phi,
    const unsigned int seed
) {
    if (n_particles == 0 || n_steps == 0) {
        throw std::invalid_argument("n_particles and n_steps must be positive");
    }

    // Store both x and y positions, interleaved: [x0, y0, x1, y1, ...]
    // Total size: n_particles × n_steps × 2
    std::vector<double> positions(n_particles * n_steps * 2, 0.0);

    const double sigma = std::sqrt(2.0 * D * dt);
    const double vx = v * std::cos(phi) * dt;
    const double vy = v * std::sin(phi) * dt;

    // Use hardware random device for seed if not specified
    unsigned int actual_seed = seed;
    if (seed == 0) {
        std::random_device rd;
        actual_seed = rd();
    }

    // Parallel simulation - each particle is independent
    #pragma omp parallel default(none) \
        shared(positions, n_particles, n_steps, sigma, actual_seed, vx, vy)
    {
        // Thread-local RNG with unique seed per thread
        #ifdef _OPENMP
        const int thread_id = omp_get_thread_num();
        #else
        const int thread_id = 0;
        #endif
        std::mt19937_64 rng(actual_seed + static_cast<unsigned int>(thread_id) * 12345u);
        std::normal_distribution<double> normal(0.0, sigma);

        #pragma omp for schedule(static)
        for (std::size_t p = 0; p < n_particles; ++p) {
            // Each particle has n_steps × 2 values (x,y interleaved per timestep)
            double* row = positions.data() + p * n_steps * 2;
            // row[0] = x(t=0) = 0, row[1] = y(t=0) = 0 (already set)

            for (std::size_t t = 1; t < n_steps; ++t) {
                const std::size_t idx = t * 2;
                const std::size_t prev_idx = (t - 1) * 2;
                row[idx] = row[prev_idx] + vx + normal(rng);      // x
                row[idx + 1] = row[prev_idx + 1] + vy + normal(rng);  // y
            }
        }
    }

    return positions;
}

std::pair<double, double> compute_g1_single_lag_2d(
    const double* positions,
    const std::size_t n_particles,
    const std::size_t n_steps,
    const double q_x,
    const double q_y,
    const std::size_t lag
) {
    if (lag >= n_steps) {
        return {0.0, 0.0};
    }

    const std::size_t n_origins = n_steps - lag;
    double sum_cos = 0.0;
    double sum_sin = 0.0;

    // Parallel reduction over particles
    #pragma omp parallel for default(none) \
        shared(positions, n_particles, n_steps, n_origins, q_x, q_y, lag) \
        reduction(+:sum_cos, sum_sin) \
        schedule(static)
    for (std::size_t p = 0; p < n_particles; ++p) {
        // Each particle: n_steps × 2 values (x,y interleaved)
        const double* row = positions + p * n_steps * 2;
        double local_cos = 0.0;
        double local_sin = 0.0;

        for (std::size_t t = 0; t < n_origins; ++t) {
            const std::size_t idx_now = t * 2;
            const std::size_t idx_lag = (t + lag) * 2;
            const double dx = row[idx_lag] - row[idx_now];
            const double dy = row[idx_lag + 1] - row[idx_now + 1];
            const double phase = q_x * dx + q_y * dy;
            local_cos += std::cos(phase);
            local_sin += std::sin(phase);
        }

        sum_cos += local_cos;
        sum_sin += local_sin;
    }

    const auto count = static_cast<double>(n_particles * n_origins);
    return {sum_cos / count, sum_sin / count};
}

G1Result compute_g1_from_trajectories_2d(
    const double* positions,
    const std::size_t n_particles,
    const std::size_t n_steps,
    const double q_x,
    const double q_y,
    const double dt,
    const double max_lag_fraction
) {
    if (positions == nullptr) {
        throw std::invalid_argument("positions cannot be null");
    }
    if (n_particles == 0 || n_steps == 0) {
        throw std::invalid_argument("n_particles and n_steps must be positive");
    }
    if (max_lag_fraction <= 0.0 || max_lag_fraction > 1.0) {
        throw std::invalid_argument("max_lag_fraction must be in (0, 1]");
    }

    const auto max_lag = static_cast<std::size_t>(
        static_cast<double>(n_steps) * max_lag_fraction
    );

    G1Result result;
    result.real.resize(max_lag);
    result.imag.resize(max_lag);
    result.tau.resize(max_lag);

    // Fill tau values
    for (std::size_t i = 0; i < max_lag; ++i) {
        result.tau[i] = static_cast<double>(i) * dt;
    }

    // Lag 0: g1(0) = 1 + 0i by definition
    result.real[0] = 1.0;
    result.imag[0] = 0.0;

    // Main parallel loop over lag values
    #pragma omp parallel for default(none) \
        shared(positions, n_particles, n_steps, q_x, q_y, result, max_lag) \
        schedule(dynamic, 16)
    for (std::size_t lag = 1; lag < max_lag; ++lag) {
        const auto [re, im] = compute_g1_single_lag_2d(
            positions, n_particles, n_steps, q_x, q_y, lag
        );
        result.real[lag] = re;
        result.imag[lag] = im;
    }

    return result;
}

std::pair<double, double> compute_g1_single_lag(
    const double* positions,
    const std::size_t n_particles,
    const std::size_t n_steps,
    const double q,
    const std::size_t lag
) {
    if (lag >= n_steps) {
        return {0.0, 0.0};
    }

    const std::size_t n_origins = n_steps - lag;
    double sum_cos = 0.0;
    double sum_sin = 0.0;

    // Parallel reduction over particles and time origins
    #pragma omp parallel for default(none) \
        shared(positions, n_particles, n_steps, n_origins, q, lag) \
        reduction(+:sum_cos, sum_sin) \
        schedule(static)
    for (std::size_t p = 0; p < n_particles; ++p) {
        const double* row = positions + p * n_steps;
        double local_cos = 0.0;
        double local_sin = 0.0;

        // Inner loop - vectorizable with SIMD
        #pragma omp simd reduction(+:local_cos, local_sin)
        for (std::size_t t = 0; t < n_origins; ++t) { // NOLINT
            const double dr = row[t + lag] - row[t];
            const double phase = q * dr;
            local_cos += std::cos(phase);
            local_sin += std::sin(phase);
        }

        sum_cos += local_cos;
        sum_sin += local_sin;
    }

    const auto count = static_cast<double>(n_particles * n_origins);
    return {sum_cos / count, sum_sin / count};
}

G1Result compute_g1_from_trajectories(
    const double* positions,
    const std::size_t n_particles,
    const std::size_t n_steps,
    const double q,
    const double dt,
    const double max_lag_fraction
) {
    if (positions == nullptr) {
        throw std::invalid_argument("positions cannot be null");
    }
    if (n_particles == 0 || n_steps == 0) {
        throw std::invalid_argument("n_particles and n_steps must be positive");
    }
    if (max_lag_fraction <= 0.0 || max_lag_fraction > 1.0) {
        throw std::invalid_argument("max_lag_fraction must be in (0, 1]");
    }

    const auto max_lag = static_cast<std::size_t>(
        static_cast<double>(n_steps) * max_lag_fraction
    );

    G1Result result;
    result.real.resize(max_lag);
    result.imag.resize(max_lag);
    result.tau.resize(max_lag);

    // Fill tau values
    for (std::size_t i = 0; i < max_lag; ++i) {
        result.tau[i] = static_cast<double>(i) * dt;
    }

    // Lag 0: g1(0) = 1 + 0i by definition
    result.real[0] = 1.0;
    result.imag[0] = 0.0;

    // Main parallel loop over lag values
    // Each lag computation is independent - embarrassingly parallel
    #pragma omp parallel for default(none) \
        shared(positions, n_particles, n_steps, q, result, max_lag) \
        schedule(dynamic, 16)
    for (std::size_t lag = 1; lag < max_lag; ++lag) {
        const auto [re, im] = compute_g1_single_lag(
            positions, n_particles, n_steps, q, lag
        );
        result.real[lag] = re;
        result.imag[lag] = im;
    }

    return result;
}

int get_num_threads() {
    #ifdef _OPENMP
    return omp_get_max_threads();
    #else
    return 1;
    #endif
}

void set_num_threads(const int n) {
    #ifdef _OPENMP
    if (n > 0) {
        omp_set_num_threads(n);
    }
    #else
    (void)n;  // Suppress unused parameter warning
    #endif
}

}  // namespace dls
