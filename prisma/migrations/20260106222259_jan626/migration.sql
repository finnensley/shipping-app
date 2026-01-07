-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "order_number" INTEGER NOT NULL,
    "subtotal" DECIMAL,
    "taxes" DECIMAL,
    "total" DECIMAL,
    "shipping_paid" DECIMAL,
    "address_line1" TEXT,
    "address_line2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT,
    "carrier" TEXT,
    "customer_id" INTEGER,
    "carrier_speed" TEXT,
    "status" VARCHAR(20) DEFAULT 'open',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "ship_by_date" DATE,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER,
    "item_id" INTEGER,
    "sku" BIGINT,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "image_path" VARCHAR(255) NOT NULL,
    "sku" BIGINT,
    "description" TEXT,
    "total_quantity" INTEGER,
    "available_quantity" INTEGER,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_locations" (
    "id" SERIAL NOT NULL,
    "item_id" INTEGER,
    "location_id" INTEGER,
    "quantity" INTEGER,
    "location_number" INTEGER,

    CONSTRAINT "item_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_location_history" (
    "id" SERIAL NOT NULL,
    "item_location_id" INTEGER,
    "old_quantity" INTEGER,
    "new_quantity" INTEGER,
    "changed_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_location_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" SERIAL NOT NULL,
    "location_number" INTEGER,
    "location_name" TEXT,
    "description" TEXT,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item_history" (
    "id" SERIAL NOT NULL,
    "order_item_id" INTEGER,
    "old_quantity" INTEGER,
    "new_quantity" INTEGER,
    "changed_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_item_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "picked_orders_staged_for_packing" (
    "id" SERIAL NOT NULL,
    "pick_list_id" INTEGER NOT NULL,
    "order_numbers" INTEGER[],
    "items" JSONB NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "status" VARCHAR(50) NOT NULL,

    CONSTRAINT "picked_orders_staged_for_packing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "permissions" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "item_locations" ADD CONSTRAINT "item_locations_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "item_locations" ADD CONSTRAINT "item_locations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "item_location_history" ADD CONSTRAINT "item_location_history_item_location_id_fkey" FOREIGN KEY ("item_location_id") REFERENCES "item_locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_item_history" ADD CONSTRAINT "order_item_history_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
