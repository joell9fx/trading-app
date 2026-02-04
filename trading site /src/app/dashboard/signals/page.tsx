'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import {
  Target,
  Plus,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Heart,
  MessageSquare,
  Pin,
  MoreVertical,
  Eye,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Signal } from '@/types';
import toast from 'react-hot-toast';

export default function SignalsPage() {
  const { user, isAdmin } = useAuth();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSignals();
  }, []);

  const fetchSignals = async () => {
    try {
      const signalsQuery = query(collection(db, 'signals'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(signalsQuery);
      const signalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Signal[];
      setSignals(signalsData);
    } catch (error) {
      console.error('Error fetching signals:', error);
      toast.error('Failed to load signals');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (signalId: string) => {
    if (!user) return;

    try {
      const signalRef = doc(db, 'signals', signalId);
      const signal = signals.find(s => s.id === signalId);
      
      if (signal?.likes.includes(user.id)) {
        await updateDoc(signalRef, {
          likes: arrayRemove(user.id)
        });
      } else {
        await updateDoc(signalRef, {
          likes: arrayUnion(user.id)
        });
      }
      
      fetchSignals(); // Refresh the data
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like');
    }
  };

  const filteredSignals = signals.filter(signal => {
    const matchesFilter = filter === 'all' || signal.status === filter;
    const matchesSearch = signal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         signal.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-success-600 bg-success-100 dark:bg-success-900';
      case 'completed':
        return 'text-primary-600 bg-primary-100 dark:bg-primary-900';
      case 'cancelled':
        return 'text-danger-600 bg-danger-100 dark:bg-danger-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <AlertTriangle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Trading Signals
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Professional trading opportunities and market analysis
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
            >
              <Plus className="h-5 w-5" />
              <span>New Signal</span>
            </button>
          )}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search signals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Signals</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Signals Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredSignals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSignals.map((signal) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card hover:shadow-lg transition-shadow duration-200"
              >
                {/* Signal Image */}
                {signal.imageUrl && (
                  <div className="relative mb-4">
                    <img
                      src={signal.imageUrl}
                      alt={signal.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {signal.isPinned && (
                      <div className="absolute top-2 right-2 p-1 bg-primary-600 rounded-full">
                        <Pin className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                )}

                {/* Signal Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {signal.symbol}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {signal.title}
                    </p>
                  </div>
                  <div className={`badge ${getStatusColor(signal.status)} flex items-center space-x-1`}>
                    {getStatusIcon(signal.status)}
                    <span className="text-xs font-medium capitalize">{signal.status}</span>
                  </div>
                </div>

                {/* Signal Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Type</span>
                    <div className={`flex items-center space-x-1 ${
                      signal.type === 'buy' ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {signal.type === 'buy' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium uppercase">{signal.type}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Entry</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${signal.entryPrice}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Stop Loss</span>
                    <span className="text-sm font-medium text-danger-600">
                      ${signal.stopLoss}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Take Profit</span>
                    <span className="text-sm font-medium text-success-600">
                      ${signal.takeProfit}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">R:R Ratio</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {signal.riskRewardRatio}:1
                    </span>
                  </div>
                </div>

                {/* Signal Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-700">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(signal.id)}
                      className={`flex items-center space-x-1 text-sm transition-colors ${
                        signal.likes.includes(user?.id || '')
                          ? 'text-danger-600'
                          : 'text-gray-600 dark:text-gray-400 hover:text-danger-600'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${
                        signal.likes.includes(user?.id || '') ? 'fill-current' : ''
                      }`} />
                      <span>{signal.likes.length}</span>
                    </button>
                    
                    <button className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">
                      <MessageSquare className="h-4 w-4" />
                      <span>{signal.comments.length}</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(signal.createdAt).toLocaleDateString()}
                    </span>
                    {isAdmin && (
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No signals found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No trading signals available at the moment'
              }
            </p>
          </div>
        )}
      </div>

      {/* Create Signal Modal */}
      {showCreateModal && (
        <CreateSignalModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchSignals();
          }}
        />
      )}
    </DashboardLayout>
  );
}

interface CreateSignalModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CreateSignalModal({ onClose, onSuccess }: CreateSignalModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    symbol: '',
    type: 'buy',
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    description: '',
    market: 'forex',
    tags: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const signalData = {
        ...formData,
        entryPrice: parseFloat(formData.entryPrice),
        stopLoss: parseFloat(formData.stopLoss),
        takeProfit: parseFloat(formData.takeProfit),
        riskRewardRatio: Math.abs((parseFloat(formData.takeProfit) - parseFloat(formData.entryPrice)) / 
                                  (parseFloat(formData.entryPrice) - parseFloat(formData.stopLoss))),
        status: 'active',
        createdAt: new Date(),
        createdBy: 'admin', // This should be the actual user ID
        likes: [],
        comments: [],
        isPinned: false,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      await addDoc(collection(db, 'signals'), signalData);
      toast.success('Signal created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating signal:', error);
      toast.error('Failed to create signal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Signal
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Signal Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Symbol
                </label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  className="input-field"
                  placeholder="e.g., EURUSD, BTCUSD"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Market
                </label>
                <select
                  value={formData.market}
                  onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                  className="input-field"
                >
                  <option value="forex">Forex</option>
                  <option value="crypto">Crypto</option>
                  <option value="stocks">Stocks</option>
                  <option value="commodities">Commodities</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Entry Price
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={formData.entryPrice}
                  onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stop Loss
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={formData.stopLoss}
                  onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Take Profit
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={formData.takeProfit}
                  onChange={(e) => setFormData({ ...formData, takeProfit: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="input-field"
                  placeholder="e.g., breakout, support, resistance"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={4}
                placeholder="Provide detailed analysis and reasoning for this signal..."
                required
              />
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-dark-700">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Signal'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
