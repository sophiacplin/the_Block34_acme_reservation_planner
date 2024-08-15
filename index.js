const express = require('express')
const app = express()
const {client, createTables, createCustomer, createRestaurant, fetchCustomers, fetchRestaurants, createReservations, fetchReservations, destroyReservations} = require('./db')

app.get('/api/customers', async(req, res, next) => {
  try{
    res.send(await fetchCustomers());
  }catch(err){
    next(err);
  }
});

app.get('/api/restaurants', async(req, res, next) => {
  try{
    res.send(await fetchRestaurants());
  }catch(err){
    next(err);
  }
});

app.get('/api/reservations', async(req, res, next) => {
  try{
    res.send(await fetchReservations());
  }catch(err){
    next(err);
  }
});

app.delete('/api/customers/:customer_id/reservations/:id', async(req, res, next) => {
  try{
    await destroyReservations({customer_id: req.params.customer_id, id: req.params.id});
    res.sendStatus(204);
  }catch(err){
    next(err);
  }
});

app.post('/api/customers/:customer_id/reservations', async (req, res, next) => {
  try{
    res.status(201).send(await createReservations({date: req.params.date, party_count: req.params.party_count, customer_id: req.params.customer_id, restaurant_id: req.params.restaurant_id}));
  }catch(err){
    next(err);
  }
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).send({error: err.message || err});
});


const init = async () => {
  await client.connect()
  console.log('Connected to database')
  await createTables()
  console.log('Tables created')
  const[Sophia, Lina, Ryan, Rachel, Nikki, Ray, OliveGarden, Applebees, Fridays, RedLobster, TexasRoadHouse] = await Promise.all([
    createCustomer('Sophia'),
    createCustomer('Lina'),
    createCustomer('Ryan'),
    createCustomer('Rachel'),
    createCustomer('Nikki'),
    createCustomer('Ray'),
    createRestaurant('OliveGarden'),
    createRestaurant('Applebees'),
    createRestaurant('Fridays'),
    createRestaurant('RedLobster'),
    createRestaurant('TexasRoadHouse')
  ]);
  console.log(await fetchCustomers());
  console.log(await fetchRestaurants());

  const [reservation01, reservation02] = await Promise.all([
    createReservations({
      date:'12/25/2025',
      party_count:'6',
      customer_id: Nikki.id,
      restaurant_id: Applebees.id
    }),
    createReservations({
      date:'09/07/2024',
      party_count:'3',
      customer_id: Ryan.id,
      restaurant_id: Fridays.id
    }),
  ]);
  console.log(await fetchReservations());
  const reservation = await fetchReservations();
  await destroyReservations({id: reservation.id, customer_id: reservation.customer_id});
  console.log(await fetchReservations());

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
  })
};



init()