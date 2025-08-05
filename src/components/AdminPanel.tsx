import React, { useState } from 'react';
import { 
  Plus, 
  Save, 
  X, 
  AlertTriangle,
  Globe,
  Mic,
  FileText
} from 'lucide-react';
import { NoticeCategory, NoticePriority } from '../types';
import { useNotices } from '../hooks/useNotices';
import adminIcon from '../assets/admin-icon.svg';

const AdminPanel: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'public' as NoticeCategory,
    priority: 'medium' as NoticePriority,
    language: 'en-US',
    isEmergency: false,
    validUntil: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createNotice, notices } = useNotices();

  const categories: { value: NoticeCategory; label: string; icon: string }[] = [
    { value: 'public', label: 'Public Notice', icon: '📢' },
    { value: 'emergency', label: 'Emergency Alert', icon: '🚨' },
    { value: 'agriculture', label: 'Agriculture', icon: '🌾' },
    { value: 'health', label: 'Health', icon: '🏥' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'schemes', label: 'Government Schemes', icon: '🏛️' },
    { value: 'weather', label: 'Weather Update', icon: '🌤️' },
    { value: 'employment', label: 'Employment', icon: '💼' }
  ];

  const languages = [
    { value: 'en-US', label: 'English' },
    { value: 'hi-IN', label: 'हिंदी (Hindi)' },
    { value: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)' },
    { value: 'ta-IN', label: 'தமிழ் (Tamil)' },
    { value: 'te-IN', label: 'తెలుగు (Telugu)' },
    { value: 'ml-IN', label: 'മലയാളം (Malayalam)' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validUntil = formData.validUntil ? new Date(formData.validUntil) : undefined;
      
      await createNotice(
        formData.title,
        formData.content,
        formData.category,
        formData.priority,
        formData.language,
        formData.isEmergency,
        validUntil
      );

      setIsCreating(false);
      setFormData({
        title: '',
        content: '',
        category: 'public',
        priority: 'medium',
        language: 'en-US',
        isEmergency: false,
        validUntil: ''
      });
    } catch (error) {
      console.error('Failed to create notice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <img src={adminIcon} alt="Admin" className="w-6 h-6 mr-2 text-green-600" />
          Admin Panel
        </h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Total Notices: <span className="font-semibold">{notices.length}</span>
          </div>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Notice</span>
            </button>
          )}
        </div>
      </div>

      {isCreating && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Create New Notice</h3>
            <button
              onClick={() => setIsCreating(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Until (Optional)
                </label>
                <input
                  type="date"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isEmergency"
                  checked={formData.isEmergency}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />
                  Emergency Alert
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Create Notice</span>
                  </>
                )}
              </button>
              
              <div className="flex items-center text-sm text-gray-600">
                <Mic className="w-4 h-4 mr-1" />
                <span>Audio will be generated automatically</span>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;