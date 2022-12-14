const AppError = require("../utils/appError");

const sendErrorDev = (err, res) => {
  if (err.name === "CastError") {
    res.status(400).json({
      status: 400,
      message: `Invalid ${err.path}:${err.value}`,
      error: err,
      stack: err.stack,
    });
  } else if (err.code === 11000) {
    res.status(400).json({
      status: 400,
      message: `Duplicate fields value ${
        err.keyValue.name || `"${err.keyValue.email}"`
      }.Please use another value.`,
      error: err,
      stack: err.stack,
    });
  } else if (err.name === "ValidationError") {
    const msg = Object.values(err.errors).map((el) => el.message);
    res.status(400).json({
      status: 400,
      message: `Invalid Input data.${msg.join(". ")}`,
      error: err,
      stack: err.stack,
    });
  }else if(err.name==="JsonWebTokenError"){

    res.status(401).json({
      status: 401,
      message: `Invalid token.Please Login again.`,
      error: err,
      stack: err.stack,
    });

  }else if(err.name==='TokenExpiredError'){
    res.status(401).json({
      status: 401,
      message: `Token expired.Please login again.`,
      error: err,
      stack: err.stack,
    });
    //  return new AppError('Token expired.Please login again',401)
  }
  
  else {
    console.log("UNKKNWON ERROR",err)
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
};

const handleCastErrorDb = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicate = (err) => {
  const message = `Duplicate fields value ${err.keyValue.name}.Please use other tours name`;
  return new AppError(message, 400);
};

const sendErrorProd = (err, res) => {
  //operational,trusted error:send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //Programming error:don't leak other error information
  } else {
    //1.Log error
    console.error("Error", err);
    res.status(err.statusCode).json({
      status: "error",
      message: "Something went very wrong",
    });
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    if (error.name === "CastError") error = handleCastErrorDb(error);
    if (error.code === 11000) error = handleDuplicate(error);
    if (error.name === "ValidationError") error = handleValidationDb(error);
    sendErrorProd(error, res);
  }

  next();
};
