import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Calendar, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EcommerceTemplate } from '@/templates/EcommerceTemplate'
import { blogPosts } from '@/data/blogPosts'

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const blog = blogPosts.find(post => post.slug === slug && post.status === 'published')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderContentWithImages = (content: string, images?: string[]) => {
    if (!images || images.length <= 1) {
      return <div dangerouslySetInnerHTML={{ __html: content }} />
    }

    const additionalImages = images.slice(1)
    const paragraphs = content.split('</p>')
    
    let result: JSX.Element[] = []
    
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.trim()) {
        result.push(
          <div key={`paragraph-${index}`} dangerouslySetInnerHTML={{ __html: paragraph + '</p>' }} />
        )
        
        const imageIndex = Math.floor((index + 1) * additionalImages.length / paragraphs.length)
        if (imageIndex < additionalImages.length && imageIndex > 0 && !result.find(el => el.key === `image-${imageIndex}`)) {
          result.push(
            <div key={`image-${imageIndex}`} className="my-8">
              <img 
                src={additionalImages[imageIndex - 1]}
                alt={`Imagen del artículo ${imageIndex}`}
                className="w-full max-w-2xl mx-auto rounded-lg object-cover"
              />
            </div>
          )
        }
      }
    })

    return <>{result}</>
  }

  if (!blog) {
    return (
      <EcommerceTemplate showCart={true}>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="rounded-full bg-muted p-6">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-xl">Artículo no encontrado</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    El artículo que buscas no existe o ha sido eliminado.
                  </p>
                </div>
                <Button 
                  size="lg"
                  asChild
                  className="mt-4"
                >
                  <Link to="/blog">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Blog
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </EcommerceTemplate>
    )
  }

  return (
    <EcommerceTemplate showCart={true}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/blog')}
          className="text-muted-foreground hover:text-foreground flex items-center gap-2 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al blog
        </Button>

        <article>
          {blog.featured_image && blog.featured_image.length > 0 && (
            <div className="mb-8">
              <img 
                src={blog.featured_image[0]} 
                alt={blog.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
            </div>
          )}

          <header className="mb-8">
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <Calendar className="h-4 w-4 mr-2" />
              {blog.created_at && formatDate(blog.created_at)}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {blog.title}
            </h1>
            {blog.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {blog.excerpt}
              </p>
            )}
          </header>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            {blog.content ? (
              <div className="text-foreground leading-relaxed">
                {renderContentWithImages(blog.content, blog.featured_image)}
              </div>
            ) : (
              <p className="text-muted-foreground">No hay contenido disponible para este artículo.</p>
            )}
          </div>
        </article>
      </div>
    </EcommerceTemplate>
  )
}

export default BlogPost