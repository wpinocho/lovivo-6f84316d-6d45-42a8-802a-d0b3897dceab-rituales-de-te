import type { Blog } from '@/lib/supabase'

export const blogPosts: Blog[] = [
  {
    id: '1',
    title: 'Bienvenido a Nuestro Blog',
    slug: 'bienvenido-a-nuestro-blog',
    excerpt: 'Este es nuestro primer artículo. Conoce más sobre nuestra tienda y lo que tenemos para ofrecer.',
    content: `
      <p>¡Bienvenido a nuestro blog! Estamos emocionados de compartir nuestro recorrido contigo.</p>
      <p>Aquí encontrarás actualizaciones sobre nuestros últimos productos, historias detrás de escenas y consejos útiles relacionados con nuestras ofertas.</p>
      <p>Mantente atento a más contenido próximamente. ¡Tenemos muchas cosas emocionantes planeadas!</p>
      <p>Gracias por ser parte de nuestra comunidad.</p>
    `,
    featured_image: ['/placeholder.svg'],
    status: 'published',
    store_id: '',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
]