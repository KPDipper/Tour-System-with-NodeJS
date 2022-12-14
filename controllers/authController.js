const User = require("../models/userModels");
const catchAsync = require("../utils/catchAsyncError");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/appError");
const { promisify } = require("util");
const sendEmail = require("../utils/emails");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create(req.body);
  //     name:req.body.name,

  const emailtoken = newUser.createEmailVerificationToken();

  await newUser.save({ validateBeforeSave: false });

  const emailUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/verifyemail/${emailtoken}`;

  const message = `This is verfication email.Click here to verify your email.${emailUrl}`;

  try {
    await sendEmail({
      email: newUser.email,
      subject: "Your Email verfication",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email for verfication.",
      data: {
        newUser,
      },
    });
  } catch (err) {
    (newUser.emailToken = undefined), (newUser.emailTokenExpires = undefined);
    await newUser.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sending the email.Try again later", 500)
    );
  }

  
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  console.log("hashedToken", hashedToken);

  const user = await User.findOne({
    emailToken: hashedToken,
    emailTokenExpires:{$gt:Date.now()}
  });
  if (!user) {
    return next(new AppError("Token is invalid or has expired"), 400);
  }

  user.emailToken = undefined 
  user.emailTokenExpires = undefined
  user.isVerified = true;
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id);

  res.status(200).json({
    status: "SUCCESS",
    token:token
    
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  console.log("email", email);
  //1.check if email and password exist

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  //2.check if the user exist &&  password is correct

  const user = await User.findOne({ email }).select("+password");
  if (user.isVerified === false) {
    return next(new AppError("User is not verified", 401));
  }

  //we have to awaitbcrypt here since if user is not found then error will show us null as user doesnt exist in first place
  //so if we perform this code then user will be not found and give us error before running second code.
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  //3.if everything is ok send the token
  const token = signToken(user._id);

  res.status(200).json({
    status: "SUCCESS",
    token: token,
  });
});

//grant access to  protected routes

exports.protect = catchAsync(async (req, res, next) => {
  //1.Getting token and check of it's there

  //common pratice is to send the token using httpheaders with the request

  let token;
  if (
    req.headers.authorization &&
    (req.headers.authorization.startsWith("Bearer") ||
      req.headers.authorization.startsWith("bearer"))
  ) {
    token =
      req.headers.authorization.split(" ")[1] || req.headers.authorization;
  }
  if (!token) {
    return next(
      new AppError("You are not logged in.Please logged in to get access.", 401)
    );
    //bacially means that user have given right access but isn't login to get that access
  }

  //2.Validate token :JWT algorithm verifies if the signature is valid or not(verification) also expires

  //which means nobody tries to change the payload which is user Id
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //returns the payload

  //3.Check if user still exist or not(who want to access the route)
  const currentUser = await User.findById(decoded.id); //here if token was not verfied then we would not have got id as payload
  if (!currentUser) {
    return next(new AppError("User beloging to this token doesn't exist"), 401);
  }

  //4.Check if user changed the password after jwttoken was issued
  //here if issued date for token is less than passwordchanged date then Token will not work anymore

  if (currentUser.passwordChangedAt) {
    const changedTimstamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (decoded.iat < changedTimstamp) {
      return next(
        new AppError("User recently changed the password!.Please Login again"),
        401
      );
    }
  }

  // if(currentUser.changedPasswordAfter(decoded.iat)){
  //     return next(new AppError('User recently changed the password!.Please Login again'),401)
  // }

  //now grant access
  req.user = currentUser;
  next();
});

//Authorizations:
exports.restrictTo = (...roles) => {
  //here ...roles=['admin','lead-guide] so if current user role is otherwise than these then it will give unatuhorized error.
  return (req, res, next) => {
    //here return function will get access to roles paramter up there since it is a closure
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to perform this action", 403)
      );
    }

    next();
  };
};
//user send post request to forget password only with email address
//then this will create a reset token and send that to email address that was provided(random not JSON web token)
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1.GET user baded on posted email

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with this email Address", 404));
  }

  //2.Genereated random reset token
  const resetToken = user.createPasswordResetToken(); //gives us plain text token which will be send to user via token
  console.log("reserTokenss", resetToken);
  await user.save({ validateBeforeSave: false }); //here this will hepls us to cancel all validations

  console.log(user.email);

  //3.Send it back as an email
  //user will click on these email and will be able to do request from there
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetpassword/${resetToken}`;

  const message = `Forgot your password? submit a PATCH request with your new password and passwordConfirm to:${resetUrl}.\n If you didn't forget
    your password please ignore this email!.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token",
      message,
    });
    res.status(200).json({
      status: "SUCCESS",
      message: "Token sent to email.",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.PasswordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.log("error", err);
    return next(
      new AppError("There was an error sending the email.Try again later", 500)
    );
  }
});

//user then sends that token from his emails along with new password in order to update the password
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1.get user based on reset token

  //encrypt the token again and comapre to the encrypted token in the database
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    PasswordResetExpires: { $gt: Date.now() },
  });

  //2.if token has not expired and then user can set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired"), 400);
  }

  user.password = req.body.password; //passing via body
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.PasswordResetExpires = undefined;
  await user.save();

  //3.update changepasswordAt proprty for the current user

  //4.log the user in,sendJWT
  const token = signToken(user._id);

  res.status(200).json({
    status: "SUCCESS",
    token: token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1.GET USER FROM COLLECTION

  const { passwordCurrent } = req.body;
  const user = await User.findById(req.user.id).select("+password"); //only for logged in user//from protect middleware

  console.log("Checking User", user);

  //2.CHECK IF USER POSTED CURRENT PASSWORD IS CORRECT
  if (!(await bcrypt.compare(passwordCurrent, user.password))) {
    return next(new AppError("Your password is wrong", 401));
  }

  //IF SO UPDATE THE PASSWORD
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //4.LOG USER IN
  const token = signToken(user._id);

  res.status(200).json({
    status: "SUCCESS",
    token,
  });
});
