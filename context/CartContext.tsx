'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '@/utils/axiosClient';
import toast from 'react-hot-toast';

interface CartContextType {
    cartCount: number;
    fetchCart: () => Promise<void>;
    addToCart: (courseId: string) => Promise<boolean>;
    removeFromCart: (courseId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [cartCount, setCartCount] = useState(0);

    const fetchCart = async () => {
        // Chỉ fetch nếu có token (đã đăng nhập)
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) return;

        try {
            const { data } = await axiosClient.get('/users/cart');
            if (data.success) {
                setCartCount(data.data.length);
            }
        } catch (error) {
            console.error("Lỗi tải giỏ hàng");
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const addToCart = async (courseId: string) => {
        try {
            const { data } = await axiosClient.post('/users/cart', { courseId });
            if (data.success) {
                toast.success("Đã thêm vào giỏ hàng!");
                fetchCart(); // Cập nhật lại số lượng
                return true;
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi thêm giỏ hàng");
        }
        return false;
    };

    const removeFromCart = async (courseId: string) => {
        try {
            const { data } = await axiosClient.delete(`/users/cart/${courseId}`);
            if (data.success) {
                toast.success("Đã xóa khóa học!");
                fetchCart(); // Cập nhật lại số lượng
            }
        } catch (error) {
            toast.error("Lỗi xóa giỏ hàng");
        }
    };

    return (
        <CartContext.Provider value={{ cartCount, fetchCart, addToCart, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};