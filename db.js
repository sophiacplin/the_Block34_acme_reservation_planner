const pg = require('pg')
const client = new pg.Client(process.env.DATABASE_URL ||'postgres://localhost/acme_reservations')
const uuid = require('uuid')

const createTables = async () => {
  const SQL = `
  DROP TABLE IF EXISTS reservations;
  DROP TABLE IF EXISTS customers;
  DROP TABLE IF EXISTS restaurants;
  CREATE TABLE customers(
    id UUID PRIMARY KEY NOT NULL,
    name VARCHAR(50) NOT NULL
  );
  CREATE TABLE restaurants(
    id UUID PRIMARY KEY NOT NULL,
    name VARCHAR(50) NOT NULL
  );
  CREATE TABLE reservations(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    party_count INTEGER NOT NULL,
    customer_id UUID REFERENCES customers(id) NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id) NOT NULL
  );
  `
  await client.query(SQL)

}

const createCustomer = async (customerName) => {
  const SQL = `
  INSERT INTO customers(id, name) VALUES($1, $2)
  RETURNING *;`
  const response = await client.query(SQL, [uuid.v4(), customerName])
  return response.rows[0]
};

const createRestaurant = async(restaurantName) => {
  const SQL = `
  INSERT INTO restaurants(id, name) VALUES($1, $2)
  RETURNING *;`
  const response = await client.query(SQL, [uuid.v4(), restaurantName])
    return response.rows[0];
};

const fetchCustomers = async () =>{
  const SQL = `
  SELECT *
  FROM customers`;
    const response = await client.query(SQL);
    return response.rows;
};

const fetchRestaurants = async () => {
  const SQL = `
  SELECT *
  FROM restaurants
  `;
  const response = await client.query(SQL);
  return response.rows;
}

const createReservations = async ({date, party_count, customer_id, restaurant_id}) => {
  const SQL = `
  INSERT INTO reservations(id, date, party_count, customer_id, restaurant_id) VALUES($1, $2, $3, $4, $5)
  RETURNING *`;
  const response = await client.query(SQL, [uuid.v4(), date, party_count, customer_id, restaurant_id]);
  return response.rows[0];
};

const fetchReservations = async () => {
  const SQL = `
  SELECT *
  FROM reservations
  `;
  const response = await client.query(SQL);
  return response.rows;
}

const destroyReservations = async ({id, customer_id}) => {
  console.log(id, customer_id)
  const SQL = `
  DELETE FROM reservations
  WHERE id = $1 AND customer_id = $2
  `;
  await client.query(SQL, [id, customer_id]);
};

module.exports = {client, createTables, createCustomer, createRestaurant, fetchCustomers, fetchRestaurants, createReservations, fetchReservations, destroyReservations}