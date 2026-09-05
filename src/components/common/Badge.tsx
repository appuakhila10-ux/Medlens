import React from 'react';
import { LabStatus, VerificationStatus } from '../../types/clinical';
import { CheckCircle2, ArrowUp, ArrowDown, HelpCircle, Clock, AlertTriangle } from 'lucide-react';

interface BadgeProps {
  status: LabStatus | VerificationStatus | 'active' | 'resolved' | string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, label, size = 'md', className = '' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs font-medium' : 'px-2.5 py-1 text-xs font-semibold';

  let config: { bg: string; icon: React.ReactNode; text: string } = {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: <HelpCircle className="w-3 h-3 mr-1" />,
    text: label || status
  };

  switch (status) {
    case 'normal':
    case 'verified':
    case 'resolved':
      config = {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/10',
        icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 inline" />,
        text: label || (status === 'normal' ? 'Normal' : status === 'verified' ? 'Verified' : 'Resolved')
      };
      break;
    case 'high':
      config = {
        bg: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/10',
        icon: <ArrowUp className="w-3.5 h-3.5 mr-1 text-rose-600 inline stroke-[2.5]" />,
        text: label || 'High'
      };
      break;
    case 'low':
      config = {
        bg: 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-500/10',
        icon: <ArrowDown className="w-3.5 h-3.5 mr-1 text-amber-600 inline stroke-[2.5]" />,
        text: label || 'Low'
      };
      break;
    case 'unavailable':
      config = {
        bg: 'bg-slate-100 text-slate-600 border-slate-200',
        icon: <HelpCircle className="w-3.5 h-3.5 mr-1 text-slate-400 inline" />,
        text: label || 'Range unavailable'
      };
      break;
    case 'pending':
    case 'in_review':
      config = {
        bg: 'bg-sky-50 text-sky-800 border-sky-200 ring-1 ring-sky-500/10',
        icon: <Clock className="w-3.5 h-3.5 mr-1 text-sky-600 inline" />,
        text: label || (status === 'pending' ? 'Pending Verification' : 'In Review')
      };
      break;
    case 'active':
      config = {
        bg: 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-500/15 font-semibold',
        icon: <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600 inline" />,
        text: label || 'Active Inconsistency'
      };
      break;
    case 'rejected':
      config = {
        bg: 'bg-red-50 text-red-700 border-red-200',
        icon: <AlertTriangle className="w-3.5 h-3.5 mr-1 text-red-600 inline" />,
        text: label || 'Rejected'
      };
      break;
    default:
      config = {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: null,
        text: label || status
      };
  }

  return (
    <span className={`inline-flex items-center rounded-full border ${sizeClasses} ${config.bg} ${className}`}>
      {config.icon}
      <span>{config.text}</span>
    </span>
  );
};
