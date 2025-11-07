import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { addPlaylist } from '../../store/slices/playlistsSlice'
import { dbService } from '../../services/indexedDB'

export default function PlaylistForm() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    const newPlaylist = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      tracks: [],
      createdAt: new Date().toISOString(),
    }

    dispatch(addPlaylist(newPlaylist))
    await dbService.savePlaylist(newPlaylist)
    
    setName('')
    setDescription('')
    navigate(`/playlists/${newPlaylist.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Создать плейлист</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Название</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input w-full"
            placeholder="Мой плейлист"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input w-full"
            rows="3"
            placeholder="Описание плейлиста..."
          />
        </div>
        <button type="submit" className="btn-primary w-full">
          Создать
        </button>
      </div>
    </form>
  )
}

