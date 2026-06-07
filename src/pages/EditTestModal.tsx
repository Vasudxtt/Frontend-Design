import { X } from 'lucide-react';
import { CreateTestPage } from './CreateTest';

interface EditTestModalProps {
  testId: string;
  onClose: () => void;
  onSaved: () => void;
}

export function EditTestModal({ testId, onClose, onSaved }: EditTestModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-8 pt-6 pb-0">
          <h2 className="text-xl font-semibold text-gray-900">Edit Test creation</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-8 py-6">
          <CreateTestPage isModal initialTestId={testId} onClose={onClose} onSaved={onSaved} />
        </div>
      </div>
    </div>
  );
}
