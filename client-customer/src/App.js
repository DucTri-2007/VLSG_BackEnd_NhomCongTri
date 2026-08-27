import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';
import MyContext from './contexts/MyContext';
import Main from './components/MainComponent';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    
    // Restore session and cart from localStorage
    const savedCustomer = localStorage.getItem('customer');
    const savedToken = localStorage.getItem('token');
    const savedCart = localStorage.getItem('cart');

    this.state = {
      token: savedToken || '',
      customer: savedCustomer ? JSON.parse(savedCustomer) : null,
      cart: savedCart ? JSON.parse(savedCart) : [],
      
      setToken: (token) => {
        this.setState({ token: token });
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
      },
      
      setCustomer: (customer) => {
        this.setState({ customer: customer });
        if (customer) {
          localStorage.setItem('customer', JSON.stringify(customer));
        } else {
          localStorage.removeItem('customer');
        }
      },
      
      setCart: (cart) => {
        this.setState({ cart: cart });
        localStorage.setItem('cart', JSON.stringify(cart));
      },
      
      addToCart: (product, quantity) => {
        const currentCart = [...this.state.cart];
        const index = currentCart.findIndex(item => item.product._id === product._id);
        if (index > -1) {
          currentCart[index].quantity += quantity;
        } else {
          currentCart.push({ product: product, quantity: quantity });
        }
        this.state.setCart(currentCart);
      },
      
      removeFromCart: (productId) => {
        const currentCart = this.state.cart.filter(item => item.product._id !== productId);
        this.state.setCart(currentCart);
      },
      
      updateCartQuantity: (productId, quantity) => {
        const currentCart = this.state.cart.map(item => {
          if (item.product._id === productId) {
            return { ...item, quantity: Math.max(1, quantity) };
          }
          return item;
        });
        this.state.setCart(currentCart);
      },
      
      clearCart: () => {
        this.state.setCart([]);
      }
    };
  }

  render() {
    return (
      <MyContext.Provider value={this.state}>
        <BrowserRouter>
          <Main />
        </BrowserRouter>
      </MyContext.Provider>
    );
  }
}

export default App;
