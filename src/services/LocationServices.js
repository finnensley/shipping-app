export const getLocations = async (pool) => {
  const locations = await pool.query("SELECT * FROM locations");
  return locations.rows;
};

export const createLocation = async (pool, payload) => {
  const { location_number, location_name, description } = payload;
  const result = await pool.query(
    "INSERT INTO locations (location_number, location_name, description) VALUES ($1, $2, $3) RETURNING *",
    [location_number, location_name, description],
  );
  return result.rows[0];
};

export const updateLocation = async (pool, id, payload) => {
  const { location_number, location_name, description } = payload;
  const result = await pool.query(
    "UPDATE locations SET location_number=$1, location_name=$2, description=$3 WHERE id=$4 RETURNING *",
    [location_number, location_name, description, id],
  );
  return result.rows[0];
};

export const deleteLocation = async (pool, id) => {
  await pool.query("DELETE FROM locations WHERE id=$1", [id]);
};
