    const SubSection = require('../models/SubSection');
const Section = require('../models/Section');
const { uploadToCloudinary } = require('../utils/imageUploader');
require('dotenv').config();

exports.createSubSection = async(req , res) => {
    try {
        const {
            sectionId ,
            title,
            timeDuration,
            description
        }
        = req.body;

        const video = req.files.video;

        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success : false,
                message : 'All fields are required'
            })
        }

        const uploadDetails = await uploadToCloudinary(video , process.env.FOLDER_NAME);

        const subSectionDetails = await SubSection.create(
            {title , timeDuration , description , videoUrl : uploadDetails.secure_url}
        );

        await Section.findByIdAndUpdate(
            {_id : sectionId},
            {$push : {subSection : subSectionDetails._id}},
            {new : true}
        )

        res.status(200).json({
            success : true,
            message : 'Sub Section created successfully',
            data : subSectionDetails
        })
    } catch (error) {
        res.status(500).json({
            success : false,
            message : 'Something went wrong while creating sub section , please try again later',
            error : error.message
        })
    }
}

exports.updateSubSection = async(req , res) => {
    try {
        const { subSectionId , title , description} = req.body;
        const subSection = await Section.findById(subSectionId);

        if(!subSection){
            return res.status(400).json({
                success : false,
                message : 'No such subsection found'
            })
        }

        if(title !== undefined) {
            subSection.title = title;
        } 
        if(description !== undefined){
            subSection.description = description;
        }

        if(req.files && req.files.video !== undefined) {
            const video = req.files.video;
            const uploadDetails = await uploadToCloudinary(video , process.env.FOLDER_NAME);

            subSection.videoUrl = uploadDetails.secure_url;
            subSection.timeDuration = `${uploadDetails.duration}`;
        }

        await subSection.save();

        res.status(200).json({
            success : true,
            message : 'Sub Section updated successfully',
            data : subSection
        })
    } catch (error) {
        res.status(500).json({
            success : false,
            message : 'Something went wrong while updating sub section , please try again later',
            error : error.message
        })
    }
}

exports.deleteSubSection = async(req , res) => {
    try {
        const {sectionId , subSectionId} = req.body;

        if(!subSectionId || !sectionId){
            return res.status(400).json({
                success : false,
                message : 'Please provide with all the details to delete subsection'
            })
        }

        const deletedSubSection = await SubSection.findByIdAndDelete(
            {_id : subSectionId}
        );

        if(!deletedSubSection){
            return res.status(404).json({
                success : false,
                message : 'No such subsection found'
            })
        }

        const updatedSection = await Section.findByIdAndUpdate(
            {_id : sectionId},
            {$pull : {subSection : subSectionId}},
            {new : true}
        )

        res.status(200).json({
            success : true,
            message  : 'Sub Section deleted successfully',
            data : deletedSubSection
        })
    } catch (error) {
        res.status(500).json({
            success : false,
            message : 'Something went wrong while deleting sub section , please try again later',
            error : error.message
        })
    }
}