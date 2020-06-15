import React, {
    useEffect,
    useState,
} from 'react'
import './styles.css'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Box } from '../components/Box'
import { Dustbin } from '../components/Dustbin'
import { ItemTypes } from '../components/ItemTypes'

const draggableBoxes = [
    {
        id:    'print',
        title: 'Print "Hello"',
        type:  ItemTypes.BOX,
    },
    {
        id:    'request',
        title: 'Request exchange rate and print',
        type:  ItemTypes.BOX,
    },
]

const storageBoxes  = localStorage.getItem('boxes')
const storageArrows = localStorage.getItem('arrows')
const initialBoxes  = storageBoxes ? JSON.parse(storageBoxes) : {}
const initialArrows = storageArrows ? JSON.parse(storageArrows) : []

function App()
{
    const [ arrows, setArrows ]   = useState(initialArrows)
    const [ boxes, setBoxes ]     = useState(initialBoxes)
    const [ actions, setActions ] = useState([])

    useEffect(() => {
        if (Object.keys(boxes).length > 0) {
            localStorage.setItem('boxes', JSON.stringify(boxes))
        }
    }, [ boxes ])

    useEffect(() => {
        if (arrows.length > 0) {
            localStorage.setItem('arrows', JSON.stringify(arrows))
        }
    }, [ arrows ])

    /**
     * Print hello function
     *
     * @return {Promise<string>}
     */
    function printHello()
    {
        return Promise.resolve('Hello')
    }

    /**
     * On click "Process"
     *
     * @return {Promise<void>}
     */
    const startBoxesActions = async () => {
        for (const action of actions) {
            if (action === 'print') {
                const result = await printHello()

                console.log(result)
            } else {
                const apiUrl = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/dollar_info?data=20200615&json'

                const response = await fetch(apiUrl)
                const data     = await response.json()

                const obj    = data && data[0]
                const result = `1 ${obj.cc} = ${obj.rate} UAH`

                console.log(result)
            }
        }
    }

    /**
     * Clear all data from state and localStorage
     *
     * @return {undefined}
     */
    const clearAllData = () => {
        setArrows([])
        setBoxes({})
        localStorage.removeItem('arrows')
        localStorage.removeItem('boxes')
    }

    return (
        <>
            <p className="text">
                Быстрый двойной клик по блоку даёт возможность установить блок как активный.
                <br />
                От активного блока можно проставить стрелку к следующему блоку.
                <br/>
                Для удаления данных нажмите кнопку "Delete all".
            </p>
            <div className="main">
                <DndProvider backend={HTML5Backend}>
                    <div className="boxes">
                        {draggableBoxes.map(box => (
                            <Box key={box.id} data={box} />
                        ))}

                        <div className="box process" onClick={startBoxesActions}>
                            Process
                        </div>

                        <div className="box process" onClick={clearAllData}>
                            Delete all
                        </div>
                    </div>
                    <Dustbin
                        onChangeArrows={setActions}
                        setBoxes={setBoxes}
                        boxes={boxes}
                        arrows={arrows}
                        setArrows={setArrows}
                    />
                </DndProvider>
            </div>
        </>
    )
}

export default App
