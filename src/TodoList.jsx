import { TodoItem } from "./TodoItem"

export function TodoList({ todos, deleteTodo, toggleTodo }) {
    return (
        <ul className='List'> 
      
          {todos.length === 0 && "No Todos"}
            {/* how do I make a loop? */}
            {todos.map(todo => {
              return (
                // <TodoItem id={todo.id} completed={todo.completed} title={todo.title} key={todo.id}/>
                <TodoItem {...todo} key={todo.id} toggleTodo={toggleTodo} deleteTodo={deleteTodo}/>
              )
            })}
        </ul> 
    )
}