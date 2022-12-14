
const express=require('express')
const { protect, restrictTo } = require('../controllers/authController')
const { getAllTours, addTours, getTour, updatedTour, deleteTour, checkID, checkBody, aliasTopTours, aliasTopLuxury, getTourStats, monthlyStats } = require('../controllers/tourController')


const router=express.Router()

// router.param('id',checkID)

router.route('/top-5-cheaps').get(aliasTopTours,getAllTours)
router.route('/top-5-luxury').get(aliasTopLuxury,getAllTours)

router.route('/tour-stats').get(getTourStats)
router.route('/monthly-stats/:year').get(monthlyStats)


router
.route('/')
.get(protect,getAllTours)
.post(addTours)

router
.route('/:id')
.get(getTour)
.patch(updatedTour)
.delete(protect,restrictTo("admin","lead-guide"),deleteTour)

module.exports=router
