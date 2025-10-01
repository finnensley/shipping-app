# Build a shipping and inventory management app

# Installed: react.js, vite, tailwindcss, axios, react-router-dom

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

## Staging location is a list of pickinglistIds ?


# Database:
## Tables: inventory, orders, user sign in
## Api - endpoints 

# MVP - test focus on inv changes, picking list, packing functionality

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


