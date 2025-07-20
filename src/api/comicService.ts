// src/api/comicService.ts

import axios from 'axios';
import qs from 'qs';

const MANGADEX_API_URL = import.meta.env.VITE_MANGADEX_API_URL;
const CONSUMET_API_URL = import.meta.env.VITE_CONSUMET_API_URL;
const YOUR_BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export interface MappedComic {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  coverUrl: string;
  chapters?: any[]; // <-- AÑADIDO: chapters es opcional
  hasAvailableChapters: boolean;
  allTitlesRaw?: any[]; // Opcional, solo para externos
  origin?: string; // Opcional, solo para externos
  altTitles?: string[]; // Opcional, solo para externos
}


// --- FUNCIONES HELPER ---

const getContentRatingParams = (showNsfw: boolean) => {
  if (showNsfw) {
    return { 'contentRating[]': ['erotica', 'pornographic', 'safe', 'suggestive'] };
  } else {
    return { 'contentRating[]': ['safe', 'suggestive'] };
  }
};

const getLanguageParams = (language: string) => {
  if (language === 'all') {
    return {};
  }
  return { 'translatedLanguage[]': [language] };
};

  const mapApiDataToComic = (apiData: any): MappedComic  => {
  const coverArt = apiData.relationships.find((rel: any) => rel.type === 'cover_art');
  const author = apiData.relationships.find((rel: any) => rel.type === 'author');
  const coverFileName = coverArt?.attributes?.fileName;
  const coverUrl = coverFileName 
    ? `https://uploads.mangadex.org/covers/${apiData.id}/${coverFileName}`
    : 'https://via.placeholder.com/400x600.png?text=No+Cover';

  const allTitlesSet = new Set<string>();
  if (apiData.attributes.title) {
    Object.values(apiData.attributes.title).forEach(title => {
      if (typeof title === 'string') allTitlesSet.add(title);
    });
  }
  if (apiData.attributes.altTitles) {
    apiData.attributes.altTitles.forEach((altTitleObject: any) => {
      Object.values(altTitleObject).forEach(title => {
        if (typeof title === 'string') allTitlesSet.add(title);
      });
    });
  }
  const allTitles = Array.from(allTitlesSet);
  const allTitlesRaw = [apiData.attributes.title, ...apiData.attributes.altTitles];

  return {
    id: apiData.id,
    title: apiData.attributes.title?.en || Object.values(apiData.attributes.title || {})[0] || 'Untitled',
    altTitles: allTitles, 
    allTitlesRaw: allTitlesRaw,
    origin: apiData.attributes.originalLanguage || 'ja',
    author: author?.attributes?.name || 'Unknown Author',
    synopsis: apiData.attributes.description?.en || Object.values(apiData.attributes.description || {})[0] || 'No synopsis available.',
    coverUrl: coverUrl,
    hasAvailableChapters: !!apiData.attributes.lastChapter,
  };
};

const mapApiFeedToChapters = (apiFeed: any[], language: string) => {
    return apiFeed
      .filter((chapter: any) => {
          if (language === 'all') return true;
          if (!chapter?.attributes?.translatedLanguage) return false;
          return chapter.attributes.translatedLanguage.toLowerCase().startsWith(language.toLowerCase());
      })
      .map((chapter: any) => ({
        id: chapter.id,
        number: parseFloat(chapter.attributes.chapter),
        title: chapter.attributes.title || `Capítulo ${chapter.attributes.chapter}`,
      }))
      .sort((a: any, b: any) => b.number - a.number);
};


// --- FUNCIONES DE API ---

export const getAllComics = async (limit: number, offset: number, searchTerm: string = '', showNsfw: boolean, language: string) => {
  const params: any = {
    limit,
    offset,
    'includes[]': ['cover_art', 'author'],
    ...getLanguageParams(language),
    ...getContentRatingParams(showNsfw),
  };
  if (searchTerm) {
    params.title = searchTerm;
    params['order[relevance]'] = 'desc';
  } else {
    params['order[latestUploadedChapter]'] = 'desc';
  }
  const response = await axios.get(`${YOUR_BACKEND_API_URL}/mangadex/manga`, { params });
  return {
    comics: response.data.data.map(mapApiDataToComic),
    hasMore: (offset + response.data.data.length) < response.data.total,
  };
};

