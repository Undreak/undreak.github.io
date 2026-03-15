"""
g^(1) correlation function computation from particle trajectories.

Supports C++ (OpenMP) and Numba backends with automatic fallback.
"""

import numpy as np
from numba import njit, prange

from active.simulation import _USE_CPP_BACKEND, dls_cpp

# =============================================================================
# Numba Implementations (Fallback)
# =============================================================================


@njit(fastmath=True, cache=True)
def _compute_g1_single_lag_numba(positions, q, lag):
    """Numba: single lag g1 computation."""
    N_particles, N_steps = positions.shape
    n_origins = N_steps - lag
    sum_cos = 0.0
    sum_sin = 0.0

    for p in range(N_particles):
        for t in range(n_origins):
            dr = positions[p, t + lag] - positions[p, t]
            phase = q * dr
            sum_cos += np.cos(phase)
            sum_sin += np.sin(phase)

    count = N_particles * n_origins
    return sum_cos / count, sum_sin / count


def _compute_g1_sequential_numba(positions, q, max_lag):
    """Numba: sequential g^(1) computation."""
    g1_real = np.zeros(max_lag)
    g1_imag = np.zeros(max_lag)
    g1_real[0] = 1.0

    for lag in range(1, max_lag):
        re, im = _compute_g1_single_lag_numba(positions, q, lag)
        g1_real[lag] = re
        g1_imag[lag] = im

    return g1_real, g1_imag


@njit(parallel=True, fastmath=True, cache=True)
def _compute_g1_parallel_numba(positions, q, max_lag):
    """
    Parallel Numba g^(1) computation.

    Key simplification: parallelize ONLY over lags (outer loop).
    Each thread computes one lag value independently - no nested reductions.
    """
    n_particles, n_steps = positions.shape
    g1_real = np.zeros(max_lag)
    g1_imag = np.zeros(max_lag)
    g1_real[0] = 1.0  # g1(0) = 1 by definition

    # Parallel over lags only - each lag is independent
    for lag in prange(1, max_lag):
        n_origins = n_steps - lag
        sum_cos = 0.0
        sum_sin = 0.0

        # Sequential inner loops - reduction within single thread
        for p in range(n_particles):
            for t in range(n_origins):
                dr = positions[p, t + lag] - positions[p, t]
                phase = q * dr
                sum_cos += np.cos(phase)
                sum_sin += np.sin(phase)

        count = n_particles * n_origins
        g1_real[lag] = sum_cos / count
        g1_imag[lag] = sum_sin / count

    return g1_real, g1_imag


@njit(parallel=True, fastmath=True, cache=True)
def _compute_g1_parallel_2d_numba(positions, q_x, q_y, max_lag):
    """
    Parallel Numba g^(1) computation for 2D positions with q-vector.

    positions: shape (N_particles, N_steps, 2) where last dim is (x, y)
    phase = q_x * dx + q_y * dy
    """
    n_particles, n_steps, _ = positions.shape
    g1_real = np.zeros(max_lag)
    g1_imag = np.zeros(max_lag)
    g1_real[0] = 1.0  # g1(0) = 1 by definition

    for lag in prange(1, max_lag):
        n_origins = n_steps - lag
        sum_cos = 0.0
        sum_sin = 0.0

        for p in range(n_particles):
            for t in range(n_origins):
                dx = positions[p, t + lag, 0] - positions[p, t, 0]
                dy = positions[p, t + lag, 1] - positions[p, t, 1]
                phase = q_x * dx + q_y * dy
                sum_cos += np.cos(phase)
                sum_sin += np.sin(phase)

        count = n_particles * n_origins
        g1_real[lag] = sum_cos / count
        g1_imag[lag] = sum_sin / count

    return g1_real, g1_imag


# =============================================================================
# Public API
# =============================================================================


