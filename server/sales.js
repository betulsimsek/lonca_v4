// Import necessary packages and libraries
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;
const dbConnectionUrl = process.env.CONNECTION_URL + 'lonca';

app.use(express.json());

mongoose.connect(dbConnectionUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
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
  
  // Updated /orders endpoint to accept vendor name as a query parameter
  app.get('/orders', (req, res) => {
    const { vendorName } = req.query;
  
    let filter = {}; // Default filter object for all orders
    if (vendorName) {
      filter['vendor.name'] = vendorName; // Add the vendor name to the filter object
    }
  
    Order.aggregate([
      { $unwind: "$cart_item" },
      {
        $lookup: {
          from: "parent_products",
          localField: "cart_item.product",
          foreignField: "_id",
          as: "parentProduct"
        }
      },
      { $unwind: "$parentProduct" },
      {
        $lookup: {
          from: "vendors",
          localField: "parentProduct.vendor",
          foreignField: "_id",
          as: "vendor"
        }
      },
      { $unwind: "$vendor" },
      {
        $match: filter // Apply the filter to the query
      },
      {
        $project: {
          product_id: "$cart_item.product",
          item_count: "$cart_item.item_count",
          parent_product_name: "$parentProduct.name",
          vendor_name: "$vendor.name",
          payment_at: 1 // Include the payment_at column in the projection
        }
      }
    ])
    .then(result => {
      res.send(result); // Send the result as the response
    })
    .catch(err => {
      res.status(500).send(err); // Send an error response if there is an error
    });
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

}).catch(error => {
  console.error('Error connecting to MongoDB:', error.message);
});
