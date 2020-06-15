import React, {
    useEffect,
    useRef,
    useState,
} from 'react'
import { useDrop } from 'react-dnd'
import { BoxOnDustbin } from './BoxOnDustbin'
import { ItemTypes } from './ItemTypes'
import update from 'immutability-helper'
import {
    ArrowSvg,
    LineOrientation,
} from 'react-simple-arrows/dist'

/**
 * Custom drop with refs
 *
 * @param {Object} boxes
 * @param {function} setBoxes
 *
 * @return {function(...[*]=)}
 */
const useLayerDrop = (boxes, setBoxes) => {
    const ref = useRef()

    const [ , dropTarget ] = useDrop({
        accept:  ItemTypes.BOX,
        drop:    (item, monitor) => {
            const offset = monitor.getSourceClientOffset()
            const delta  = monitor.getDifferenceFromInitialOffset()

            if (offset && ref.current) {
                if (boxes[item.id] === undefined) {
                    createNewBox(item, offset)
                } else {
                    moveBox(item, delta)
                }
            }
        },
        collect: (monitor) => ({
            isOver:        monitor.isOver(),
            isOverCurrent: monitor.isOver({ shallow: true }),
        }),
    })

    const createNewBox = (item, offset) => {
        const dropTargetXy = ref.current.getBoundingClientRect()
        const boxesLength  = Object.keys(boxes).length

        // set limit
        if (boxesLength === 5) {
            alert('max 5 boxes on layer')
            return
        }

        const newBox = {}
        const newId  = item.id + boxesLength

        // new item data
        newBox[newId] = {
            id:    newId,
            title: item.title,
            top:   Math.round(offset.y - dropTargetXy.top),
            left:  Math.round(offset.x - dropTargetXy.left),
        }

        // set new data
        setBoxes({ ...boxes, ...newBox })
    }

    const moveBox = (item, delta) => {
        const left = Math.round(item.left + delta.x)
        const top  = Math.round(item.top + delta.y)

        setBoxes(
            update(boxes, {
                [item.id]: {
                    $merge: { left, top },
                },
            }),
        )
    }

    return elem => {
        ref.current = elem
        dropTarget(ref)
    }
}

/**
 * Render droppable layer
 *
 * @param {function} onChangeArrows
 * @param {Object<Object>} boxes
 * @param {function} setBoxes
 * @param {Array<Object>} arrows
 * @param {function} setArrows
 *
 * @return {*}
 * @constructor
 */
export const Dustbin = ({ onChangeArrows, boxes, setBoxes, arrows, setArrows }) => {
    const [ activeBox, setActiveBox ] = useState(null)

    const drop = useLayerDrop(boxes, setBoxes)

    useEffect(() => {
        const actions = []

        arrows.forEach((arrow, index) => {
            const newAction = arrow.from.slice(0, -1)

            actions.push(newAction)

            if (index === arrows.length - 1) {
                const lastAction = arrow.to.slice(0, -1)

                actions.push(lastAction)
            }
        })

        onChangeArrows(actions)
    }, [ arrows, onChangeArrows ])

    /**
     * Set or remove active block
     *
     * @param {Object | null} item
     *
     * @return {undefined}
     */
    const toggleActiveBlock = (item = null) => {
        let isBlocked = false

        if (item !== null) {
            arrows.forEach(arrow => {
                if (arrow.from === item.id) {
                    isBlocked = true
                }
            })
        }

        if (isBlocked) {
            setActiveBox(null)
            return
        }

        if (activeBox === null) {
            setActiveBox(item)
        } else {
            setActiveBox(null)
        }
    }

    /**
     * Create new line
     *
     * @param {Object} item
     */
    const createNewLine = item => {
        const notCurrent = activeBox !== null && item.id !== activeBox.id
        let isBlocked    = false
        const newArrows  = [ ...arrows ]

        arrows.forEach(arrow => {
            if (arrow.from === item.id) {
                isBlocked = true
            }
        })

        if (notCurrent && !isBlocked) {
            const arrowData = {
                id:   `${activeBox.id}-${item.id}`,
                from: activeBox.id,
                to:   item.id,
            }

            newArrows.push(arrowData)
            setArrows(newArrows)
            toggleActiveBlock()
        }
    }

    return (
        <div ref={drop} className="dustbin">
            {arrows.map(arrow => {
                const boxFrom  = boxes[arrow.from]
                const boxTo    = boxes[arrow.to]
                const boxWidth = 120

                return (
                    <ArrowSvg
                        key={arrow.id}
                        start={{ x: boxFrom.left + boxWidth / 2, y: boxFrom.top }}
                        end={{ x: boxTo.left + boxWidth / 2, y: boxTo.top }}
                        orientation={LineOrientation.VERTICAL}
                    />
                )
            })}

            {Object.keys(boxes).map((key) => {
                const item      = boxes[key]
                const isCurrent = activeBox !== null && item.id === activeBox.id

                return (
                    <BoxOnDustbin
                        key={key}
                        item={item}
                        onDoubleClick={() => toggleActiveBlock(item)}
                        isActive={isCurrent}
                        onClick={() => createNewLine(item)}
                    />
                )
            })}
        </div>
    )
}
