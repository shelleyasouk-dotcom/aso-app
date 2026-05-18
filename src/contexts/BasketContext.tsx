import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'

// Per-child fields (specific to each child being booked)
export interface BasketChildData {
  existingChildId: string | null  // set if from a saved profile
  childName: string
  childDob: string
  yearGroup: string
  className: string
  hasAdditionalNeeds: boolean | null
  additionalNeedsDetails: string
  photoConsent: boolean | null
}

// Shared parent/contact info — filled once, applied to all new children
export interface BasketContactData {
  parentName: string
  parentRelationship: string
  parentPhone: string
  addressLine1: string
  addressCity: string
  addressPostcode: string
  emergencyName: string
  emergencyRelationship: string
  emergencyPhone: string
  secondaryName: string
  secondaryPhone: string
  secondaryEmail: string
  collectionPerson: string
  walkHomeAlone: boolean | null
}

export interface BasketItem {
  id: string
  clubTermId: string
  schoolId: string
  schoolName: string
  sessionDay: string
  sessionTime: string
  termName: string
  startDate: string
  endDate: string
  numSessions: number
  pricePence: number
  child: BasketChildData
}

export function isChildItemComplete(item: BasketItem): boolean {
  const c = item.child
  return !!(
    c.childName.trim() &&
    c.childDob &&
    c.yearGroup.trim() &&
    c.photoConsent !== null &&
    c.hasAdditionalNeeds !== null &&
    (c.hasAdditionalNeeds === false || c.additionalNeedsDetails.trim())
  )
}

export function isContactDataComplete(contact: BasketContactData): boolean {
  return !!(
    contact.parentName.trim() &&
    contact.parentRelationship.trim() &&
    contact.parentPhone.trim() &&
    contact.addressLine1.trim() &&
    contact.addressCity.trim() &&
    contact.addressPostcode.trim() &&
    contact.emergencyName.trim() &&
    contact.emergencyPhone.trim() &&
    contact.secondaryName.trim() &&
    contact.secondaryPhone.trim() &&
    contact.secondaryEmail.trim() &&
    contact.collectionPerson.trim() &&
    contact.walkHomeAlone !== null
  )
}

const EMPTY_CONTACT: BasketContactData = {
  parentName: '', parentRelationship: '', parentPhone: '',
  addressLine1: '', addressCity: '', addressPostcode: '',
  emergencyName: '', emergencyRelationship: '', emergencyPhone: '',
  secondaryName: '', secondaryPhone: '', secondaryEmail: '',
  collectionPerson: '', walkHomeAlone: null,
}

const STORAGE_KEY = 'aso_basket_v2'

interface BasketContextType {
  items: BasketItem[]
  contactData: BasketContactData
  addItem: (item: Omit<BasketItem, 'id'>) => string
  removeItem: (id: string) => void
  updateItem: (id: string, updates: Partial<Omit<BasketItem, 'id'>>) => void
  updateContactData: (data: Partial<BasketContactData>) => void
  clearBasket: () => void
  totalPence: number
  hasNewChildren: boolean
}

const BasketContext = createContext<BasketContextType | null>(null)

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([])
  const [contactData, setContactData] = useState<BasketContactData>(EMPTY_CONTACT)

  // Load from storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setItems(parsed.items ?? [])
        setContactData(parsed.contactData ?? EMPTY_CONTACT)
      }
    } catch {
      /* ignore corrupt data */
    }
  }, [])

  // Persist to storage whenever basket changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, contactData }))
  }, [items, contactData])

  const addItem = useCallback((item: Omit<BasketItem, 'id'>): string => {
    const id = crypto.randomUUID()
    setItems(prev => [...prev, { ...item, id }])
    return id
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateItem = useCallback((id: string, updates: Partial<Omit<BasketItem, 'id'>>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
  }, [])

  const updateContactData = useCallback((data: Partial<BasketContactData>) => {
    setContactData(prev => ({ ...prev, ...data }))
  }, [])

  const clearBasket = useCallback(() => {
    setItems([])
    setContactData(EMPTY_CONTACT)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const totalPence = items.reduce((sum, i) => sum + i.pricePence, 0)
  const hasNewChildren = items.some(i => !i.child.existingChildId)

  return (
    <BasketContext.Provider value={{
      items, contactData, addItem, removeItem, updateItem,
      updateContactData, clearBasket, totalPence, hasNewChildren,
    }}>
      {children}
    </BasketContext.Provider>
  )
}

export function useBasket() {
  const ctx = useContext(BasketContext)
  if (!ctx) throw new Error('useBasket must be used within BasketProvider')
  return ctx
}
