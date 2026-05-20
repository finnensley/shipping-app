export const getUsers = async (pool) => {
  const users = await pool.query("SELECT * FROM users");
  return users.rows;
};

export const createUser = async (pool, payload) => {
  const { username, email, password_hash, permissions } = payload;
  const result = await pool.query(
    "INSERT INTO users (username, email, password_hash, permissions ) VALUES ($1, $2, $3, $4) RETURNING *",
    [username, email, password_hash, permissions],
  );
  return result.rows[0];
};

export const updateUser = async (pool, id, payload) => {
  const { username, email, password_hash, permissions } = payload;
  const result = await pool.query(
    "UPDATE users SET username=$1, email=$2, password_hash=$3, permissions=$4 WHERE id=$5 RETURNING *",
    [username, email, password_hash, permissions, id],
  );
  return result.rows[0];
};

export const deleteUser = async (pool, id) => {
  await pool.query("DELETE FROM users WHERE id=$1", [id]);
};
