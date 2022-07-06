import Header from './components/Header'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './components/Home'
import NewPost from './components/NewPost'
import PostPage from './components/PostPage'
import About from './components/About'
import Missing from './components/Missing'
import EditPost from './components/EditPost'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import api from './api/posts'

function App() {
  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [postTitle, setPostTitle] = useState('')
  const [postBody, setPostBody] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('./posts')
        setPosts(response.data)
      
      } catch (err) {
        if(err.response) {
          //  not in 200 response range
          console.log(err.response.data)
          console.log(err.response.status)
          console.log(err.response.headers)
        } else {
          console.log(`Error: ${err.message}`)
        }
      }
    }

    fetchPosts()
  }, [])

  useEffect(() => {
    const filteredResults = posts.filter((post) =>
      ((post.body).toLowerCase()).includes(search.toLowerCase())
      || ((post.title).toLowerCase()).includes(search.toLowerCase()));

   setSearchResults(filteredResults.reverse())
  }, [posts, search, setSearchResults])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const id = posts.length ? posts[posts.length - 1].id + 1 : 1
    const datetime = format(new Date(), 'MMMM dd, yyyy pp')
    const newPost = { id, title: postTitle, datetime, body: postBody }
    try{
      const response = await api.post('./posts', newPost)
      const allPost = [ ...posts, response.data ]
      setPosts(allPost)
      setPostTitle('')
      setPostBody('')
      navigate('/')
    } catch (err) {
      console.log(`Error: ${err.message}`)
    }
  }

  const handleEdit = async (id) => {
    const datetime = format(new Date(), 'MMMM dd, yyyy pp')
    const updatedPost = { id, title: editTitle, datetime, body: editBody }
    try {
      const response = await api.put(`/posts/${id}`, updatedPost)
      setPosts(posts.map(post => post.id === id ? { ...response.data } : post))
      setEditTitle('')
      setEditBody('')
      navigate('/')
    } catch (err) {
      console.log(`Error: ${err.message}`)
    }
  }
  const handleDelete = async (id) =>{
    try {
      await api.delete(`/posts/${id}`)
      const postList = posts.filter(post => post.id !== id)
      setPosts(postList)
      navigate('/')
    } catch (err) {
      
    }
  }


  return (
    <div className="App">
      <Header title="Blog Site"/>
      <Nav search={search} setSearch={setSearch}/>
      <Routes>
        <Route exact path="/" element={<Home posts={searchResults} />} />
        <Route 
          exact path="/post" 
          element={<NewPost 
                    handleSubmit={handleSubmit}
                    postTitle={postTitle}
                    setPostTitle={setPostTitle}
                    postBody={postBody}
                    setPostBody={setPostBody}  />} 
        />
        <Route 
          exact path="/edit/:id" 
          element={<EditPost 
                    posts={posts}
                    handleEDit={handleEdit}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    editBody={editBody}
                    setEditBody={setEditBody}  />} 
        />
        <Route path="/post/:id" element={<PostPage posts={posts} handleDelete={handleDelete}/>}/>
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Missing />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
