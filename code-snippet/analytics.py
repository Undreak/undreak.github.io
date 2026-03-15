"""
Analytical correlation functions for DLS.

Contains pure mathematical functions for g^(1), g^(2), Doppler formulas,
and form factors. No I/O or state - all functions are pure.
"""

import numpy as np


def F_s_brownian(q: float, tau: np.ndarray, D: float) -> np.ndarray:
    """
    Self-intermediate scattering function for pure Brownian motion.

    F_s(q, τ) = exp(-D·q²·τ)

    Parameters
    ----------
    q : float
        Scattering wavevector magnitude [m⁻¹].
    tau : ndarray
        Time lag values [s].
    D : float
        Diffusion coefficient [m²/s].

    Returns
    -------
    F_s : ndarray
        Self-intermediate scattering function (real, decaying).
    """
    return np.exp(-D * q**2 * tau)


def doppler_frequency(
    v: float,
    theta: float,
    phi: float,
    lambda_laser: float,
    n_medium: float,
) -> float:
    """
    Doppler angular frequency for heterodyne DLS.

    Uses the full interferometric formula from Christoulaki & Buhler (2025):
        ω = (2πn/λ) · v · [cos(θ - φ) - cos(φ)]

    This accounts for both incident (k_i) and scattered (k_s) wave contributions
    to the Doppler shift in the heterodyne signal.

    Parameters
    ----------
    v : float
        Particle velocity magnitude [m/s].
    theta : float
        Scattering angle [radians].
    phi : float
        UV orientation angle = angle of v relative to incident beam k_i [radians].
    lambda_laser : float
        Laser wavelength in vacuum [m].
    n_medium : float
        Refractive index of medium.

    Returns
    -------
    omega : float
        Doppler angular frequency [rad/s].
    """
    k = 2 * np.pi * n_medium / lambda_laser
    return k * v * (np.cos(theta - phi) - np.cos(phi))


def form_factor_sphere(q: float | np.ndarray, R: float) -> float | np.ndarray:
    """
    Rayleigh-Gans-Debye form factor for a homogeneous sphere.

    P(q) = [3 · (sin(qR) - qR·cos(qR)) / (qR)³]²

    Valid when the size parameter x = 2πnR/λ is moderate and the
    refractive index contrast |m-1| << 1.

    Parameters
    ----------
    q : float or ndarray
        Scattering wavevector magnitude [m⁻¹].
    R : float
        Particle radius [m].

    Returns
    -------
    P : float or ndarray
        Form factor (dimensionless, between 0 and 1).
    """
    x = q * R
    # Handle scalar and array cases
    if np.isscalar(x):
        if np.abs(x) < 1e-10:
            return 1.0
        amplitude = 3 * (np.sin(x) - x * np.cos(x)) / x**3
        return amplitude**2
    else:
        result = np.ones_like(x, dtype=float)
        mask = np.abs(x) > 1e-10
        xm = x[mask]
        amplitude = 3 * (np.sin(xm) - xm * np.cos(xm)) / xm**3
        result[mask] = amplitude**2
        return result


def F_s_active_het(
    tau: np.ndarray,
    D: float,
    v: float,
    theta: float,
    phi: float,
    lambda_laser: float,
    n_medium: float,
) -> np.ndarray:
    """
    Self-intermediate scattering function with correct interferometric Doppler.

    F_s(q, τ) = exp(-D·q²·τ) · exp(i·ω·τ)

    where ω = (2πn/λ)·v·[cos(θ-φ) - cos(φ)] and q = 2k·sin(θ/2).

    This is the correct formula for heterodyne DLS as derived in
    Christoulaki & Buhler (2025), Phys. Rev. E 111, 015433.

    Parameters
    ----------
    tau : ndarray
        Time lag values [s].
    D : float
        Diffusion coefficient [m²/s].
    v : float
        Propulsion velocity magnitude [m/s].
    theta : float
        Scattering angle [radians].
    phi : float
        UV orientation angle relative to incident beam [radians].
    lambda_laser : float
        Laser wavelength in vacuum [m].
    n_medium : float
        Refractive index of medium.

    Returns
    -------
    F_s : ndarray (complex)
        Self-intermediate scattering function.
    """
    k = 2 * np.pi * n_medium / lambda_laser
    q = 2 * k * np.sin(theta / 2)
    omega = doppler_frequency(v, theta, phi, lambda_laser, n_medium)

    diffusive = np.exp(-D * q**2 * tau)
    ballistic = np.exp(1j * omega * tau)
    return diffusive * ballistic


