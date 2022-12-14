const Joi=require('joi')

exports.validateCourse=(e)=>{

    const schema=Joi.object({

        name:Joi.string().min(3).required(),
        // type:Joi.string().valid('hello',"there")
    })
    
    return schema.validate(e)
}
