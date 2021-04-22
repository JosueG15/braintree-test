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

app.get('/', (req, res) => {
    gateway.clientToken.generate({
        customerId: 101219085
      }).then(response => {
        // pass clientToken to your front-end
        const clientToken = response.clientToken;
        res.json(clientToken);
      }).catch((error) => {
          res.json(error);
      })
})

app.post("/checkout", async (req, res) => {
    const nonceFromTheClient = req.body.payment_method_nonce;
    const nonce_create = await gateway.paymentMethodNonce.create('7xfssqg');
    const nonce = nonce_create.paymentMethodNonce.nonce;
    // Use payment method nonce here
    gateway.subscription.create({
        paymentMethodNonce: nonce,
        planId: '6fsm',
      }).then(result => { 
        res.json(result);
      });

    // gateway.transaction.sale({
    //     amount: "10.00",
    //     paymentMethodNonce: nonceFromTheClient,
    //     options: {
    //       submitForSettlement: true
    //     }
    //   }).then(transaccionResult => {
    //       res.json(transaccionResult);
    //    });
  });

// app.use('/api', apiControllers);

//  app.use(express.static(path.join(__dirname, 'client')));
// app.use(express.static(path.join(__dirname, 'logo')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(`${__dirname}/client/index.html`));
// }); 

app.listen(port, () => console.log(`Server started on port: ${port}`));

module.exports = app;
