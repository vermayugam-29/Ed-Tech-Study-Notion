const express = require('express');
const router = express.Router();

const {
    createCourse,
    getAllCourses,
    getCourseDetails
} = require('../controller/Course');

const {
    createCategory,
    getAllCategories,
    categoryPageDetails
} = require('../controller/Category');

const {
    createSection,
    updateSection,
    deleteSection
} = require('../controller/Section');

const {
    createSubSection,
    updateSubSection,
    deleteSubSection
} = require('../controller/SubSection');

const {
    createRating ,
    getAverageRating,
    getAllRatings
} = require('../controller/RatingAndReview');

const {auth , isStudent , isInstructor , isAdmin} = require('../middlewares/auth');

//Section routes
router.post('/createSection' , auth , isInstructor , createSection);
router.put('/updateSection' , auth , isInstructor , updateSection);
router.put('/deleteSection' , auth , isInstructor , deleteSection);

//Sub Section Routes
router.post('/createSubSection' , auth , isInstructor , createSubSection);
router.put('/updateSubSection' , auth , isInstructor , updateSubSection);
router.post('/deleteSubSection' , auth , isInstructor , deleteSubSection);

//Course routes
router.post('/createCourse' , auth , isInstructor , createCourse);
router.get('/getAllCourses' , getAllCourses);
router.get('/getCourseDetails' , getCourseDetails);

//Category routes
router.post('/createCategory' , auth , isAdmin , createCategory);
router.get('/getAllCategories' , getAllCategories);
router.get('/getCategoryPageDetails' , categoryPageDetails);

//rating routes
router.post('/createRating' , auth , isStudent , createRating);
router.get('/getAverageRating' , getAverageRating);
router.get('/getAllRatings' , getAllRatings);

module.exports = router