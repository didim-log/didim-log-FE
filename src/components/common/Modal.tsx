import { X } from 'lucide-react'
import Button from './Button'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    footer?: React.ReactNode
    className?: string
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    className = '',
}: ModalProps) {
    if (!isOpen) {
        return null
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 ${className}`}>
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
                {footer && (
                    <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}

