import { ArrowLeft, Play, Calendar, User, Eye, Clock, Search, Filter, SortDesc, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "GitMesh CE Vlogs - Video Content & Tutorials",
  description: "Watch video content about GitMesh CE including tutorials, demos, community highlights, and developer insights.",
  keywords: ["GitMesh", "vlogs", "videos", "tutorials", "demos", "development workflow"],
}

export default function VlogsPage() {
  // Empty vlogs array - no dummy data
  const vlogs: any[] = []

  const categories = ["All", "Demo", "Tutorial", "Interview", "Technical", "Community", "Comparison"]
  const sortOptions = ["Latest", "Oldest", "Most Viewed", "Duration (Short)", "Duration (Long)"]

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-8">
        <Button asChild variant="outline" className="border-2 border-black hover:bg-gray-50 rounded-lg">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            GitMesh CE <span className="bg-[#FF6B7A] text-white px-3 py-1 inline-block">Vlogs</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Watch video content about GitMesh CE including tutorials, demos, community highlights, and developer insights.
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="container mx-auto px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search vlogs..."
              className="pl-12 pr-4 py-3 w-full border-2 border-black rounded-xl text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Advanced Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === "All" ? "default" : "outline"}
                  size="sm"
                  className={`rounded-full px-4 py-2 font-semibold ${category === "All"
                    ? "bg-black text-white hover:bg-black/90"
                    : "border-2 border-black hover:bg-gray-50"
                    }`}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2 lg:ml-auto">
              <SortDesc className="w-4 h-4 text-gray-600" />
              <select className="border-2 border-black rounded-lg px-3 py-2 font-semibold bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500">
                {sortOptions.map((option) => (
                  <option key={option} value={option.toLowerCase().replace(/\s+/g, '-')}>
                    {option}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm" className="border-2 border-black hover:bg-gray-50">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Empty State */}
      <section className="container mx-auto px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          {vlogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 border-4 border-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Video className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
                No Vlogs Available Yet
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                We're working on creating amazing video content about GitMesh CE. Check back soon for tutorials, demos, and community highlights!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild className="bg-black text-white hover:bg-black/90 rounded-lg px-6 py-3">
                  <a href="https://youtube.com/@gitmesh" target="_blank" rel="noopener noreferrer">
                    Subscribe on YouTube
                  </a>
                </Button>
                <Button asChild variant="outline" className="border-2 border-black hover:bg-gray-50 rounded-lg px-6 py-3">
                  <Link href="/blog">
                    Read Our Blog Instead
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Featured Video - Only show if vlogs exist */}
              <div className="bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-16">
                {/* Featured video content would go here */}
              </div>

              {/* Videos Grid - Only show if vlogs exist */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Video grid content would go here */}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="container mx-auto px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#2F81F7] border-4 border-black rounded-3xl p-8 md:p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Never Miss a Video
            </h2>
            <p className="text-lg mb-8 leading-relaxed opacity-90">
              Subscribe to our YouTube channel and get notified when we publish new GitMesh CE content.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-white text-black hover:bg-gray-100 rounded-lg px-8 py-3">
                <a href="https://youtube.com/@gitmesh" target="_blank" rel="noopener noreferrer">
                  Subscribe on YouTube
                </a>
              </Button>
              <Button asChild variant="outline" className="border-2 border-white text-black hover:bg-gray-100 hover:text-black rounded-lg px-8 py-3">
                <Link href="/blog">
                  Read Our Blog
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}