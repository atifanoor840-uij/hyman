import { ClipboardDocumentListIcon, UsersIcon, ClockIcon, CheckCircleIcon } from "@heroicons/react/24/outline"

interface AdminLoaderProps {
  type?: 'orders' | 'users' | 'pending' | 'completed'
  message?: string
}

export default function AdminLoader({ type = 'orders', message }: AdminLoaderProps) {
  const getIcon = () => {
    switch (type) {
      case 'users':
        return <UsersIcon className="w-8 h-8 text-gray-600" />
      case 'pending':
        return <ClockIcon className="w-8 h-8 text-gray-600" />
      case 'completed':
        return <CheckCircleIcon className="w-8 h-8 text-gray-600" />
      default:
        return <ClipboardDocumentListIcon className="w-8 h-8 text-gray-600" />
    }
  }

  const getDefaultMessage = () => {
    switch (type) {
      case 'users':
        return 'Loading users...'
      case 'pending':
        return 'Loading pending orders...'
      case 'completed':
        return 'Loading completed orders...'
      default:
        return 'Loading orders...'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
        {/* Inner spinning ring */}
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-gray-600 rounded-full animate-spin"></div>
        {/* Icon in center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="animate-pulse">
            {getIcon()}
          </div>
        </div>
      </div>
      <p className="mt-6 text-sm font-medium text-gray-700">{message || getDefaultMessage()}</p>
      <div className="mt-2 flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  )
}
