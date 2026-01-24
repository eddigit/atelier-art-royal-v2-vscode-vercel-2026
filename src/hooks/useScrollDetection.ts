import { useState, useEffect } from 'react';

export function useScrollDetection(threshold = 20) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > threshold);
        };

        // Check on mount
        handleScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [threshold]);

    return isScrolled;
}
