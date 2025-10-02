import { configureStore } from '@reduxjs/toolkit'
import inventoryReducer from '../features/inventory/inventorySlice'

export default configureStore({
  reducer: {
    inventory: inventoryReducer
  }
})