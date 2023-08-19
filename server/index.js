import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

app.use(cors());
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const dbConnectionUrl = process.env.CONNECTION_URL + 'lonca';

app.use(express.json());

mongoose.connect(dbConnectionUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB successfully');

const orderSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  cart_item: [{
    product: { type: String, required: true },
    variantId: { type: String, required: true },
    series: { type: String, required: true },
    item_count: { type: Number, required: true },
    quantity: { type: Number, required: true },
    cogs: { type: Number, required: true },
    price: { type: Number, required: true },
    vendor_margin: { type: Number, required: true },
    order_status: { type: String, required: true },
    _id: { type: String, required: true }
  }],
  payment_at: {
    type: Date,
    required: true
  }
});

const Order = mongoose.model('Order', orderSchema, 'orders');

app.get('/orders', (req, res) => {
    Order.find()
      .then((orders) => {
        res.json(orders);
      })
      .catch((error) => {
        console.log('Error retrieving orders:', error);
        res.status(500).send('Internal Server Error');
      });
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})
.catch((error) => {
  console.log('Error connecting to MongoDB:', error);
});