const express=require('express')
const { protect, restrictTo } = require('../controllers/authController')
const { addItems, getAllItems, getItem, updatedItem, deleteItem } = require('../controllers/itemController')

const router=express.Router()


router.route('/').post(protect,restrictTo("admin"),addItems).get(protect,restrictTo("admin"),getAllItems)
router.route('/:id').get(protect,restrictTo("admin"),getItem).patch(protect,restrictTo("admin"),updatedItem).delete(protect,restrictTo("admin"),deleteItem)

module.exports=router