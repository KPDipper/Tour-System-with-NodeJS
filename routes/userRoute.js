const express=require('express')
const { signup, login, forgotPassword, resetPassword, updatePassword, protect, verifyEmail } = require('../controllers/authController')
const { getAllusers, createuser, getuser, updateMe, deleteMe } = require('../controllers/userController')

const router=express.Router()


router.post('/signup',signup)
router.get('/verifyemail/:token',verifyEmail)
router.post('/login',login)
router.post('/forgotpassword',forgotPassword)
router.patch('/resetpassword/:token',resetPassword)
router.patch('/updatemypassword',protect,updatePassword)
router.patch('/updateme',protect,updateMe)//id comes from  request user whuch will be provided to updateMek
router.delete('/deleteme',protect,deleteMe)


router.route('/').get(getAllusers)
router.route('/:id').get(getuser) 

module.exports=router