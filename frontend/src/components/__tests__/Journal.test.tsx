import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Journal from '../../pages/Journal'

// Mock Supabase
vi.mock('../../supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { email: 'test@example.com' } } })),
    },
  },
}))

describe('Journal Component', () => {
  it('renders without crashing', () => {
    render(<Journal />)
    expect(screen.getByText(/learning journal/i)).toBeInTheDocument()
  })

  it('displays search bar', () => {
    render(<Journal />)
    const searchInput = screen.getByPlaceholderText(/search/i)
    expect(searchInput).toBeInTheDocument()
  })
})
