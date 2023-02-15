const mongoose = require("mongoose");
const validator = require("validator");

const { ObjectId } = mongoose.Schema;

// Define the schema for guest checkout data
const GuestCheckoutSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "UserName must be provided"],
      minLength: [4, "Must be atleast 4 characters."],
      maxLength: [20, "Should not cross 20 characters."],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email Must be provided."],
      trim: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please Provide a valid Email"],
    },
    address: {
      type: String,
      required: [true, "Address must be provided"],
      minLength: [3, "Must be atleast 3 characters."],
      maxLength: [20, "Should not cross 20 characters."],
      trim: true,
    },

    phoneNumber: {
      type: Number,
      required:true,
    },
    role:{
      type:String,
      enum:{
        values:['guest'],
       message:"Only guest"
      },
      default:"guest"
    }
   
  },
  {timestamps: true}
);

// Create the model for guest checkout data
// const GuestCheckout = mongoose.model("GuestCheckout", GuestCheckoutSchema);


const GuestCheckout = mongoose.model("GuestCheckout", GuestCheckoutSchema);
module.exports = GuestCheckout;
