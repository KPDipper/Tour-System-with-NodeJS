const Guest=require('../models/guestCheckoutmodel')
const Item=require('../models/itemsmodel')




exports.addguest = async (req, res) => {
  
    try{
      const guest = await Guest.create(req.body);
  
      res.status(201).json({
        status: "SUCCESS",
        result: guest.length,
        data: {
          guest
        },
      });
  
    }
    catch(err){
      return res.status(404).json({
        status:"FAIL",
        message:err.message
      })
    }
  }

  exports.checkGuest=async(req,res,next)=>{

    const guest = await Guest.findById(req.params.id);


    if(guest.email===req.body.email){
        return res.status(404).json({
            status:"FAIL",
            message:"Guest emails must be prvoided for checkout."
        })
    }

    if(guest.role!=="guest"){
        return res.status(404).json({
            status:"FAIL",
            message:"Only guest user can checkout "
        })
    }
    
  }

  exports.viewguest=async(req,res)=>{

    try{
        const guest = await Guest.findById(req.params.id);
        if (!guest) {
            return  res.status(404).json({
              status: "FAIL",
              message: "Guest User with this ID not found",
            });
            }
    
        res.status(201).json({
          status: "SUCCESS",
          result: guest.length,
          data: {
            guest
          },
        });
    
      }
      catch(err){
        return res.status(404).json({
          status:"FAIL",
          message:err.message
        })
      }
    
  }


//   exports.placeOrder=async(res,res)=>{
//     try{

       
//     }
//     catch(err){

//     }
//   }
  
  