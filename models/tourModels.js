const mongoose = require("mongoose");
const slugify = require("slugify");

const validator = require("validator");
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour name must not be empty"],
      unique: true,
      trim: true,
    },
    slug: String,
    durations: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
      validate: {
        validator: function (val) {
          return val <= 150;
        },
        message: "Group size shouldn't exced 150",
      },
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    difficulty: {
      type: String,
      trim: true,
      enum: {
        values: ["easy", "medium", "hard"],
        message: "Difficulty must be easy,medium or hard.",
      },

      required: [true, "A tour must have a difficulty "],
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour price must not be empty"],
    },
    priceDiscount: {
      type: Number,
      // validate:function(val){
      //         return val<this.price
      //     },

      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: "Discount price {{VALUE}} should be less than price.",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour summary must not be empty"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
    },
    startDates: {
      type: [Date],
      required: [true, "A tour Start must not be empty"],
    },

    //embedded documents
    startLocations: {
      //geoJSON:inorder to specify geospatial locations:
      type: {
        type: String,
        default: "Point",
        enum: {
          values: ["Point"],
          message: "Only 'Point' allowed",
        }
      },
      coordinates: [Number],//long first  and lat second(opposite of google map)
      address:String,
       description:String, 
    },
    locations:[//specifying array of an object which then will create brand new documents inside the parents which is tour 
        {
            type:{
                type:String,
                default:"Point",
                enum:{
                    values: ["Point"],
                    message: "Only 'Point' allowed",
                },

            },
            coordinates:[Number],
            address:String,
            description:String,
            day:Number//this is the day where people will go to this locations
        }
    ],
    //embeding tour guide docuemnts in tour documents
    guide:[
      
    ]
  },
  //when creating new tour document user will simple add of user id and we will get document basis of that id and add to tour document
  
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual("durationweeks").get(function () {
  return this.durations / 7;
});

//Document Middleware:runs before .save() & .create()
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();

  console.log(this);
});

// query middleware:To hide secret tour that can only be seen by VIPs
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// tourSchema.pre(/^find/,function(next){
//     this.find({price:{$ne:[{$gt:["$price",1000]}]}})
//         next()
//     })

tourSchema.pre("aggregate", function (next) {
  console.log(
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
  );
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
