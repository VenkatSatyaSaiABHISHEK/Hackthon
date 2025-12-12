// File: src/components/report/ActionPlan.jsx

import React from 'react';
import { Zap, Clock, Calendar, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function ActionPlan({ actions }) {
  if (!actions || actions.length === 0) {
    return (
      <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200">
        <p className="text-sm text-neutral-500 text-center">No recommended actions available</p>
      </div>
    );
  }

  // If more than 6 actions, auto-divide into categories
  let categorizedActions = {
    immediate: [],
    medium: [],
    longterm: []
  };

  if (actions.length > 6) {
    // Divide into thirds
    const third = Math.ceil(actions.length / 3);
    categorizedActions.immediate = actions.slice(0, third);
    categorizedActions.medium = actions.slice(third, third * 2);
    categorizedActions.longterm = actions.slice(third * 2);
  } else {
    // Check if actions have explicit categories/timeframes
    const hasCategories = actions.some(a => 
      a.category || a.timeframe || a.priority || a.type
    );

    if (hasCategories) {
      actions.forEach(action => {
        const cat = (action.category || action.timeframe || action.type || '').toLowerCase();
        const priority = (action.priority || '').toLowerCase();
        
        if (cat.includes('immediate') || cat.includes('urgent') || priority === 'high') {
          categorizedActions.immediate.push(action);
        } else if (cat.includes('medium') || cat.includes('short') || priority === 'medium') {
          categorizedActions.medium.push(action);
        } else if (cat.includes('long') || cat.includes('future') || priority === 'low') {
          categorizedActions.longterm.push(action);
        } else {
          // Default fallback
          categorizedActions.medium.push(action);
        }
      });
    } else {
      // No categories found, treat all as general actions
      categorizedActions.immediate = actions;
    }
  }

  const getPriorityStyle = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p === 'high' || p === 'urgent' || p === 'critical') {
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        dot: 'bg-red-500'
      };
    }
    if (p === 'medium' || p === 'moderate') {
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-300',
        dot: 'bg-amber-500'
      };
    }
    return {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300',
      dot: 'bg-blue-500'
    };
  };

  const renderActionCard = (action, index) => {
    const actionText = typeof action === 'string' ? action : (action.text || action.description || action.action || 'No description');
    const priority = typeof action === 'object' ? action.priority : null;
    const impact = typeof action === 'object' ? action.impact : null;
    const duration = typeof action === 'object' ? action.duration : null;
    const benefit = typeof action === 'object' ? action.benefit : null;

    const priorityStyle = priority ? getPriorityStyle(priority) : null;

    return (
      <div
        key={index}
        className="group bg-white rounded-lg p-4 border-2 border-neutral-200 hover:border-emerald-400 hover:shadow-lg transition-all duration-200"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-semibold text-neutral-900 leading-snug">
                {actionText}
              </p>
              {priorityStyle && (
                <span className={`flex-shrink-0 px-2 py-1 rounded text-xs font-bold ${priorityStyle.bg} ${priorityStyle.text} border ${priorityStyle.border}`}>
                  {priority}
                </span>
              )}
            </div>

            {/* Impact and duration badges */}
            <div className="flex flex-wrap gap-2 mt-2">
              {impact && (
                <div className="flex items-center gap-1 text-xs text-neutral-600">
                  <AlertCircle className="w-3 h-3 text-purple-600" />
                  <span className="font-medium">Impact: {impact}</span>
                </div>
              )}
              {duration && (
                <div className="flex items-center gap-1 text-xs text-neutral-600">
                  <Clock className="w-3 h-3 text-blue-600" />
                  <span className="font-medium">{duration}</span>
                </div>
              )}
              {benefit && (
                <div className="flex items-center gap-1 text-xs text-neutral-600">
                  <Info className="w-3 h-3 text-emerald-600" />
                  <span className="font-medium">{benefit}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCategory = (title, items, icon, gradient, count) => {
    if (items.length === 0) return null;

    const Icon = icon;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center shadow`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-neutral-900">{title}</h4>
            <p className="text-xs text-neutral-600">{count} action{count !== 1 ? 's' : ''}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {items.map((action, idx) => renderActionCard(action, idx))}
        </div>
      </div>
    );
  };

  const totalActions = categorizedActions.immediate.length + categorizedActions.medium.length + categorizedActions.longterm.length;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-6 border border-emerald-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
          <Zap className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-neutral-900">Action Plan</h3>
          <p className="text-sm text-neutral-600">{totalActions} recommended action{totalActions !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="space-y-8">
        {renderCategory(
          'Immediate Actions',
          categorizedActions.immediate,
          Zap,
          'from-red-500 to-orange-600',
          categorizedActions.immediate.length
        )}

        {renderCategory(
          'Medium-Term Actions',
          categorizedActions.medium,
          Clock,
          'from-amber-500 to-yellow-600',
          categorizedActions.medium.length
        )}

        {renderCategory(
          'Long-Term Actions',
          categorizedActions.longterm,
          Calendar,
          'from-blue-500 to-indigo-600',
          categorizedActions.longterm.length
        )}
      </div>

      {/* Summary footer */}
      <div className="mt-6 p-4 bg-white rounded-lg border-2 border-emerald-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {categorizedActions.immediate.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-neutral-700">
                  <span className="font-bold">{categorizedActions.immediate.length}</span> Immediate
                </span>
              </div>
            )}
            {categorizedActions.medium.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm text-neutral-700">
                  <span className="font-bold">{categorizedActions.medium.length}</span> Medium-term
                </span>
              </div>
            )}
            {categorizedActions.longterm.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-neutral-700">
                  <span className="font-bold">{categorizedActions.longterm.length}</span> Long-term
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-neutral-600">
            Total: <span className="font-bold text-emerald-700">{totalActions}</span> actions
          </p>
        </div>
      </div>

      {/* Action completion tip */}
      <div className="mt-4 p-3 bg-emerald-100 rounded-lg border border-emerald-300">
        <p className="text-xs text-neutral-700">
          <span className="font-semibold">Tip:</span> Start with immediate actions for the most rapid air quality improvement
        </p>
      </div>
    </div>
  );
}
