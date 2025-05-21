-- Script to export data from tables
-- Run this in your old database (qdbfcqwbmrhgnaoqwnkp)

-- Business Sites
SELECT json_agg(t) FROM (
  SELECT * FROM business_sites
) t;

-- Contractors
SELECT json_agg(t) FROM (
  SELECT * FROM contractors
) t;

-- Site Contractors
SELECT json_agg(t) FROM (
  SELECT * FROM site_contractors
) t;

-- Profiles
SELECT json_agg(t) FROM (
  SELECT * FROM profiles
) t;

-- Site Floor Plans
SELECT json_agg(t) FROM (
  SELECT * FROM site_floor_plans
) t; 