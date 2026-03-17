import type { ProfileTheme, ServiceCreate, StylistCategory } from './stylist.types'

export interface ClientRegister {
  fullName: string
  email: string
  password: string
  photoUrl?: string
}

export interface StylistRegister {
  fullName: string
  email: string
  password: string
  phone: string
  businessName: string
  category: StylistCategory | string
  bio: string
  yearsOfExperience: number
  colorTheme: ProfileTheme | string
  speciality: string
  services: ServiceCreate[]
  portfolio: string[]
  photoUrl?: string
}
