import React from 'react'

const HighlightText = (props) => {
    return (
        <span className='font-bold text-richblue-200'>
            {props.text}
        </span>
    )
}

export default HighlightText
