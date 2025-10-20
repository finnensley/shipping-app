# Build a shipping and inventory management app

# Installed: react.js, vite, tailwindcss, axios, react-router-dom, redux, express, cors, pg, postgresql@15, dotenv, express-validator, 

# Tables for testing, 
# Using psql: psql -U finnensley -d postgres, CREATE DATABASE shipping_app; To connect to database: \c shipping_app
# shipping_app=# CREATE TABLE, ex: INSERT INTO orders (order_number, subtotal, taxes, total, shipping_paid) VALUES (100, 40, 3, 10) RETURNING id;
# shipping_app=# INSERT INTO order_items (order_id, item_id, sku, description, quantity) VALUES (1, 1, 111111, 'plate', 1);
# \dt to list tablenames; \d tablename to see columns and types
# ALTER TABLE orders ADD COLUMN customer_id INT REFERENCES customers(id);
# upload a csv - \copy inventory(sku, description, total_quantity) FROM '/path/to/your/file.csv' DELIMITER ',' CSV HEADER; -> edit in vscode, no spaces and delete id column and unused ,
# SELECT * FROM locations; -> to see data in table after upload
# UPDATE orders SET customer_id = 2 WHERE id = 1; -> to update a field
#

# Server:
## Node.js, express.js. to run: node src/server.js
## using Express API (provides the endpoints set up in server.js)

# Custom Hook: use axios to get data from backend (postgres tables)


# Pages:  
## 1. Store Front (potentially) or sync to Shopify
## 2. Inventory Management
## 3. Order Management
## 4. Dashboard
## 5. Picking
## 6. Packing
## 7. Shipping Carrier Setup
## 8. User Sign In
## 9. Server (either go/gin or node.js/express)
## 10. AI character - Ollama, trained on documentation
## 11. Training sandbox - using AI character

# Logic:
## Picking Page - choose the number of orders use a modal?, when submits puts items in staging location with associated order number, packing screen pulls up orders/items from picklistId, items transfer to packing status/packing location,.

## Staging location - a table with picklist and order info, technically a physical location in warehouse


# Database:
## Tables: inventory, orders, user sign in, etc.
## Api - endpoints 


# MVP:
## test focus on inv changes, picking list, packing functionality
## Create 2 arrays of objects - orders, items
## if order contains item.id adjust items inv - orderInvChange()
## map over order(s), get list of items, keep items linked to order.id  - listOfItems()
## map over items, list items/qtys-needed by location, move to staging area - packlistByLoc()
## map over items in staging area, list orders and items - packingList()
##      packing list of items with order.id displays on screen
##      move items between unpacked/packed, choose box from inv with dropdown
##      enter size, weight, print invoice, print shipping label
##      inv is removed from staging area as it is packed
## for carriers - maybe use free plugin, like easyship, to see if it works

# Challenge:
## Add localStorage - picking/packing pages
## Theme dark - remove background pic with black bkg, light - remove background pic and text-black bg-white, default - picture or change picture url like in dashboard
## Order numbers can be strings or numbers (table is set up as INT and .post validates for .isNumeric() )
## Question - did I need to set up CRUD for every table and column (maybe some didn't need to be included)
## Update each table with a .get if need it for reporting/dashboard
## Picking - add single order (type in order number), single item, single sku, ship by date, and keep oldest order. Add checkboxes or dropdown to choose. Add ship by date to orders table.
## Picking - need a way to lock or hold inv that is in a current pickList without locking any location's inventory, just removes from total_quantity. Something like: pickList is generated, item qtys are moved to "picking" status. A list is generated for inventory counts or if a cycle count is generated, anything in "picking" is listed. When count that location user can count the "picking" qty and verify it with the picking column and count the rest as the cycle count qty. (This assumes picking and counting are happening at the same time, and allows counting ahead of the picker before they arrive to take the items on the pickList). No need to stop work to do daily inventory checks or routine counts. 
## Inventory counts, Receiving, Returns, Inventory adjustments that are not cumbersome and tracking 
## A way to inventory or track packaging material usage, boxes
## Accurate weight and pkg dimensions saves client money until hits next tier level with carrier agreements.Think about ways to improve this feature.
## Order Page: Add ability to edit each order, a find search and have a selection option, pop-up to edit order.  
 


# Notes:
## If update quantities in the app, backend updates happen correctly
## If update database directly, need to run this update manually to sync UI and backend.
<!-- UPDATE items
    SET total_quantity = (
  SELECT COALESCE(SUM(quantity), 0)
  FROM item_locations
  WHERE item_id = 1
)
WHERE id = 1;  -->
## Current logic: Picklist is generated by oldest order_number logic only, for now. Created a status for orders: open, staged (if moved to staged file), should add packed, shipped, hold, orderUpdated etc. 
## Update orders total to include shipping paid, then delete shipping on orders screen, show this in the dashboard shipping paid vs shipping label cost

## Terminal 1: npm run dev
## Terminal 2: psql -U finnensley -d shipping_app
## Terminal 3: node server.js