export const getComicById = async (id: string, language: string, showNsfw: boolean): Promise<MappedComic> => { // <-- Añadimos el tipo de retorno
  const comicDetailsResponse = await axios.get(`${YOUR_BACKEND_API_URL}/mangadex/manga/${id}`,{
    params: { 'includes[]': ['cover_art', 'author'] },
  });
  
  // --- CORRECCIÓN ---
  // Tipamos explícitamente comicDetails con nuestra nueva interfaz.
  const comicDetails: MappedComic = mapApiDataToComic(comicDetailsResponse.data.data);

  const limit = 500;
  const initialChaptersResponse = await axios.get(`${YOUR_BACKEND_API_URL}/mangadex/manga/${id}/feed`,  {
    params: { 'order[chapter]': 'desc', limit, offset: 0, ...getContentRatingParams(showNsfw) },
  });

  let allChapters = initialChaptersResponse.data.data;
  const totalChapters = initialChaptersResponse.data.total;

  if (totalChapters > limit) {
    const remainingRequestsCount = Math.ceil((totalChapters - limit) / limit);
    const promises = [];
    for (let i = 1; i <= remainingRequestsCount; i++) {
      const promise = axios.get(`${MANGADEX_API_URL}/manga/${id}/feed`, {
        params: { 'order[chapter]': 'desc', limit, offset: i * limit, ...getContentRatingParams(showNsfw) },
      });
      promises.push(promise);
    }
    const responses = await Promise.all(promises);
    for (const response of responses) {
      allChapters = allChapters.concat(response.data.data);
    }
  }

  // --- AHORA ESTA LÍNEA ES VÁLIDA ---
  // TypeScript sabe que MappedComic puede tener una propiedad 'chapters'.
  comicDetails.chapters = mapApiFeedToChapters(allChapters, language);
  
  return comicDetails;
};

export const getMangaStatistics = async (mangaId: string) => {
  try {
    const response = await axios.get(`${YOUR_BACKEND_API_URL}/mangadex/statistics/manga`, {
      params: { 'manga[]': [mangaId] },
    });
    const stats = response.data.statistics[mangaId];
    if (!stats) return { rating: 0, follows: 0 };
    return { rating: parseFloat(stats.rating.average?.toFixed(2) || '0'), follows: stats.follows || 0 };
  } catch (error) {
    console.error(`Error fetching manga statistics for ${mangaId}:`, error);
    return { rating: 0, follows: 0 };
  }
};

export const getChapterPages = async (chapterId: string) => {
  const response = await axios.get(`${YOUR_BACKEND_API_URL}/mangadex/at-home/server/${chapterId}`);
  const { baseUrl, chapter } = response.data;
  return chapter.dataSaver.map((fileName: string) => `${baseUrl}/data-saver/${chapter.hash}/${fileName}`);
};

export const getComicsByIds = async (ids: string[]) => {
  if (ids.length === 0) return [];
  const BATCH_SIZE = 100;
  const idBatches: string[][] = [];

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    idBatches.push(ids.slice(i, i + BATCH_SIZE));
  }

  try {
    const requests = idBatches.map(batch => 
      axios.get(`${YOUR_BACKEND_API_URL}/mangadex/manga`, {
        params: { 'ids': batch, 'limit': batch.length, 'includes': ['cover_art', 'author'] },
        paramsSerializer: params => qs.stringify(params, { arrayFormat: 'brackets' })
      })
    );
    const responses = await Promise.all(requests);
    let allComics: any[] = [];
    responses.forEach(response => {
      allComics = allComics.concat(response.data.data);
    });
    return allComics.map(mapApiDataToComic);
  } catch (error) {
    console.error("Error fetching comics by IDs:", error);
    throw error;
  }
};

export const getRecentlyUpdatedComics = async (limit: number = 20, showNsfw: boolean, language: string) => {
  try {
    const chaptersResponse = await axios.get(`${YOUR_BACKEND_API_URL}/mangadex/chapter`,  {
      params: {
        limit: 100, // Obtenemos más capítulos para asegurar que tengamos suficientes mangas únicos
        order: { readableAt: 'desc' },
        'includes[]': ['manga'],
        ...getLanguageParams(language),
        ...getContentRatingParams(showNsfw),
      },
    });

    const chapters = chaptersResponse.data.data;

    // --- CORRECCIÓN CLAVE ---
    // 1. Aplanamos el array de relaciones para cada capítulo.
    // 2. Filtramos para quedarnos solo con las relaciones de tipo 'manga'.
    // 3. Mapeamos para obtener solo el 'id' de cada manga.
    // 4. Usamos 'new Set' para obtener solo IDs únicos.
    // 5. 'Array.from' lo convierte de nuevo en un array.
    // 6. Finalmente, le decimos a TypeScript que este array es de tipo 'string[]'.
    const mangaIds: string[] = Array.from(new Set(
      chapters.flatMap((ch: any) => 
        ch.relationships.filter((rel: any) => rel.type === 'manga').map((rel: any) => rel.id)
      )
    ));

    // Tomamos solo el número de mangas que necesitamos según el 'limit'
    const uniqueMangaIds = mangaIds.slice(0, limit);

    // Si no hay IDs, devolvemos un array vacío para evitar una llamada innecesaria a la API
    if (uniqueMangaIds.length === 0) {
      return [];
    }

    // Llamamos a getComicsByIds, que ahora recibe un array de strings garantizado
    return await getComicsByIds(uniqueMangaIds);

  } catch (error) {
    console.error("Error in getRecentlyUpdatedComics:", error);
    // En caso de error, siempre devolvemos un array vacío para que la UI no se rompa
    return [];
  }
};