def compute_g1_from_trajectories(
    positions: np.ndarray,
    q: float,
    dt: float,
    max_lag_fraction: float = 0.25,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Compute g^(1)(τ) numerically from particle trajectories.

    g^(1)(τ) ∝ <exp(iq·[r(t+τ) - r(t)])>

    Uses C++ with OpenMP when available, otherwise falls back to Numba.

    Parameters
    ----------
    positions : ndarray, shape (N_particles, N_steps)
        Particle positions from simulation.
    q : float
        Scattering wavevector [m⁻¹].
    dt : float
        Time step [s].
    max_lag_fraction : float, optional
        Fraction of N_steps to use as max lag (default 0.25).

    Returns
    -------
    tau_values : ndarray
        Time lag values [s].
    g1_values : ndarray (complex)
        Complex g^(1) correlation function.
    """
    if _USE_CPP_BACKEND:
        return dls_cpp.compute_g1_from_trajectories(positions, q, dt, max_lag_fraction)

    # Numba parallel fallback
    N_particles, N_steps = positions.shape
    max_lag = int(N_steps * max_lag_fraction)

    g1_real, g1_imag = _compute_g1_parallel_numba(positions, q, max_lag)
    g1_values = g1_real + 1j * g1_imag

    tau_values = np.arange(max_lag) * dt
    return tau_values, g1_values


def compute_g1_from_trajectories_2d(
    positions: np.ndarray,
    q_x: float,
    q_y: float,
    dt: float,
    max_lag_fraction: float = 0.25,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Compute g^(1)(τ) from full 2D trajectories with arbitrary q-vector.

    g^(1)(τ) ∝ <exp(i·(q_x·Δx + q_y·Δy))>

    For heterodyne DLS at scattering angle θ:
        q_x = k·(cos(θ) - 1)
        q_y = k·sin(θ)
    where k = 2πn/λ.

    Parameters
    ----------
    positions : ndarray, shape (N_particles, N_steps, 2)
        Full 2D particle positions from simulate_active_brownian_2d_full.
    q_x : float
        X-component of scattering wavevector [m⁻¹].
    q_y : float
        Y-component of scattering wavevector [m⁻¹].
    dt : float
        Time step [s].
    max_lag_fraction : float, optional
        Fraction of N_steps to use as max lag (default 0.25).

    Returns
    -------
    tau_values : ndarray
        Time lag values [s].
    g1_values : ndarray (complex)
        Complex g^(1) correlation function.
    """
    if _USE_CPP_BACKEND:
        return dls_cpp.compute_g1_from_trajectories_2d(positions, q_x, q_y, dt, max_lag_fraction)

    # Numba parallel fallback
    N_particles, N_steps, _ = positions.shape
    max_lag = int(N_steps * max_lag_fraction)

    g1_real, g1_imag = _compute_g1_parallel_2d_numba(positions, q_x, q_y, max_lag)
    g1_values = g1_real + 1j * g1_imag

    tau_values = np.arange(max_lag) * dt
    return tau_values, g1_values


def compute_q_vector(
    theta: float,
    lambda_laser: float,
    n_medium: float,
) -> tuple[float, float, float]:
    """
    Compute scattering wavevector components for a given angle.

    For scattering at angle θ from incident beam along x-axis:
        q⃗ = k_s - k_i = k·(cos(θ)-1, sin(θ))
        |q| = 2k·sin(θ/2)

    Parameters
    ----------
    theta : float
        Scattering angle [radians].
    lambda_laser : float
        Laser wavelength in vacuum [m].
    n_medium : float
        Refractive index of medium.

    Returns
    -------
    q_x : float
        X-component of q [m⁻¹].
    q_y : float
        Y-component of q [m⁻¹].
    q_mag : float
        Magnitude |q| [m⁻¹].
    """
    k = 2 * np.pi * n_medium / lambda_laser
    q_x = k * (np.cos(theta) - 1)
    q_y = k * np.sin(theta)
    q_mag = 2 * k * np.sin(theta / 2)
    return q_x, q_y, q_mag
