import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';

export default function AdminArticle() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'tips',
    featured: false,
    status: 'published'
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/articles');
      setArticles(response.data.articles || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      alert('Gagal memuat artikel');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      description: '',
      content: '',
      category: 'tips',
      featured: false,
      status: 'published'
    });
    setImage(null);
    setShowModal(true);
  };

  const handleEditClick = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      description: article.description,
      content: article.content,
      category: article.category,
      featured: article.featured || false,
      status: article.status
    });
    setImage(null);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('featured', formData.featured);
      formDataToSend.append('status', formData.status);
      if (image) {
        formDataToSend.append('image', image);
      }

      if (editingArticle) {
        await api.put(`/articles/${editingArticle.id}`, formDataToSend);
        alert('Artikel berhasil diupdate');
      } else {
        await api.post('/articles', formDataToSend);
        alert('Artikel berhasil dibuat');
      }

      setShowModal(false);
      fetchArticles();
    } catch (error) {
      console.error('Error:', error);
      alert('Error menyimpan artikel');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
      try {
        await api.delete(`/articles/${id}`);
        alert('Artikel berhasil dihapus');
        fetchArticles();
      } catch (error) {
        console.error('Error:', error);
        alert('Error menghapus artikel');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      await api.put(`/articles/${id}/status`, { status: newStatus });
      alert(`Artikel berhasil diubah ke ${newStatus}`);
      fetchArticles();
    } catch (error) {
      console.error('Error:', error);
      alert('Error mengubah status');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Manajemen Artikel</h1>
            <button
              onClick={handleCreateClick}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              + Buat Artikel Baru
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Memuat artikel...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500 text-lg">Belum ada artikel</p>
              <p className="text-gray-400">Klik tombol "Buat Artikel Baru" untuk membuat</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {articles.map(article => (
                <div key={article.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="text-xl font-semibold text-gray-800">{article.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${article.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {article.status === 'published' ? 'Dipublikasikan' : 'Draft'}
                        </span>
                        {article.featured && (
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                            ⭐ Unggulan
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mt-2">{article.description}</p>
                      <div className="flex gap-4 mt-3 text-sm text-gray-500">
                        <span>Kategori: {article.category}</span>
                        <span>Views: {article.views || 0}</span>
                        <span>Oleh: {article.author_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleEditClick(article)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(article.id, article.status)}
                      className={`${article.status === 'published'
                          ? 'bg-yellow-600 hover:bg-yellow-700'
                          : 'bg-green-600 hover:bg-green-700'
                        } text-white px-4 py-2 rounded font-semibold transition`}
                    >
                      {article.status === 'published' ? 'Jadikan Draft' : 'Publikasikan'}
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingArticle ? 'Edit Artikel' : 'Buat Artikel Baru'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">Judul Artikel *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-600"
                    placeholder="Judul artikel"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Deskripsi Singkat *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="2"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-600"
                    placeholder="Deskripsi artikel (max 150 karakter)"
                    maxLength="150"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Konten Artikel *</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-600"
                    placeholder="Konten lengkap artikel"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-2">Kategori *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-600"
                    >
                      <option value="tips">Tips & Trik</option>
                      <option value="berita">Berita</option>
                      <option value="edukasi">Edukasi</option>
                      <option value="event">Event</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">Gambar</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="font-semibold">Artikel Unggulan</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={formData.status === 'published'}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="font-semibold">Publikasikan sekarang</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === 'draft'}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="font-semibold">Simpan sebagai draft</span>
                  </label>
                </div>

                <div className="flex gap-3 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-gray-300 hover:bg-gray-400 rounded font-semibold transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition"
                  >
                    {editingArticle ? 'Update' : 'Buat'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
