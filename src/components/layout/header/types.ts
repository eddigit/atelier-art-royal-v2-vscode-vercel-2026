export interface Obedience {
    _id: string;
    name: string;
    code: string;
    slug: string;
    image_url?: string;
}

export interface Rite {
    _id: string;
    name: string;
    code: string;
}

export interface DegreeOrder {
    _id: string;
    name: string;
    level: number;
    loge_type: string;
}

export interface Product {
    _id: string;
    name: string;
    slug: string;
    price: number;
    images?: string[];
}
