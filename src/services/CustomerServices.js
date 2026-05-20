export const getCustomers = async (pool) => {
  const customers = await pool.query("SELECT * FROM customers");
  return customers.rows;
};

export const createCustomer = async (pool, payload) => {
  const { name, email, phone } = payload;
  const result = await pool.query(
    "INSERT INTO customers (name, email, phone ) VALUES ($1, $2, $3) RETURNING *",
    [name, email, phone],
  );
  return result.rows[0];
};

export const updateCustomer = async (pool, id, payload) => {
  const { name, email, phone } = payload;
  const result = await pool.query(
    "UPDATE customers SET name=$1, email=$2, phone=$3 WHERE id=$4 RETURNING *",
    [name, email, phone, id],
  );
  return result.rows[0];
};

export const deleteCustomer = async (pool, id) => {
  await pool.query("DELETE FROM customers WHERE id=$1", [id]);
};