def g2_heterodyne_full(
    g1: np.ndarray,
    I_LO: float,
    I_s: float,
) -> np.ndarray:
    """
    Heterodyne intensity correlation with explicit intensity ratio.

    g²_het(τ) - 1 = (I_s/I_tot)² · |g⁽¹⁾|² + 2·(I_LO·I_s/I_tot²) · Re[g⁽¹⁾]

    The first term is the homodyne contribution (self-beat of scattered light).
    The second term is the heterodyne cross-term that preserves phase/velocity info.

    Parameters
    ----------
    g1 : ndarray (complex)
        Normalized field correlation function g⁽¹⁾(τ).
    I_LO : float
        Local oscillator intensity [arbitrary units].
    I_s : float
        Scattered intensity [arbitrary units].
        Should include form factor: I_s = I_0 · P(q).

    Returns
    -------
    g2 : ndarray
        Intensity correlation function g⁽²⁾(τ).
    """
    I_tot = I_LO + I_s
    homodyne_term = (I_s / I_tot) ** 2 * np.abs(g1) ** 2
    heterodyne_term = 2 * I_LO * I_s / I_tot**2 * np.real(g1)
    return 1 + homodyne_term + heterodyne_term


def F_s_active(q: float, tau: np.ndarray, D: float, v: float, alpha: float = 0.0) -> np.ndarray:
    """
    Self-intermediate scattering function for active Brownian particle.

    F_s(q,τ) = exp(i·q·v·cos(α)·τ) × exp(-D·q²·τ)

    Parameters
    ----------
    q : float
        Scattering wavevector magnitude [m⁻¹].
    tau : ndarray
        Time lag values [s].
    D : float
        Diffusion coefficient [m²/s].
    v : float
        Propulsion velocity magnitude [m/s].
    alpha : float, optional
        Angle between velocity vector and scattering vector [radians].
        α = 0: v ∥ q (maximum Doppler shift)
        α = π/2: v ⊥ q (no Doppler shift, pure Brownian)

    Returns
    -------
    F_s : ndarray (complex)
        Self-intermediate scattering function.
    """
    v_projected = v * np.cos(alpha)  # Velocity component along q
    diffusive = np.exp(-D * q**2 * tau)
    ballistic = np.exp(1j * q * v_projected * tau)
    return diffusive * ballistic


def g1_active(q: float, tau: np.ndarray, D: float, v: float, alpha: float = 0.0) -> np.ndarray:
    """
    Normalized field correlation g^(1)(τ) for active particles.

    Parameters
    ----------
    q : float
        Scattering wavevector magnitude [m⁻¹].
    tau : ndarray
        Time lag values [s].
    D : float
        Diffusion coefficient [m²/s].
    v : float
        Propulsion velocity magnitude [m/s].
    alpha : float, optional
        Angle between velocity vector and scattering vector [radians].

    Returns
    -------
    g1 : ndarray (complex)
        Normalized field correlation function.
    """
    return F_s_active(q, tau, D, v, alpha) / F_s_active(q, 0, D, v, alpha)


def g2_homodyne(g1: np.ndarray) -> np.ndarray:
    """
    Homodyne correlation via Siegert relation.

    g²(τ) = 1 + β|g⁽¹⁾(τ)|² (β=1 ideal)

    WARNING: The |...|² operation destroys phase → loses velocity info!

    Parameters
    ----------
    g1 : ndarray (complex)
        Normalized field correlation function.

    Returns
    -------
    g2 : ndarray
        Intensity correlation function.
    """
    return 1 + np.abs(g1) ** 2


def g2_heterodyne(g1: np.ndarray, ratio_ILO_Is: float = 3.0) -> np.ndarray:
    """
    Heterodyne correlation function with intensity ratio parameter.

    g²_het - 1 = (Is²/Itot²)(|g⁽¹⁾|²) + 2(ILO·Is/Itot²)Re[g⁽¹⁾]

    The cross-term preserves oscillations!

    Parameters
    ----------
    g1 : ndarray (complex)
        Normalized field correlation function.
    ratio_ILO_Is : float, optional
        Ratio 2·I_LO/I_s controlling heterodyne contribution.
        Higher values = stronger heterodyne term.

    Returns
    -------
    g2 : ndarray
        Intensity correlation function.
    """
    x = ratio_ILO_Is
    I_s = 1
    I_LO = x * I_s / 2
    I_tot = I_LO + I_s

    homodyne_term = (I_s**2 / I_tot**2) * (np.abs(g1) ** 2)
    heterodyne_term = (2 * I_LO * I_s / I_tot**2) * np.real(g1)

    return 1 + homodyne_term + heterodyne_term
