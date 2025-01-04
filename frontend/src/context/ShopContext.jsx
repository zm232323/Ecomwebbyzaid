import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index < 300 + 1; index++) {
        cart[index] = 0;
    }
    return cart;
};

const ShopContextProvider = (props) => {

    const [all_product,setAll_Product]= useState([]);
    const [cartItems, setCartItems] = useState(getDefaultCart());

    useEffect(()=>{
       fetch('http://localhost:4000/allproducts')
       .then((response)=>response.json())
       .then((data)=>setAll_Product(data))

       if(localStorage.getItem('auth-token')){
        fetch('http://localhost:4000/getcart',{
            method:'POST',
            headers:{
                Accept:'application/form-data',
                'auth-token':`${localStorage.getItem('auth-token')}`,
                'Content-Type':'application/json',
            },
            body:"",
        }).then((response)=>response.json())
        .then((data)=>setCartItems(data));
       }
    },[])

    const addToCart = (itemId) => {
        // Safely update the cart items
        setCartItems((prev) => ({
          ...prev,
          [itemId]: (prev[itemId] || 0) + 1, // Initialize to 0 if undefined
        }));
      
        const token = localStorage.getItem('auth-token');
        if (!token) {
          console.error('User not authenticated. Please log in.');
          return;
        }
      
        fetch('http://localhost:4000/addtocart', {
          method: 'POST',
          headers: {
            'Accept': 'application/json', // Correct response type
            'auth-token': token,
            'Content-Type': 'application/json', // Correct request content type
          },
          body: JSON.stringify({ itemId }), // Send the itemId as JSON
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            console.log('Item successfully added to cart:', data);
          })
          .catch((error) => {
            console.error('Error adding item to cart:', error.message);
          });
      };
      

      const removeFromCart = (itemId) => {
        // Ensure that cartItems is an object and itemId exists in the cart before decrementing
        setCartItems((prev) => {
            if (prev && prev[itemId] > 0) {
                return { ...prev, [itemId]: prev[itemId] - 1 };
            }
            return prev;
        });
    
        // Retrieve the token from localStorage
        const token = localStorage.getItem('auth-token');
    
        // Ensure the token exists before making the fetch request
        if (token) {
            fetch('http://localhost:4000/removefromcart', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'auth-token': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemId }),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log('Item successfully removed from cart:', data);
                })
                .catch((error) => {
                    console.error('Error removing item from cart:', error.message);
                });
        } else {
            console.error('No authentication token found');
        }
    };
    

    const getTotalAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = all_product.find(
                    (product) => product.id === Number(item)
                );
                if (itemInfo) {
                    totalAmount += itemInfo.new_price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };
    const getTotalCartItems =() =>{
        let totalItem = 0;
        for(const item in cartItems)
        {
            if(cartItems[item]>0)
            {
                totalItem+= cartItems[item];
            }
        }
        return totalItem;
    }

    const contextValue = {
        getTotalCartItems,
        getTotalAmount,
        all_product,
        cartItems,
        addToCart,
        removeFromCart,
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
