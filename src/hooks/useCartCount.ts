import { useState, useEffect } from 'react';

export function useCartCount() {
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const updateCart = () => {
            try {
                const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                const count = cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
                setCartCount(count);
            } catch {
                setCartCount(0);
            }
        };

        updateCart();

        // Custom event for immediate updates without storage event lag
        const handleCartUpdate = (e: CustomEvent) => {
            setCartCount(e.detail?.itemCount || 0);
        };

        window.addEventListener('cartUpdated', handleCartUpdate as EventListener);
        window.addEventListener('storage', updateCart);

        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
            window.removeEventListener('storage', updateCart);
        };
    }, []);

    return cartCount;
}
