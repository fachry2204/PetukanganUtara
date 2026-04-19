USE sipetut_db;

// Table for Web Push Subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50),
    subscription_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

// Table for Live Tracking History (Optional, for admin view)
CREATE TABLE IF NOT EXISTS staff_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50),
    name VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
