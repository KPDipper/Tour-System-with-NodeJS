const express=require('express')
const { addguest, viewguest } = require('../controllers/guestCheckoutController')

const router=express.Router()


router.route('/').post(addguest)
router.route('/:id').get(viewguest)

module.exports=router