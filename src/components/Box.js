import React from 'react'
import { useDrag } from 'react-dnd'

/**
 * Render draggable box
 *
 * @param {Object} data
 *
 * @return {*}
 * @constructor
 */
export const Box = ({ data }) => {
    const [, drag] = useDrag({ item: data })

    return (
        <div ref={drag} className="box">
            {data.title}
        </div>
    )
}
