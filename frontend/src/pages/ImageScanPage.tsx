import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Camera, Upload, X, AlertCircle, Loader2 } from 'lucide-react'
import parsingService from '@/services/parsingService'

export default function ImageScanPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { getToken } = useAuth()

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Image file must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setError('')
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      setError('Please select an image file')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      const token = await getToken()
      if (!token) {
        setError('Authentication required')
        return
      }
      
      const result = await parsingService.parseImage(selectedFile, token)
      
      if (result.success && result.data) {
        navigate('/recipes/new', { 
          state: { 
            parsedData: result.data,
            sourceType: 'image'
          } 
        })
      } else {
        setError(result.error || 'Failed to parse recipe from image')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setPreview(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/recipes/scan"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Image Recipe</h1>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <Camera size={48} className="mx-auto mb-4 text-green-500" />
                <h2 className="text-xl font-semibold mb-2">Parse Image Recipe</h2>
                <p className="text-muted-foreground">
                  Upload an image of a recipe to extract the ingredients and instructions
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-primary bg-primary/10'
                      : selectedFile
                      ? 'border-green-500 bg-green-50 dark:bg-green-950'
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {preview ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img
                          src={preview}
                          alt="Recipe preview"
                          className="max-w-full max-h-64 rounded-lg shadow-md"
                        />
                        <button
                          type="button"
                          onClick={clearFile}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedFile?.name}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload size={48} className="mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-lg font-medium mb-2">
                          Drop your image here, or click to select
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Supports JPG, PNG, and WebP images up to 10MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!selectedFile || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Parsing Recipe...
                    </>
                  ) : (
                    'Parse Recipe'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Best Results Tips</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Use clear, well-lit photos with minimal shadows</p>
                <p>• Ensure text is readable and not blurry</p>
                <p>• Include the full recipe in the image</p>
                <p>• Avoid images with too much background clutter</p>
              </div>
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  <strong>Note:</strong> Image parsing may take longer than URL parsing and results may vary based on image quality.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}