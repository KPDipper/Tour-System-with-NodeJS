const Tour = require("./../models/tourModels");
const API = require("../utils/apifeatures");
const Joi = require("joi");
const AppError = require("../utils/appError");
const { validateCourse } = require("../validation.js/tourValidation");
const catchAsync = require("../utils/catchAsyncError");

exports.aliasTopTours = (req, res, next) => {
  req.query = {
    ...req.query,
    limit: 5,
    sort: "-ratingAverage,price",
    fields: "name,price,ratingAverage,summary,difficulty",
  };
  next();
};

exports.aliasTopLuxury = (req, res, next) => {
  req.query = {
    ...req.query,
    limit: 5,
    sort: "-ratingAverage,-price",
    fields: "name,price,ratingAverage,summary,difficulty",
  };
  next();
};

// const Category = require('../Model/category');

// exports.addCategory = async (req, res) => {
//   let category = new Category(req.body);

//   try {
//     const existingCategory = await Category.findOne({
//       category_name: category.category_name,
//     });

//     if (existingCategory) {
//       return res.status(400).json({ error: 'Category already exists' });
//     }



exports.getAllTours = catchAsync(async (req, res) => {
  
    const features = new API(Tour.find(), req.query)
      .filter()
      .sort()
      .limitfields()
      .pagination();

    const tours = await features.query;

    res.status(200).json({
      staus: "SUCCESS",
      requestedAt: req.time,
      result: tours.length,
      data: {
        tours,
      },
    });

    // next(new AppError(err, 404));

  
});

exports.addTours = catchAsync(async (req, res, next) => {
  
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: "SUCCESS",
      result: newTour.length,
      data: {
        tours: newTour,
      },
    });

    // next(new AppError(err, 404));
  }

);
exports.getTour = catchAsync(async (req, res,next) => {
 
    const tour = await Tour.findById(req.params.id).select("-__v -secretTour");

    if (!tour) {
      return next(new AppError("No tour found with that Id", 404));
    }

    res.status(200).json({
      status: "SUCCESS",
      result: tour.length,
      data: {
        tour,
      },
    });

    // return next(new AppError(err, 404));
    
 
});

exports.updatedTour = catchAsync(async (req, res,next) => {

    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!tour) {
        return next(new AppError("No tour found with that Id", 404));
      }

    res.status(200).json({
      status: "SUCCESS",
      data: {
        newtour: tour,
      },
    });

    // return next(new AppError(err, 404));
  
});

exports.deleteTour = catchAsync(async (req, res,next) => {
  
 const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
        return next(new AppError("No tour found with that Id", 404));
      }

    res.status(204).json({
      status: "SUCCESS",
      data: "Successfully deleted",
    });


  
});

exports.getTourStats = catchAsync(async (req, res,next) => {
  
    const stats = await Tour.aggregate([
      {
        $match: {
          ratingAverage: { $gte: 4.5 },
        },
      },
      {
        $group: {
          _id: "$difficulty", //gives all statics for difficulty fileds
          numTour: { $sum: 1 },
          avgRating: { $avg: "$ratingAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          totalPrice: { $sum: "$price" },
        },
      },
      {
        $sort: { avgPrice: -1 },
      },
      //  {
      // //    $match:{_id:{$ne:"easy"}}
      //  }
    ]);

    res.status(200).json({
      status: "SUCCESS",
      data: {
        stats,
      },
    });
 
});

// exports.weeklyStats=catchAsync(async(req,res,next)=>{

//   const week=parseInt(req.params.week)
//   if(week===0 && week<8){
//    return next(new AppError("Invalid week"),401)
//   }

//   const stat=await Tour.aggregate([
//     {

//     }
//   ])
// })

exports.monthlyStats = catchAsync(async (req, res,next) => {
 
    const year = parseInt(req.params.year);
    console.log("year", year);
    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates",
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-6-30`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$startDates" },
          numToursStart: { $sum: 1 },
          tours: { $push: "$name" },
        },
      },
      {
        $addFields: { month: "$_id" },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { numToursStart: 1 },
      },
      {
        $limit: 10,
      },
    ]);
    res.status(200).json({
      status: "SUCCESS",
      data: {
        plan,
      },
    });
});
