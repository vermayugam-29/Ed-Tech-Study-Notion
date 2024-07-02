const Category = require('../models/Category');
const Course = require('../models/Course');

//create a Category
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }
        

        const checkCategoryWithSameName = await Category.findOne({name});
        if(checkCategoryWithSameName){
            return res.status(400).json({
                success : false,
                message : 'There already exists a category with same name , please try with differnt name'
            })
        }

        const category = await Category.create(
            { name, description }
        );

        res.status(200).json({
            success: true,
            message: 'Category created Successfully'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Something went wrong while creating a Category'
        })
    }
}

//get all Category
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json({
            success: true,
            message: 'All categories are fetched successfully',
            data: categories
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong while fetching categories'
        })
    }
}

//category page details section
exports.categoryPageDetails = async (req, res) => {
    try {
        const { categoryId } = req.body;

        //courses for selected category
        const selectedCategory = await Category.findById(categoryId)
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: "ratingAndReviews",
            })
            .exec()

        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: 'No course for this category'
            })
        }

        if (selectedCategory.courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No courses found for the selected category.",
            })
        }

        //get courses for diff category - recheck this code
        const diffCategories = await Category.find({
            _id: { $ne: categoryId } //ne means not equal 
        }).populate('courses').exec();



        //get top selling courses - remainder
        const allCategories = await Category.find()
            .populate({
                path: "courses",
                match: { status: "Published" },
            })
            .exec();

        const allCourses = allCategories.flatMap((category) => category.courses)
        const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10)

        res.status(200).json({
            success: true,
            data: {
                selectedCategory: selectedCategory,
                diffCategories: diffCategories,
                mostSellingCourses : mostSellingCourses
            },
            message: 'Successfully fetched courses related to your desired category'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong while fetching courses related to categoryId',
            error: error.message
        })
    }
}