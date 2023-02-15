const dotenv=require('dotenv')
dotenv.config({path:'./config.env'})

process.on('uncaughtException',err=>{
    console.log(err.name,err.message)
    console.log("UNHANDLER EXCEPTION SHUTTING DOWN...")
        process.exit(1)//0 stand for success
})



const app=require('./app')

// console.log(process.env)


const db=require('./database')


const port=process.env.PORT || 5000
const server=app.listen(port,()=>{
    console.log(`App running on port ${port}...`)
})   

//golbally handle unhandle rejected promises
//event and eventlistners
//process object will emit an object called unhandled rejection//then we can subscibe to that rejection

process.on('unhandledRejection',err=>{
    console.log(err.name,err.message)
    console.log("UNHANDLER REJECTION SHUTTING DOWN...")
    server.close(()=>{
        process.exit(1)//0 stand for success
    })
})

// console.log(aa)
