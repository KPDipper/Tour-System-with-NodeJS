const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto=require('crypto')

const userSchema = new mongoose.Schema({

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
  password: {
    type: String,
    required: [true,"Password must be provided."],
    minLength: [8, "Password Must be atleast 8 characters"],
    select:false
  },

  photo: {
    type: String,
  },
  role:{

    type:String,
    enum:{
      values:['admin','guide','lead-guide','user'],
     message:"Can't select other than (admin,guide,lead-guide,user)."
    },
    default:'user'
  },

  passwordConfirm: {
    type: String,
    required: [true, "Please Confrim a password"],
    validate: {
      //This only works on SAVE
      validator: function (val) {
        return val === this.password;
      },
      message: "Pass & Confirm password must be same",
    },
  },
  passwordChangedAt:Date,
  passwordResetToken:String,
  PasswordResetExpires:Date,
  emailToken:String,
  emailTokenExpires:Date,
  active:{
    type:Boolean,
    default:true,
    select:false
  },
  isVerified:{
    type:Boolean,
    default:false,
    select:false
    
  }

});



userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next()
});

userSchema.pre('save',async function(next){
  if (!this.isModified("password") || this.isNew) return next();//only wroks when password is modifed not when nnew document is beong made

  this.passwordChangedAt=Date.now()-1000
  next()//saving to database is slower than issuing jsonweb token.//so now passchangedAt will save in database first then issued token

})


userSchema.pre(/^find/,async function(next){

  this.find({active:{$ne:false}})
  next()
})


// userSchema.methods.correctPassword=async function(candidatePassword,userPassword){
//   return await bcrypt.compare(candidatePassword,userPassword)
// }

//to find if user has changed the password after token was issued

userSchema.methods.changedPasswordAfter=function(JWTTimestamp){
if(this.passwordChangedAt){//if passchangedAt propert exist then we want to perform methods

  const changedTimstamp=parseInt(this.passwordChangedAt.getTime()/1000,10) 
  console.log(changedTimstamp,JWTTimestamp)
  return JWTTimestamp<changedTimstamp
}
//false means not changed
  return false;
}

userSchema.methods.createEmailVerificationToken=function(){

  const email_token=crypto.randomBytes(32).toString('hex')
  this.emailToken=crypto.createHash('sha256').update(email_token).digest('hex')
  this.emailTokenExpires=Date.now()+10*60*1000
  return email_token
}

userSchema.methods.createPasswordResetToken=function(){

  const resetToken=crypto.randomBytes(32).toString('hex')//send to the user via email

  this.passwordResetToken= crypto.createHash('sha256').update(resetToken).digest('hex')//encrypted version is going to be saved only database
  this.PasswordResetExpires=Date.now() +10*60*1000
  console.log({resetToken},this.passwordResetToken)
  return resetToken//returing plaintext token thhrough the email to user so that he can use new password

  
}

const User = mongoose.model("User", userSchema);
module.exports = User;
