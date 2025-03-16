export interface Review {
  id: number;
  rating: number;
  comment: string;
  pengguna: {
    id: number;
    name: string;
    image?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface Pengelola {
  id: number;
  name: string;
}

export interface UpdatedBy {
  id: number;
  name: string;
}

export interface Wisata {
  id: number;
  name: string;
  description: string;
  location: string;
  images: string[];
  reviews: Review[];
  isVerified: boolean;
  createdAt: string;
  latitude?: number;
  longitude?: number;
  type?: string;
  pengelolaId?: number;
  updatedAt?: string;
  pengelola?: Pengelola;
  updatedBy?: UpdatedBy;
}
