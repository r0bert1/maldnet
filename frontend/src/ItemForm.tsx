import { strictEqual } from 'assert';
import React, { useState } from 'react';
import itemService from './services/item'

const ItemForm = (props: any) => {
  const [name, setName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [startAmount, setStartAmount] = useState<number>(0)
  const [imagePath, setImagePath] = useState<string>('')
  const [buyTime, setBuyTime] = useState<Date>(new Date())

  const handleCancelClick = () => {
    props.setShowAddItem(false)
  }

  const parseTime = () => {
    const stringDate = `${buyTime.getFullYear()}-${buyTime.getMonth() + 1}-${buyTime.getDate()}T${buyTime.getHours()}:${buyTime.getMinutes() < 10 ? `0${buyTime.getMinutes()}` : buyTime.getMinutes()}`
    return stringDate
  }

  const handleAddItem = () => {
    itemService.addItem(props.user._id, name, description, startAmount, buyTime, imagePath)
    props.setShowAddItem(false)
  }

  return (
    <div className='pop-up-box'>
      <div className='box'>
        <div>
          <label htmlFor='itemname'>Item name: </label>
          <input id="itemname" type="text" value={name} onChange={({ target }) => setName(target.value)} />
        </div>
        <div className='text-area-div'>
          <label htmlFor='description'>Description: </label>
          <textarea id="description" rows={4} cols={30} value={description} onChange={({ target }) => setDescription(target.value)} />
        </div>
        <div>
          <label htmlFor='startamount'>Start amount: </label>
          <input id="startamount" type="number" value={startAmount} onChange={({ target }) => setStartAmount(Number(target.value))} />
        </div>
        <div>
          <label htmlFor='itemname'> Final buy time: </label>
          <input id="itemname" type="datetime-local" value={parseTime()} onChange={({ target }) => setBuyTime(new Date(target.value))} />
        </div>
        <div>
          <label htmlFor='imagepath'>Image path: </label>
          <input id="imagepath" type="text" value={imagePath} onChange={({ target }) => setImagePath(target.value)} />
        </div>
        <button onClick={() => handleAddItem()}>Add</button>
        <button onClick={() => handleCancelClick()}>Cancel</button>
      </div>
    </div>
  )
}

export default ItemForm