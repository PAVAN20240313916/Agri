const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function getHeaders(token, isMultipart = false) {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

export async function createAdvisory(formData, token) {
  const response = await fetch(`${API_BASE_URL}/advisory`, {
    method: 'POST',
    headers: getHeaders(token, true),
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to analyze crop issue.');
  }
  return data;
}

export async function getAdvisories(token) {
  const response = await fetch(`${API_BASE_URL}/advisories`, {
    method: 'GET',
    headers: getHeaders(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch advisory records.');
  }
  return data.data || [];
}

export async function getAdvisoryById(id, token) {
  const response = await fetch(`${API_BASE_URL}/advisory/${id}`, {
    method: 'GET',
    headers: getHeaders(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Failed to fetch advisory #${id}`);
  }
  return data.data;
}

export async function deleteAdvisory(id, token) {
  const response = await fetch(`${API_BASE_URL}/advisory/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete advisory.');
  }
  return data;
}

export async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
}

