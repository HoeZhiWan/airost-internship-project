import { useState, useEffect } from "react"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import { useAuth } from '../../contexts/AuthContext'
import { sendTodo, getTodos, updateTodoStatus, deleteTodo, assignTodo, getUserProfile } from "../../lib/todos"
import PillCounter from "./PillCounter"
import TodoField from "./TodoField"
import { getGroupMembers } from "../../lib/chat"
import LoadingTab from "../LoadingTab"

function TodoTab({ groupId }) {
    const [list, setList] = useState({ "pending": [], "process": [], "completed": [] })
    const [newTodo, setNewTodo] = useState("")
    const { user } = useAuth()
    const [members, setMembers] = useState([]);
    const [filterByUser, setFilterByUser] = useState("all"); 
    const [loading, setLoading] = useState(true);
    const [memberProfiles, setMemberProfiles] = useState([]);

    const fetchTodos = async () => {
        if (!groupId || !user) return;
        
        try {
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
                        name: todo.text,
                        assignedTo: todo.assignedTo || []
                    });
                });
                
                setList(organized);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        
        const interval = setInterval(() => {
            if (isMounted) {
                fetchTodos();
            }
        }, 5000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [groupId, user]);

    useEffect(() => {
        const fetchMembers = async () => {
            if (!groupId || !user) return;
            setLoading(true);
            const idToken = await user.getIdToken();
            const result = await getGroupMembers(groupId, idToken);
            if (result.success) {
                setMembers(result.members);
            }

        };
        fetchMembers();
    }, [groupId, user]);

    useEffect(() => {
        const fetchMemberProfiles = async () => {
            if (!members.length || !user) return;
            
            const idToken = await user.getIdToken();
            const profiles = await Promise.all(
                members.map(async (member) => {
                    const result = await getUserProfile(member.uid, idToken);
                    return {
                        ...member,
                        fullName: result.success ? 
                            `${result.profile.firstName} ${result.profile.lastName}` : 
                            member.email
                    };
                })
            );
            setMemberProfiles(profiles);
        };

        fetchMemberProfiles();
    }, [members, user]);

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
              id: Date.now().toString(),
              name: newTodo
            }]
          }))
          setNewTodo("")
        }
      }

    const handleDragEnd = async (e) => {
        if (!e.destination || !user) return;
        
        try {
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
        } catch (error) {
            console.error('Drag operation failed:', error);
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

    const handleAssign = async (todoId, uid) => {  
        if (!user) return;
        
        const idToken = await user.getIdToken();
        const result = await assignTodo(todoId, [uid], idToken);  
        
        if (result.success) {
            await fetchTodos(); 
        }
    };

    const getFilteredTodos = (todos, status) => {
        const statusTodos = todos[status] || [];
        if (filterByUser === "all") return statusTodos;
        
        return statusTodos.filter(todo => 
            todo.assignedTo?.includes(filterByUser)
        );
    };

    if (loading) {
        return <LoadingTab />;
    }

    return (
        <div className="flex flex-col gap-4 w-full m-4">
            <div className="flex gap-4">
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
                        className="w-[160px] p-3 bg-primary-tint-300 rounded-[10px] flex items-center justify-center"
                    >
                        Add Todo
                    </button>
                </form>
                <select 
                    value={filterByUser}
                    onChange={(e) => setFilterByUser(e.target.value)}
                    className="w-[200px] p-3 bg-shade-300 rounded-[10px]"
                >
                    <option value="all">All Todos</option>
                    <option value={user?.uid}>My Tasks</option>
                    {memberProfiles.map(member => (
                        member.uid !== user?.uid && (
                            <option key={member.uid} value={member.uid}>
                                {member.fullName}
                            </option>
                        )
                    ))}
                </select>
            </div>

            <DragDropContext onDragEnd={handleDragEnd} onBeforeDragStart={() => {
                if (!user) return false;
            }}>
                <div className="flex py-4 gap-4 w-full h-full text-[24px]">
                    <div className="flex flex-col gap-3 basis-1/3">
                        <div className="flex gap-1 items-center p-4 rounded-[8px] bg-[#9370DB]">
                            <div className="">Pending</div>
                            <PillCounter counter={getFilteredTodos(list, "pending").length} />
                        </div>
                        <Droppable droppableId="pending" type="group">
                        {(provided) => (
                        <div className="" {...provided.droppableProps} ref={provided.innerRef}>
                            {
                            getFilteredTodos(list, "pending").map((store, index) => (
                                <Draggable key={store.id} draggableId={store.id} index={index}>
                                {(provided) => (
                                    <div className="mb-3" {...provided.dragHandleProps} {...provided.draggableProps} ref={provided.innerRef}>
                                        <TodoField 
                                            todo={store.name} 
                                            todoId={store.id}
                                            onDelete={handleDelete}
                                            onAssign={handleAssign}
                                            assignedTo={store.assignedTo}
                                            members={memberProfiles}
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
                            <PillCounter counter={getFilteredTodos(list, "process").length} />
                        </div>
                        <Droppable droppableId="process" type="group">
                        {(provided) => (
                        <div className="" {...provided.droppableProps} ref={provided.innerRef}>
                            {
                            getFilteredTodos(list, "process").map((store, index) => (
                                <Draggable key={store.id} draggableId={store.id} index={index}>
                                {(provided) => (
                                    <div className="mb-3" {...provided.dragHandleProps} {...provided.draggableProps} ref={provided.innerRef}>
                                        <TodoField 
                                            todo={store.name} 
                                            todoId={store.id}
                                            onDelete={handleDelete}
                                            onAssign={handleAssign}
                                            assignedTo={store.assignedTo}
                                            members={memberProfiles}
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
                            <PillCounter counter={getFilteredTodos(list, "completed").length} />
                        </div>
                        <Droppable droppableId="completed" type="group">
                        {(provided) => (
                        <div className="" {...provided.droppableProps} ref={provided.innerRef}>
                            {
                            getFilteredTodos(list, "completed").map((store, index) => (
                                <Draggable key={store.id} draggableId={store.id} index={index}>
                                {(provided) => (
                                    <div className="mb-3" {...provided.dragHandleProps} {...provided.draggableProps} ref={provided.innerRef}>
                                        <TodoField 
                                            todo={store.name} 
                                            todoId={store.id}
                                            onDelete={handleDelete}
                                            onAssign={handleAssign}
                                            assignedTo={store.assignedTo}
                                            members={memberProfiles}
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