export const findChaptersFromAnySource = async (allTitlesRaw: any[], origin: string) => {
  let bestTitleForSearch = allTitlesRaw.find(t => t['ja-ro'])?.['ja-ro'] || allTitlesRaw.find(t => t.en)?.en || Object.values(allTitlesRaw[0] || {})[0];
  if (!bestTitleForSearch || typeof bestTitleForSearch !== 'string') return [];

  const cleanedTitle = bestTitleForSearch.split(/ ~ | - |:| \(/)[0].trim();
  const providersToTry = (origin === 'ko' || origin === 'zh') ? ['asurascans', 'reaperscans', 'flamecomics', 'manganato'] : ['mangakakalot', 'comick', 'mangasee', 'mangahere'];

  for (const provider of providersToTry) {
    try {
      const searchResponse = await axios.get(`${CONSUMET_API_URL}/${provider}`, { params: { keyw: cleanedTitle } });
      const searchResults = searchResponse.data.results;
      if (searchResults && searchResults.length > 0) {
        for (const result of searchResults) {
          if (result && result.id) {
            try {
              const infoResponse = await axios.get(`${CONSUMET_API_URL}/${provider}/info?id=${result.id}`);
              const chapters = infoResponse.data.chapters;
              if (chapters && chapters.length > 0) {
                return chapters.map((ch: any) => ({
                  id: ch.id,
                  number: parseFloat(ch.chapterNumber) || 0,
                  title: ch.title || `Capítulo ${ch.chapterNumber}`,
                  source: provider,
                })).sort((a: any, b: any) => b.number - a.number);
              }
            } catch (infoError) { /* continue to next result */ }
          }
        }
      }
    } catch (searchError) { /* continue to next provider */ }
  }
  return [];
};

export const getPagesFromConsumetProvider = async (chapterId: string, provider: string) => {
  try {
    const response = await axios.get(`${CONSUMET_API_URL}/${provider}/read?chapterId=${chapterId}`);
    return response.data.map((page: any) => ({
        img: page.img,
        page: page.page,
    }));
  } catch (error) {
    console.error(`Consumet: No se pudieron obtener las páginas para el capítulo ${chapterId} del proveedor ${provider}`, error);
    return [];
  }
};

export const getNewlyAddedComics = async (limit: number = 20, showNsfw: boolean) => {
  try {
    const response = await axios.get(`${YOUR_BACKEND_API_URL}/mangadex/manga`,   {
      params: {
        'limit': limit,
        'includes[]': ['cover_art', 'author'],
        'order[createdAt]': 'desc', // <-- La clave: ordenar por fecha de creación descendente
        ...getContentRatingParams(showNsfw),
      },
    });
    // Reutilizamos la misma función de mapeo para mantener la consistencia
    return response.data.data.map(mapApiDataToComic);
  } catch(error) {
    console.error("Error en getNewlyAddedComics:", error);
    return []; // Devuelve un array vacío en caso de error
  }
};

export const getComicsByTag = async (tagId: string, limit: number, offset: number, showNsfw: boolean, language: string) => {
  try {
    const response = await axios.get(`${YOUR_BACKEND_API_URL}/mangadex/newly-added`,  {
      params: {
        'includedTags[]': [tagId],
        limit,
        offset,
        'includes[]': ['cover_art', 'author'],
        'order[relevance]': 'desc',
        ...getLanguageParams(language),
        ...getContentRatingParams(showNsfw),
      },
    });
    return {
      comics: response.data.data.map(mapApiDataToComic),
      hasMore: (offset + response.data.data.length) < response.data.total,
    };
  } catch (error) {
    console.error(`Error fetching comics by tag ${tagId}:`, error);
    // Devuelve un objeto con un array vacío para que la página no se rompa
    return { comics: [], hasMore: false };
  }
};

export const getMangaTags = async () => {
  try {
    const response = await axios.get(`${YOUR_BACKEND_API_URL}/mangadex/manga/tag`);

    // Filtramos para obtener solo los géneros y los mapeamos a un formato más simple
    return response.data.data
      .filter((tag: any) => tag.attributes.group === 'genre')
      .map((tag: any) => ({ 
        id: tag.id, 
        name: tag.attributes.name.en || Object.values(tag.attributes.name)[0] 
      }));
  } catch (error) {
    console.error("Error fetching manga tags:", error);
    return []; // Devuelve un array vacío en caso de error
  }
};

export const getPopularComics = async (limit: number, offset: number, showNsfw: boolean, language: string) => {
  try {
    const response = await axios.get(`${MANGADEX_API_URL}/manga`, {
      params: {
        limit,
        offset,
        'includes[]': ['cover_art', 'author'],
        'order[followedCount]': 'desc', // <-- La clave: ordenar por número de seguidores
        ...getLanguageParams(language),
        ...getContentRatingParams(showNsfw),
      },
    });
    return {
      comics: response.data.data.map(mapApiDataToComic),
      hasMore: (offset + response.data.data.length) < response.data.total,
    };
  } catch (error) {
    console.error("Error fetching popular comics:", error);
    return { comics: [], hasMore: false };
  }
};