const express = require('express');
require('dotenv').config();
const morgan = require('morgan');
const braintree = require('braintree');
const config = require('./config/index')(process.env.NODE_ENV);
const cors = require('cors');

const port = process.env.PORT || 3001;
const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.MERCHANT_ID,
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
});

app.post('/customer', (req, res) => {
  gateway.customer.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    company: req.body.company,
    email: req.body.email,
    phone: req.body.phone,
    creditCard: {
      cardholderName: req.body.cardholderName,
      cvv: req.body.cvv,
      expirationMonth: req.body.expirationMonth,
      expirationYear: req.body.expirationYear,
      number: req.body.number,
      options: {
        verifyCard: true,
      }
    },
    paymentMethodNonce: req.body.paymentMethodNonce,
  }).then(response => {
    if(response.success) return res.json(response) // Sending customer information
    return res.status(400).send(response) // Sending error message
  })
})

app.get('/customer/:id', (req, res) => {
  gateway.customer.find(req.params.id).then((customer) => {
    return res.json(customer)
  }).catch(error => {
    return res.status(404).send(error)
  })
})

app.post('/token', (req, res) => {
    gateway.clientToken.generate({
        customerId: req.body.customerId,
      }).then(response => {
        const clientToken = response.clientToken;
        res.json(clientToken);
      }).catch((error) => {
          res.json(error);
      })
})

app.post("/checkout", async (req, res) => {
    const paymentToken = req.body.paymentToken
    const nonce_create = await gateway.paymentMethodNonce.create(paymentToken);
    const nonce = nonce_create.paymentMethodNonce.nonce;

    gateway.subscription.create({
        paymentMethodNonce: nonce,
        planId:  req.body.planId,
      }).then(result => { 
        res.json(result);
      });
  });

app.listen(port, () => console.log(`Server started on port: ${port}`));

module.exports = app;
