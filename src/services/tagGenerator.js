const HF_DEFAULT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2'
const HF_API_URL = import.meta.env.VITE_HF_API_URL || `https://api-inference.huggingface.co/models/${import.meta.env.VITE_HF_TAG_MODEL || HF_DEFAULT_MODEL}`
const HF_API_KEY = import.meta.env.VITE_HF_API_KEY

export const POPULAR_TITLES = [
  'The Witcher',
  'Ведьмак',
  'Cyberpunk 2077',
  'Mass Effect',
  'League of Legends',
  'Genshin Impact',
  'Dota 2',
  'Red Dead Redemption',
  'God of War',
  'Final Fantasy VII',
  'Overwatch',
  'The Legend of Zelda',
  'Star Wars',
  'Blade Runner 2049',
  'Интерстеллар',
  'Дюнкерк',
  'La La Land',
  'Pulp Fiction',
  'Parasite',
  '暗黑破坏神',
  '千と千尋の神隠し',
  'Attack on Titan',
  'Naruto',
  'Stranger Things',
  'Чернобыль',
  'Arcane',
  'The Last of Us',
  'Assassin\'s Creed',
  'Horizon Zero Dawn',
  'NieR:Automata',
]

const PRESET_ASSOCIATIONS = [
  {
    keywords: [/witcher/i, /ведьмак/i],
    tags: {
      genres: ['folk metal', 'orchestral'],
      moods: ['epic', 'dark fantasy'],
      eras: ['2010s'],
      similarArtists: ['Percival Schuttenbach', 'Niklas Engelin', 'Two Steps From Hell'],
    },
  },
  {
    keywords: [/cyberpunk/i, /blade runner/i],
    tags: {
      genres: ['synthwave', 'electronic'],
      moods: ['futuristic', 'noir'],
      eras: ['1980s', '2010s'],
      similarArtists: ['Vangelis', 'Carpenter Brut', 'Perturbator'],
    },
  },
  {
    keywords: [/mass effect/i, /star wars/i, /interstellar/i],
    tags: {
      genres: ['orchestral', 'cinematic'],
      moods: ['space epic', 'adventurous'],
      eras: ['2000s', '2010s'],
      similarArtists: ['Hans Zimmer', 'John Williams', 'Jesper Kyd'],
    },
  },
  {
    keywords: [/genshin/i, /anime/i, /naruto/i, /千と千尋/i, /attack on titan/i],
    tags: {
      genres: ['j-pop', 'anime soundtrack'],
      moods: ['energetic', 'emotional'],
      eras: ['2000s', '2010s'],
      similarArtists: ['LiSA', 'Hiroyuki Sawano', 'Yoko Shimomura'],
    },
  },
  {
    keywords: [/red dead/i, /western/i, /dunkirk/i, /chernobyl/i],
    tags: {
      genres: ['americana', 'ambient'],
      moods: ['melancholic', 'dramatic'],
      eras: ['1960s', '2010s'],
      similarArtists: ['Ennio Morricone', 'Nick Cave', 'Hans Zimmer'],
    },
  },
  {
    keywords: [/la la land/i, /pulp fiction/i, /parasite/i],
    tags: {
      genres: ['jazz', 'neo-soul'],
      moods: ['romantic', 'stylish'],
      eras: ['1960s', '2020s'],
      similarArtists: ['Jamie Cullum', 'Tom Misch', 'Thundercat'],
    },
  },
  {
    keywords: [/horizon/i, /assassin/i, /god of war/i, /league of legends/i, /dota/i],
    tags: {
      genres: ['epic orchestral', 'hybrid trailer'],
      moods: ['intense', 'heroic'],
      eras: ['2010s'],
      similarArtists: ['Audiomachine', 'Howard Shore', 'K/DA'],
    },
  },
]

export const BASELINE_TAGS = {
  genres: ['alternative', 'indie'],
  moods: ['uplifting'],
  eras: ['2000s'],
  similarArtists: ['Imagine Dragons', 'Florence + The Machine'],
}

function mergeTags(...tagCollections) {
  return tagCollections.reduce(
    (acc, collection) => {
      if (!collection) return acc
      Object.entries(collection).forEach(([key, value]) => {
        if (!Array.isArray(acc[key])) acc[key] = []
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (item && !acc[key].includes(item)) {
              acc[key].push(item)
            }
          })
        }
      })
      return acc
    },
    { genres: [], moods: [], eras: [], similarArtists: [] },
  )
}

function normaliseTagPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { ...BASELINE_TAGS }
  }

  const normalised = {
    genres: Array.isArray(payload.genres) ? payload.genres : [],
    moods: Array.isArray(payload.moods) ? payload.moods : [],
    eras: Array.isArray(payload.eras) ? payload.eras : [],
    similarArtists: Array.isArray(payload.similarArtists) ? payload.similarArtists : [],
  }

  return mergeTags(normalised, BASELINE_TAGS)
}

function parseHuggingFaceResponse(raw) {
  if (!raw) return null

  if (Array.isArray(raw)) {
    const first = raw[0]
    if (!first) return null

    const generated = first.generated_text || first.text || first.summary_text
    if (generated) {
      const jsonCandidate = extractJsonBlock(generated)
      if (jsonCandidate) {
        try {
          return normaliseTagPayload(JSON.parse(jsonCandidate))
        } catch (error) {
          console.warn('Не удалось распарсить JSON Hugging Face:', error)
        }
      }
    }

    if (first && typeof first === 'object' && !first.generated_text) {
      return normaliseTagPayload(first)
    }
  }

  if (typeof raw === 'object' && raw.generated_text) {
    const jsonCandidate = extractJsonBlock(raw.generated_text)
    if (jsonCandidate) {
      try {
        return normaliseTagPayload(JSON.parse(jsonCandidate))
      } catch (error) {
        console.warn('Не удалось распарсить JSON Hugging Face:', error)
      }
    }
  }

  return null
}

function extractJsonBlock(text) {
  if (!text) return null
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  return text.slice(start, end + 1)
}

function buildPrompt(preferences) {
  return `You are a music curator. Based on the following list of favourite games or movies, produce JSON describing music tags suited for a Spotify search. The JSON must be of the form {"genres":[],"moods":[],"eras":[],"similarArtists":[]}. Use 3-5 items per array. Preferences: ${preferences}`
}

function fallbackGenerateTags(preferences) {
  const lower = preferences.toLowerCase()
  const matched = PRESET_ASSOCIATIONS.filter(association =>
    association.keywords.some(pattern => pattern.test(lower)),
  ).map(item => item.tags)

  if (matched.length === 0) {
    return normaliseTagPayload(BASELINE_TAGS)
  }

  return mergeTags(BASELINE_TAGS, ...matched)
}

export async function generateTags(preferences) {
  if (!preferences || preferences.trim().length === 0) {
    return {
      data: normaliseTagPayload(BASELINE_TAGS),
      source: 'fallback',
    }
  }

  if (HF_API_KEY) {
    try {
      const response = await fetch(HF_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${HF_API_KEY}`,
        },
        body: JSON.stringify({
          inputs: buildPrompt(preferences),
          parameters: {
            max_new_tokens: 256,
            temperature: 0.2,
          },
        }),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(errorBody.error || `Hugging Face API error: ${response.status}`)
      }

      const data = await response.json()
      const parsed = parseHuggingFaceResponse(data)
      if (parsed) {
        return {
          data: parsed,
          source: 'huggingface',
        }
      }
    } catch (error) {
      console.warn('Hugging Face tag generation fallback:', error)
    }
  }

  return {
    data: fallbackGenerateTags(preferences),
    source: 'fallback',
  }
}


