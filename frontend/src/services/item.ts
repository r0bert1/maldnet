import { strictEqual } from 'assert';
import axios from 'axios';

import { ENDPOINT } from '../util';

const url = `${ENDPOINT()}/api/item`

const getItems = async () => {
  const response = await axios.get(url)
  return response.data
}

const addItem = async (userId: string, name: string, description: string, startAmount: number, buyTime: Date, imagePath: string) => {
  const item = {
    seller: userId,
    name,
    description,
    startAmount,
    buyTime,
    imageUrl: imagePath
  }

  const response = await axios.post(url, item)
  return response.data
}


export default { getItems, addItem }