import React, { createContext, useState, useContext, useEffect } from 'react';
import { useUser } from './UserContext';
import { saveCartToFirestore, getCartFromFirestore } from '../services/firebase';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user } = useUser();

  // Cargar carrito al iniciar
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        // Cargar desde Firestore
        const result = await getCartFromFirestore(user.uid);
        if (result.success) {
          setCart(result.data);
        }
      } else {
        // Cargar desde localStorage
        const localCart = localStorage.getItem('huerto_cart');
        if (localCart) {
          setCart(JSON.parse(localCart));
        }
      }
    };
    loadCart();
  }, [user]);

  // Persistir carrito
  useEffect(() => {
    const saveCart = async () => {
      if (user) {
        await saveCartToFirestore(user.uid, cart);
      } else {
        localStorage.setItem('huerto_cart', JSON.stringify(cart));
      }
    };
    saveCart();
  }, [cart, user]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};