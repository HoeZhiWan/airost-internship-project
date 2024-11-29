import { useState, useEffect } from "react"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import { useAuth } from '../../contexts/AuthContext'
import { sendTodo, getTodos, updateTodoStatus, deleteTodo } from "../../lib/todos"
import PillCounter from "./PillCounter"
import TodoField from "./TodoField"

function TodoTab({ groupId }) {
    const [list, setList] = useState({ "pending": [], "process": [], "completed": [] })
    const [newTodo, setNewTodo] = useState("")
    const { user } = useAuth()

    // Add fetchTodos function outside useEffect for reuse
    const fetchTodos = async () => {
        if (!groupId || !user) return;
        
        const idToken = await user.getIdToken();
        const result = await getTodos(groupId, idToken);
        
        if (result.success) {
            const organized = {
                pending: [],
                process: [],
                completed: []
            };
            
            result.todos.forEach(todo => {
                organized[todo.status].push({
                    id: todo.id,
                    name: todo.text
                });
            });
            
            setList(organized);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchTodos();
    }, [groupId, user]);

    // Set up polling
    useEffect(() => {
        const interval = setInterval(() => {
            fetchTodos();
        }, 5000); // 5 seconds

        // Cleanup on unmount
        return () => clearInterval(interval);
    }, [groupId, user]);

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!newTodo.trim() || !user || !groupId) return
    
        const idToken = await user.getIdToken()
        const result = await sendTodo(newTodo, groupId, idToken)
        
        if (result.success) {
          // Add new todo to pending list
          setList(prev => ({
            ...prev,
            pending: [...prev.pending, {
              id: Date.now().toString(), // temporary ID
              name: newTodo
            }]
          }))
          setNewTodo("")
        }
      }

    const handleDragEnd = async (e) => {
        if (!e.destination) return;

        const newClass = {...list}
        const destinationId = e.destination.droppableId
        const destinationIndex = e.destination.index
        const sourceId = e.source.droppableId
        const sourceIndex = e.source.index

        // Remove from source and add to destination
        const [movedItem] = newClass[sourceId].splice(sourceIndex, 1)
        newClass[destinationId].splice(destinationIndex, 0, movedItem)

        // Update state optimistically
        setList(newClass)

        // Update in backend
        if (sourceId !== destinationId) {
            const idToken = await user.getIdToken()
            const result = await updateTodoStatus(movedItem.id, destinationId, idToken)
            
            if (!result.success) {
                // Revert changes if update fails
                const revertedList = {...list}
                const [revertItem] = revertedList[destinationId].splice(destinationIndex, 1)
                revertedList[sourceId].splice(sourceIndex, 0, revertItem)
                setList(revertedList)
            }
        }
    }

    const handleDelete = async (todoId) => {
        if (!user) return;
        
        const idToken = await user.getIdToken();
        const result = await deleteTodo(todoId, idToken);
        
        if (result.success) {
            // Update lists by removing the deleted todo
            setList(prev => {
                const newList = { ...prev };
                ['pending', 'process', 'completed'].forEach(status => {
                    newList[status] = newList[status].filter(todo => todo.id !== todoId);
                });
                return newList;
            });
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full m-4">
            <form onSubmit={handleSubmit} className="flex h-12 gap-4 w-full text-[20px]">
                    <input 
                        type="text" 
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        className="border-0 w-full p-[12px] py-[8px] bg-shade-300 placeholder-text placeholder:italic rounded-[10px] focus:ring-0" 
                        placeholder="Add new todo" 
                    />
                <button 
                    type="submit"
                    className="w-[160px] p-3 bg-primary-tint-300 rounded-[10px]"
                >
                    Add Todo
                </button>
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
                                        <TodoField 
                                            todo={store.name} 
                                            todoId={store.id}
                                            onDelete={handleDelete}
                                        />
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
                                        <TodoField 
                                            todo={store.name} 
                                            todoId={store.id}
                                            onDelete={handleDelete}
                                        />
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
                                        <TodoField 
                                            todo={store.name} 
                                            todoId={store.id}
                                            onDelete={handleDelete}
                                        />
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
