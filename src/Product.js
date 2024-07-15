import React from 'react'
const imgURL = 'https://images.unsplash.com/photo-1586165877141-3dbcfc059283?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9reW8lMjBuaWdodHxlbnwwfHwwfHx8MA%3D%3D'
const Product = () => {
  return (
    <div className='card w-25'>
        
        <div className='card-body'>
            <img className='img-fluid' src={imgURL} alt="primo-progetto" />
            <h5 className='card-title'>Primo Progetto</h5>
            <p className='card-text'>Questo è il primo progetto</p>
            <a href='https://www.primo-progetto.it/' className='btn btn-primary'>Vai al sito</a>
        </div>
    </div>
  )
}

export default Product

