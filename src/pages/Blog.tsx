import { useNavigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { EcommerceTemplate } from '@/templates/EcommerceTemplate'
import { blogPosts } from '@/data/blogPosts'

const BlogPage = () => {
  const navigate = useNavigate()

  const publishedPosts = blogPosts.filter(post => post.status === 'published')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <EcommerceTemplate pageTitle="Blog" showCart={true}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {publishedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {publishedPosts.map((blog) => (
              <article 
                key={blog.id}
                className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
                onClick={() => navigate(`/blog/${blog.slug}`)}
              >
                {blog.featured_image && blog.featured_image.length > 0 && (
                  <div className="aspect-w-16 aspect-h-9 bg-muted">
                    <img 
                      src={blog.featured_image[0]} 
                      alt={blog.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4 mr-2" />
                    {blog.created_at && formatDate(blog.created_at)}
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-3 hover:text-foreground/80">
                    {blog.title}
                  </h2>
                  {blog.excerpt && (
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {blog.excerpt}
                    </p>
                  )}
                  <div className="mt-4">
                    <span className="text-primary hover:text-primary/80 text-sm font-medium">
                      Leer más →
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay artículos disponibles en este momento.</p>
          </div>
        )}
      </div>
    </EcommerceTemplate>
  )
}

export default BlogPage