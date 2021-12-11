import axios from 'axios';

import { ENDPOINT } from '../util';

const url = `${ ENDPOINT() }/api/item`

const getItems = async () => {
  const response = await axios.get(url)
  return response.data
}

const addItem = async () => {
  const item = {
    seller: 'randomBaldGuy',
    name: 'Wiggly jiggly wig',
    description: 'This wig is most wiggy thing on earth',
    startAmount: 0,
  }

  const response = await axios.post(url, item)
  return response.data
}


export default { getItems, addItem }