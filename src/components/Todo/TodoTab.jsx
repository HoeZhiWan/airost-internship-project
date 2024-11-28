import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import PillCounter from "./PillCounter"
import TodoField from "./TodoField"
import { useState } from "react"

//test data
const pending = [
    {
      id: "1",
      name: "Chop"
    },
    {
      id: "2",
      name: "rinse"
    },
    {
      id: "3",
      name: "cook"
    },
  ]
  const process = [
    {
        id: "4",
        name: "wash"
      },
  ]
  const completed = []

function TodoTab() {
    const [list, setList] = useState({"pending": pending, "process": process, "completed": completed}) //combine all list into one class

    const handleDragEnd = (e) => {
        const newClass = {...list}

        const destinationId = e.destination.droppableId
        const destinationIndex = e.source.index
        const sourceId = e.source.droppableId
        const sourceIndex = e.source.index

        console.log(newClass[sourceId])
        const [newList] = newClass[sourceId].splice(sourceIndex, 1)
        newClass[destinationId].splice(destinationIndex, 0, newList)
        console.log(newClass)

        //update data in here
        return setList(newClass)
    }

    return (
        <div className="flex flex-col gap-4 w-full m-4">
            <form className="flex h-12 gap-4 w-full text-[20px]">
                    <input 
                        type="text" 
                        className="border-0 w-full p-[12px] py-[8px] bg-shade-300 placeholder-text placeholder:italic rounded-[10px] focus:ring-0" 
                        placeholder="search" 
                    />
                <select className="w-[160px] p-3 bg-primary-tint-300 rounded-[10px]">
                    <option value="" className="bg-white text-black">
                        All
                    </option>
                    <option value="" className="bg-white text-black">
                        My Todo
                    </option>
                </select>
            </form>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex py-4 gap-4 w-full h-full text-[24px]">
                    <div className="flex flex-col gap-3 basis-1/3">
                        <div className="flex gap-1 items-center p-4 rounded-[8px] bg-[#9370DB]">
                            <div className="">Pending</div>
                            <PillCounter counter={13} />
                        </div>
                        <Droppable droppableId="pending" type="group">
                        {(provided) => (
                        <div className="" {...provided.droppableProps} ref={provided.innerRef}>
                            {
                            list.pending.map((store, index) => (
                                <Draggable key={store.id} draggableId={store.id} index={index}>
                                {(provided) => (
                                    <div className="mb-3" {...provided.dragHandleProps} {...provided.draggableProps} ref={provided.innerRef}>
                                        <TodoField todo={store.name} />
                                    </div>
                                )}
                                </Draggable>
                            ))
                            }
                            {provided.placeholder}
                        </div>
                        )}
                        </Droppable>
                    </div>
                    <div className="flex flex-col gap-3 basis-1/3">
                        <div className="flex gap-1 items-center p-4 rounded-[8px] bg-[#1E90FF]">
                            <div className="">In Process</div>
                            <PillCounter counter={1} />
                        </div>
                        <Droppable droppableId="process" type="group">
                        {(provided) => (
                        <div className="" {...provided.droppableProps} ref={provided.innerRef}>
                            {
                            list.process.map((store, index) => (
                                <Draggable key={store.id} draggableId={store.id} index={index}>
                                {(provided) => (
                                    <div className="mb-3" {...provided.dragHandleProps} {...provided.draggableProps} ref={provided.innerRef}>
                                        <TodoField todo={store.name} />
                                    </div>
                                )}
                                </Draggable>
                            ))
                            }
                            {provided.placeholder}
                        </div>
                        )}
                        </Droppable>
                    </div>
                    <div className="flex flex-col gap-3 basis-1/3">
                        <div className="flex gap-1 items-center p-4 rounded-[8px] bg-primary-tint-400">
                            <div className="">Completed</div>
                            <PillCounter counter={100} />
                        </div>
                        <Droppable droppableId="completed" type="group">
                        {(provided) => (
                        <div className="" {...provided.droppableProps} ref={provided.innerRef}>
                            {
                            list.completed.map((store, index) => (
                                <Draggable key={store.id} draggableId={store.id} index={index}>
                                {(provided) => (
                                    <div className="mb-3" {...provided.dragHandleProps} {...provided.draggableProps} ref={provided.innerRef}>
                                        <TodoField todo={store.name} />
                                    </div>
                                )}
                                </Draggable>
                            ))
                            }
                            {provided.placeholder}
                        </div>
                        )}
                        </Droppable>
                    </div>
                </div>
            </DragDropContext>
        </div>
    )
}

export default TodoTab
