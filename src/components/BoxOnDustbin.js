import React from 'react'
import { useDrag } from 'react-dnd'
import { ItemTypes } from './ItemTypes'

/**
 * Render draggable box on droppable layer
 *
 * @param {Object} item
 * @param {function} onDoubleClick
 * @param {boolean} isActive
 * @param {function} onClick
 *
 * @return {*}
 * @constructor
 */
export const BoxOnDustbin = ({ item, onDoubleClick, isActive, onClick }) => {
    const { left, top, title } = item

    const [{ isDragging }, drag] = useDrag({
        item:    { ...item, type: ItemTypes.BOX },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    if (isDragging) {
        return <div ref={drag} />
    }

    return (
        <div
            ref={drag}
            className={['box absolute', isActive ? 'isActive' : ''].join(' ')}
            style={{ left, top }}
            onDoubleClick={onDoubleClick}
            onClick={onClick}
        >
            {title}
        </div>
    )
}
