const mongoose=require('mongoose')


mongoose.connect(process.env.DATABASE,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then((con)=>{
    console.log("Eastblish Connection with database")
}).catch((err)=>{
    console.log("Can't Connected to Database")
})


