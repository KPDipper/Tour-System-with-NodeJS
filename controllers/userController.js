const User = require("../models/userModels")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsyncError")

const filterObj=(obj,...allowFileds)=>{

    const newObject={}
    Object.keys(obj).forEach(el=>{
        if(allowFileds.includes(el)) newObject[el]=obj[el]

    })
    return newObject
}

exports.getAllusers= catchAsync(async(req,res)=>{

    const user = await User.find()

    res.status(200).json({
    status:"SUCCESS",
    data:{
        user
    }
   })
})

exports.updateMe=catchAsync(async(req,res,next)=>{

    //1.create error if user Post Password data
   if(req.body.password || req.body.passwordConfirm){
    return  next(new AppError("This route is not for password updating"),400)
   }


     //filter out unwanted fileds name that are not allwoed to be update
     const filteredBody=filterObj(req.body,"name","email","photo")
     
     
    //2.update user data account
     const updateUser= await User.findByIdAndUpdate(req.user.id,filteredBody,{
        new:true,
        runValidators:true
     })

    res.status(200).json({
        status:"SUCCESS",
        message:"Updated User",
        data:{
           updateUser
        }
    })
})

exports.deleteMe=catchAsync(async(req,res)=>{

    await User.findByIdAndUpdate(req.user.id,{active:false})

    res.status(204).json({
        status:"SUCCESS",
        data:null
    })
})

exports.getuser=catchAsync(async(req,res)=>{

    const user= await User.findById(req.params.id)
    res.status(200).json({
     status:"SUCCESS",
     data:{
         user
     }
    })
})