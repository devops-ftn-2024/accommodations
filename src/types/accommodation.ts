export interface Accommodation {
    _id?: string;
    name: string;
    location: string;
    benefits: Benefit[];
    images: string[];
    minCapacity: number;
    maxCapacity: number;
    priceLevel: PriceLevel;
    ownerUsername: string;
    confirmationNeeded: boolean;
    rating: number;
    ratingsArray: number[];
}

export interface Review {
    id: string;
    username: string;
    rating: number;
    comment: string;
}

export interface AccommodationInput {
    name: string;
    location: string;
    benefits: Benefit[];
    images: string[];
    minCapacity: number;
    maxCapacity: number;
    priceLevel: PriceLevel;
    confirmationNeeded: boolean;
}

export enum PriceLevel {
    perGuest = 'perGuest',
    perAccommodation = 'perAccommodation'
}

export enum Benefit {
    wifi = 'wifi',
    parking = 'parking',
    pool = 'pool',
    gym = 'gym',
    breakfast = 'breakfast',
    ac = 'ac',
}
