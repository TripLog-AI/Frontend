import api from './index.js';

export async function fetchYoutubeCourses({ cursor, size = 10 } = {}) {
  const params = {};
  if (cursor != null) params.cursor = cursor;
  if (size != null) params.size = size;
  const { data } = await api.get('/youtube-courses', { params });
  return data;
}

export async function saveYoutubeCourse(courseId) {
  const { data } = await api.post(`/youtube-courses/${courseId}/save`);
  return data;
}
