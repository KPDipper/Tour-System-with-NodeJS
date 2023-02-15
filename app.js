const express=require('express')

const app=express()

const morgan=require('morgan')
const globalErrorHandler=require('./controllers/errorController')
const AppError=require('./utils/appError')
const userRouter=require('./routes/userRoute')
const itemsRoute=require("./routes/itemRoute")
const guestUserRoute=require("./routes/guestUserRoute")



//1.middleware
app.use(morgan('dev'))

app.use(express.json())
app.use(express.static(`${__dirname}/public`))



app.use('/api/v1/items',itemsRoute)
app.use('/api/v1/guestuser',guestUserRoute)
app.use('/api/v1/users',userRouter)

//here first route handler run and if doens't find any route then tis middleware runs
app.all('*',(req,res,next)=>{
  
    res.status(404).json({
        status:"FAIL",
        message:`Can't find ${req.originalUrl} on this server`
    })
    // const err=new Error(`Can't find ${req.originalUrl} on this server`)
    // err.status='FAIL';
    // err.statusCode=404
    // next(err)//it will assume it is an error and it will skip all the middleware stack and send he error in the global error handling middleware
    // // //which is below

})


app.use(globalErrorHandler)

module.exports=app