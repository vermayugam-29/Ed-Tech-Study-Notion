const Section = require('../models/Section');
const Course = require('../models/Course');
const SubSection = require('../models/SubSection');

exports.createSection = async(req , res) => {
    try {
        const {sectionName , courseId} = req.body;

        if(!sectionName || !courseId){
            return res.status(400).json({
                success : false,
                message : 'Please provide all the details'
            })
        }

        const newSection = await Section.create({sectionName});

        const updatedCourse = await Course.findByIdAndUpdate(
            {_id : courseId},
            {$push : {courseContent : newSection._id}},
            {new : true}
        );

        res.status(200).json({
            success : true,
            message : 'Section added successfully to course',
            data : newSection
        })
    } catch (error) {
        res.status(500).json({
            success : false,
            message : 'Someting went wrong while creating section , please try again later',
            error : error.message
        })
    }
}

exports.updateSection = async(req , res) => {
    try {
        const {sectionName , sectionId} = req.body;

        if(!sectionId || !sectionName){
            return res.status(400).json({
                success : false,
                message : 'Please provide with all the details to update the section'
            })
        }

        const updateSection = await Section.findByIdAndUpdate(
            {_id : sectionId},
            {sectionName},
            {new : true}
        );

        res.status(200).json({
            success : true ,
            message : 'Section updated successfully',
            data : updateSection
        })
    } catch (error) {
        res.status(500).json({
            success : false,
            message : 'Something went wrong while updating section please try again later',
            error : error.message
        })
    }
}

exports.deleteSection = async(req , res) => {
    try {
        const {sectionId} = req.body;

        if(!sectionId){
            return res.status(400).json({
                success : false,
                message : 'Please provide with section id to delete section'
            })
        }
        const section = await Section.findById(sectionId);
        if(!section) {
            return res.statius(404).json({
                success : false,
                message : 'No such section found'
            })
        };
        await Section.findByIdAndDelete(sectionId);
        await Course.findOneAndUpdate(
            { courseContent: sectionId },
            { $pull: { courseContent: sectionId } },
            { new: true }
        );

        await SubSection.deleteMany({_id: {$in: section.subSection}});
        res.status(200).json({
            success : true,
            message : 'Section deleted successfully'
        })
    } catch (error) {
        res.status(500).json({
            success : false,
            message : 'Something went wrong while deleting section , please try again later',
            error : error.message
        })
    }
}