// 브라우저에만 저장되는 가벼운 설정 (멘토 즐겨찾기)
// TODO: 기기 간 동기화가 필요해지면 Supabase 테이블로 옮기기
const FAVORITES_KEY = 'mentorlink_favorites';

function read(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable (private mode etc.) */
  }
}

export const storage = {
  getFavorites: read,

  toggleFavorite: (id: string): boolean => {
    const favorites = read();
    const index = favorites.indexOf(id);
    if (index > -1) {
      favorites.splice(index, 1);
      write(favorites);
      return false;
    }
    favorites.push(id);
    write(favorites);
    return true;
  },

  isFavorite: (id: string): boolean => read().includes(id),
};
