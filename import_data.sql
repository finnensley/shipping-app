-- Clear existing data
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE item_locations CASCADE;
TRUNCATE TABLE items CASCADE;
TRUNCATE TABLE customers CASCADE;
TRUNCATE TABLE locations CASCADE;

-- Import data in correct order
\copy locations(location_number, location_name, description) FROM '/Users/finnensley/Documents/desktop-folders/letPhil/React/shipping-app/src/data/shipping_app_locations.csv' DELIMITER ',' CSV HEADER;
\copy items(image_path, sku, description, total_quantity) FROM '/Users/finnensley/Documents/desktop-folders/letPhil/React/shipping-app/src/data/shipping_app_items.csv' DELIMITER ',' CSV HEADER;
\copy item_locations(item_id, location_id, quantity) FROM '/Users/finnensley/Documents/desktop-folders/letPhil/React/shipping-app/src/data/shipping_app_item_locations.csv' DELIMITER ',' CSV HEADER;
\copy customers(name, email, phone) FROM '/Users/finnensley/Documents/desktop-folders/letPhil/React/shipping-app/src/data/shipping_app_customers.csv' DELIMITER ',' CSV HEADER;
\copy orders(order_number, subtotal, taxes, total, shipping_paid, address_line1, address_line2, city, state, zip, country, carrier, customer_id) FROM '/Users/finnensley/Documents/desktop-folders/letPhil/React/shipping-app/src/data/shipping_app_orders.csv' DELIMITER ',' CSV HEADER;
\copy order_items(order_id, item_id, sku, description, quantity) FROM '/Users/finnensley/Documents/desktop-folders/letPhil/React/shipping-app/src/data/shipping_app_order_items.csv' DELIMITER ',' CSV HEADER;

-- Verify counts
SELECT COUNT(*) as locations FROM locations;
SELECT COUNT(*) as items FROM items;
SELECT COUNT(*) as customers FROM customers;
SELECT COUNT(*) as orders FROM orders;
SELECT COUNT(*) as order_items FROM order_items;
