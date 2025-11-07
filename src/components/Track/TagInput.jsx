import { useState } from 'react'

export default function TagInput({ trackId, tags, onAddTag, onRemoveTag }) {
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const tag = inputValue.trim()
    if (tag && !tags.includes(tag)) {
      onAddTag(tag)
      setInputValue('')
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Добавить тег..."
          className="input w-full text-sm"
        />
      </form>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="bg-primary-500/20 text-primary-300 px-2 py-1 rounded text-xs flex items-center gap-1"
          >
            {tag}
            <button
              onClick={() => onRemoveTag(tag)}
              className="hover:text-primary-200"
              type="button"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

