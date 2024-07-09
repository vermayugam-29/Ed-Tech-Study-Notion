import React from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa'
import HighlightText from './HighlightText'
import CustomBtn from './CustomBtn'
import banner from '../../../assets/Images/banner.mp4'


const Section1 = () => {
    return (
        <div className='max-w-maxContent relative mx-auto flex flex-col w-11/12 
        items-center text-white justify-between'>
            <Link to={'/signup'}>

                <div className='group mt-16  p-1 mx-auto rounded-full bg-richblack-800
                 font-bold text-richblack-200 transition-all duration-200 hover:scale-95
                 w-fit'>

                    <div className='flex items-center rounded-full gap-2
                    px-10 py-[5px] group-hover:bg-richblack-900'>

                        <p>Become an Instructor</p>
                        <FaArrowRight />

                    </div>

                </div>

            </Link>

            <div className='flex gap-1 text-center text-4xl font-semibold mt-10'>
                Empower Your Future With
                <HighlightText text={'Coding Skills'} />
            </div>

            <div className='w-[90%] text-center text-lg
            text-richblack-300 mt-4 font-bold '>
                With our online coding courses, you can learn at your own pace, from
                anywhere in the world, and get access to a wealth of resources,
                including hands-on projects, quizzes, and personalized feedback from
                instructors.
            </div>


            <div className='flex gap-4 mt-8'>
                <CustomBtn active={true} linkto={'/signup'}>
                    Learn More
                </CustomBtn>

                <CustomBtn active={false} linkto={'/login'}>
                    Book a demo
                </CustomBtn>
            </div>

            <div className='shadow-blue-200 mx-3 my-12'>

                <video
                muted
                loop
                autoPlay
                >
                    <source src={banner} type='video/mp4'/>
                </video>
                
            </div>


        </div>
    )
}

export default Section1
