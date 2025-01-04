import React from 'react'
import Sidebar from '../../Components/Sidebar/Sidebar'
import {Routes,Route} from 'react-router-dom'
import './Admin.css'
import ListProduct from '../../Components/ListProduct/ListProduct'
import AddProduct from '../../Components/AddProduct/Addproduct'



const Admin = () => {
  return (
    <div className='admin'>
      <Sidebar />
      <Routes>
        <Route  path='/addproduct' element={<AddProduct />}/>
        <Route  path='/listproduct' element={<ListProduct />}/>
      </Routes>
    </div>
  )
}

export default Admin