import rateLimit from 'express-rate-limit';
import { getConfig } from '../config/index.js';

/**
 * Rate limiter specifically for administrator login to mitigate brute-force attacks.
 */
export function createLoginRateLimiter() {
  const config = getConfig();

  return rateLimit({
    windowMs: config.authRateLimitWindowMs,
    max: config.authRateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
      },
    },
    // In test environment, skip by default unless TEST_ENFORCE_RATE_LIMIT is explicitly enabled
    skip: () => {
      if (config.isTest && process.env.TEST_ENFORCE_RATE_LIMIT !== 'true') {
        return true;
      }
      return false;
    },
  });
}

/**
 * Rate limiter for public enquiry submissions to prevent spam and denial of service.
 * Standard allowance: 20 submissions per 15-minute window per IP.
 */
export function createPublicEnquiryRateLimiter() {
  const config = getConfig();

  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many enquiry submissions from this network. Please wait before submitting another enquiry.',
      },
    },
    skip: () => {
      if (config.isTest && process.env.TEST_ENFORCE_RATE_LIMIT !== 'true') {
        return true;
      }
      return false;
    },
  });
}

export const loginRateLimiter = createLoginRateLimiter();
export const publicEnquiryRateLimiter = createPublicEnquiryRateLimiter();

/**
 * Rate limiter for customer enquiry tracking to prevent token guessing or brute-force enumeration.
 * Allowance: 30 tracking lookups per 15-minute window per IP.
 */
export function createTrackingRateLimiter() {
  const config = getConfig();

  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many tracking requests from this network. Please wait a few minutes before trying again.',
      },
    },
    skip: () => {
      if (config.isTest && process.env.TEST_ENFORCE_RATE_LIMIT !== 'true') {
        return true;
      }
      return false;
    },
  });
}

export const trackingRateLimiter = createTrackingRateLimiter();
