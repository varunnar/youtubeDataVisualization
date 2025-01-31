//THIS IS TEST CODE
// function App() { // Capital letter indicates component
//   const [todos, setTodos] = useState(() => {
//     const localValue = localStorage.getItem("ITEMS")
//     if (localValue == null) {
//       return [];
//     } else {
//       return JSON.parse(localValue);
//     }
//   });
//   //setNewItem("ssss") Can't do this because it causes an infinite loop cause it loops
//   //classname is for class


//   //CANNOT PUT HOOKS IN IF STATEMENTS
//   useEffect(() => {
//     localStorage.setItem("ITEMS", JSON.stringify(todos)) //saving to cache
//   }, [todos]) //array at the end shows what makes it run - so whenever todos array runs the localstorage adds
  
//   function addTodo(title) {
//     setTodos((currentTodos) => { //You need to make this function due to how state works in react.
//       // If you just use todos in setTodos without a function the state doesn't update if you use multiple operations
//       // For this reason you need to turn it into a custom function and then the return goes into the next thin
//       return [...currentTodos, 
//         {id: crypto.randomUUID(), title: title, completed: false}
//       ]
//   })
//   }

//   function toggleTodo(id, completed) {
//     setTodos(currentTodos => {
//       return currentTodos.map(todo => {
//         if (todo.id === id) {
//           return {...todo, completed}
//           // todo.completed = completed - Can't do because you are mutating the variable
//         }
//         return todo
//       })
//     })
//   }

//   function deleteTodo(id) {
//     setTodos(currentTodos => {
//       return currentTodos.filter(todo => todo.id != id);
//     })
//   }

//   return (
//   <>
//   <NewTodoForm onSubmit={addTodo}/>
//   <h1 className='header'>Todo List</h1>
//   <TodoList todos={todos} toggleTodo={toggleTodo} deleteTodo={deleteTodo}/> 
//   </>
//   )
// }

// export default App