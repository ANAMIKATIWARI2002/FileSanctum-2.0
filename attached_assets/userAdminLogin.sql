-- Add admin user (password: admin123)
INSERT INTO users (username, email, password, role)
VALUES 
  ('admin', 'admin@example.com', '$2a$10$JyYx1DAL59NZl9nHPZ5steQ0KvZXQ7MxwJ/HajT.JWgOoy6StFPOK', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Add regular user (password: user123)
INSERT INTO users (username, email, password, role)
VALUES 
  ('user', 'user@example.com', '$2a$10$5awPiLUOALDFs6.xtqVlGe7G5xrOOJLgBl12C1llyiUQIBqR2C9OS', 'user')
ON CONFLICT (email) DO NOTHING;