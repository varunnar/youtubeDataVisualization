import { useState } from "react";

export function NewTodoForm({ onSubmit}) {

    const [newItem, setNewItem] = useState("");

    function handleSubmit(e) {
        e.preventDefault()
  
        if (newItem === "") return 

        onSubmit(newItem)
  
      setNewItem("") //wipes input
    }
    return (
    <form onSubmit={handleSubmit} className="new-item-form">
    <label htmlFor='item'></label>
    <input 
    type='text' 
    id='text' 
    value={newItem} onChange={e => setNewItem(e.target.value)}></input> 
    <button className='btn'>Add</button>
  </form>
  )
}