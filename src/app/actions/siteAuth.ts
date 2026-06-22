'use server'

import { cookies } from 'next/headers'

export async function verifySitePassword(formData: FormData) {
  const password = formData.get('password')
  
  if (password === 'Fundacao12') {
    const cookieStore = await cookies()
    cookieStore.set('site_access_token', 'granted', { 
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })
    return { success: true }
  }
  
  return { error: 'Senha incorreta' }
}
