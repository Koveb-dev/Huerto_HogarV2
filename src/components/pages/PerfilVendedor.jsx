import { db, auth } from '../config/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';

export const getVendedorProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'vendedores', userId));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    }
    return { success: false, error: 'Vendedor no encontrado' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateVendedorProfile = async (userId, data) => {
  try {
    await updateDoc(doc(db, 'vendedores', userId), {
      ...data,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getVendedorProducts = async (vendedorId) => {
  try {
    const q = query(
      collection(db, 'productos'),
      where('vendedorId', '==', vendedorId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: products };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getVendedorOrders = async (vendedorId) => {
  try {
    // Primero obtener productos del vendedor
    const productsResult = await getVendedorProducts(vendedorId);
    const productIds = productsResult.success ? 
      productsResult.data.map(p => p.id) : [];

    if (productIds.length === 0) {
      return { success: true, data: [] };
    }

    // Buscar órdenes que contengan productos del vendedor
    const q = query(
      collection(db, 'ordenes'),
      orderBy('fecha', 'desc')
    );
    const snapshot = await getDocs(q);
    
    const orders = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(order => 
        order.items?.some(item => 
          productIds.includes(item.productoId) && item.vendedorId === vendedorId
        )
      );

    return { success: true, data: orders };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const createProduct = async (productData) => {
  try {
    const docRef = await addDoc(collection(db, 'productos'), {
      ...productData,
      createdAt: Timestamp.now(),
      ventas: 0
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    await updateDoc(doc(db, 'productos', productId), {
      ...productData,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteProduct = async (productId) => {
  try {
    await deleteDoc(doc(db, 'productos', productId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getVendedorStats = async (vendedorId) => {
  try {
    const [productsResult, ordersResult] = await Promise.all([
      getVendedorProducts(vendedorId),
      getVendedorOrders(vendedorId)
    ]);

    const products = productsResult.success ? productsResult.data : [];
    const orders = ordersResult.success ? ordersResult.data : [];

    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.estado === 'activo').length;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyOrders = orders.filter(order => {
      const orderDate = new Date(order.fecha?.seconds * 1000);
      return orderDate.getMonth() === currentMonth && 
             orderDate.getFullYear() === currentYear;
    });
    
    const pendingOrders = monthlyOrders.filter(o => o.estado === 'pendiente').length;
    const completedOrders = monthlyOrders.filter(o => o.estado === 'completado').length;
    const monthlySales = monthlyOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Calcular producto más vendido
    const productSales = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (item.vendedorId === vendedorId) {
          productSales[item.productoId] = (productSales[item.productoId] || 0) + item.cantidad;
        }
      });
    });

    let topProduct = null;
    let maxSales = 0;
    Object.entries(productSales).forEach(([productId, sales]) => {
      if (sales > maxSales) {
        maxSales = sales;
        const product = products.find(p => p.id === productId);
        if (product) topProduct = product;
      }
    });

    // Tasa de conversión simulada (visitas vs compras)
    const conversionRate = totalProducts > 0 ? 
      Math.round((completedOrders / totalProducts) * 100) : 0;

    return {
      success: true,
      data: {
        totalProducts,
        activeProducts,
        pendingOrders,
        completedOrders,
        monthlySales,
        totalSales,
        topProduct,
        conversionRate
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const changeVendedorPassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    await updatePassword(user, newPassword);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};