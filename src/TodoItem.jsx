export function TodoItem({ completed, id, title, toggleTodo, deleteTodo}){
    return (
        <li>
            <label>
                <input type='checkbox' 
                checked={completed} 
                onChange={e => toggleTodo(id, e.target.completed)}
                />
                {title}
            </label>
            {/* <button onClick={deleteTodo(id)}>Delete</button> THIS IS PASSING THE RESULT OF DELETE TODO IMMEDIATELY*/} 
            <button 
            onClick={() => deleteTodo(id)} 
            className='btn btn-danger'>Delete</button>
        </li>
    )
}