export enum StylistCategory {
  NAILS = 'Uñas',
  HAIR = 'Cabello',
  BARBER = 'Barbería',
  FACIAL = 'Facial',
  MAKEUP = 'Maquillaje',
  OTHER = 'Otro',
}

export enum ProfileTheme {
  PURPLE = 'purple',
  BLUE = 'blue',
  ORANGE = 'orange',
  PINK = 'pink',
  TEAL = 'teal',
}

export interface Service {
  id: number
  name: string
}

export interface ServiceDetailed extends Service {
  duration: string
  price: number
}

export interface ServiceCreate {
  name: string
  duration: string
  price: number
}

export interface GalleryImage {
  id: number
  imageUrl: string
}

export interface User {
  id: number
  fullName: string
  photoUrl: string
  role?: string
  accountExpired?: boolean
  email?: string
  stylistId?: number
}

export interface Stylist {
  id: number
  businessName: string
  category: string
  rating: number
  reviewsCount: number
  yearsOfExperience: number
  colorTheme: 'purple' | 'blue' | 'orange' | 'pink'
  speciality: string
  user: User
  services: Service[]
}

export interface Review {
  id: number
  date: string
  rating: number
  comment: string
  user: User
}

export interface ReviewsSummary {
  '5': number
  '4': number
  '3': number
  '2': number
  '1': number
}

export interface StylistDetailed extends Stylist {
  bio: string
  services: ServiceDetailed[]
  portfolio: GalleryImage[]
  reviews: Review[]
  reviewsSummary?: ReviewsSummary
  isFavorite?: boolean
}
