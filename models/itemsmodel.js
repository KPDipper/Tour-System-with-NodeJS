const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

// Define the schema for guest checkout data
const itemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, "ItemName must be provided"],
      minLength: [4, "Must be atleast 3 characters."],
      maxLength: [20, "Should not cross 20 characters."],
      trim: true,
    },
    itemDescrption: {
      type: String,
      required: [true, "ItemDescrption must be provided"],
      minLength: [10, "Must be atleast 10 characters."],
      maxLength: [100, "Should not cross 20 characters."],
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
    },
    guestUser: {
      type: ObjectId,
      required: true,
      ref: "GuestCheckout",
    },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);
module.exports = Item;
