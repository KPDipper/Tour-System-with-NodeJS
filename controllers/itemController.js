const Items=require('../models/itemsmodel')



exports.getAllItems = async (req, res) => {

   try{
    const items = await Items.find().populate("guestUser")

    res.status(200).json({
      staus: "SUCCESS",
      result: items.length,
      data: {
        items,
      },
    });
}
catch(error){

    res.status(404).json({
        status:"FAIL",
        message:err.message

    })
} 
}

exports.addItems = (async (req, res) => {
  
  try{
    const items = await Items.create(req.body)

    res.status(201).json({
      status: "SUCCESS",
      result: items.length,
      data: {
        items
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



);
exports.getItem = (async (req, res,next) => {
 
  try{
    const item = await Items.findById(req.params.id).populate("guestUser")

    if (!item) {
      return  res.status(404).json({
        status: "FAIL",
        message: "Item with this ID not found",
      });
      }
   

    res.status(200).json({
      status: "SUCCESS",
      result: item.length,
      data: {
        item,
      },
    });
  }
  catch(err){
    return res.status(404).json({
      status:"FAIL",
      message:err.message
    })
  }

    
 
});

exports.updatedItem = (async (req, res,next) => {

  try{
    const item = await Items.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("guestUser");

    if (!item) {
      return  res.status(404).json({
        status: "FAIL",
        message: "Item with this ID not found",
      });
      }

    res.status(200).json({
      status: "SUCCESS",
      data: {
        item,
      },
    });
  }
  catch(error){
    return res.status(404).json({
      status:"FAIL",
      message:err.message
    })
  }


  
});

exports.deleteItem = (async (req, res,next) => {
  
  try{
 const item = await Items.findByIdAndDelete(req.params.id);

    if (!item) {
        return  res.status(404).json({
          status: "FAIL",
          message: "Item with this ID not found",
        });
      }

    res.status(204).json({
      status: "SUCCESS",
      data: "Successfully deleted",
    });
  }
  catch(err){
    return res.status(404).json({
      status:"FAIL",
      message:err.message
    })
  }


  
});

