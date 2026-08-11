
const Settings = () => {
  const user = (() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300">Configure your application settings here.</p>
      </div>
      <div className="card gap-4 bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Account</h2>
        {user ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">Logged in as: <span className="font-medium">{user.email}</span></p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Not logged in.</p>
        )}
        <div className="flex flex-row justify-between items-center">
          <span className="text-gray-700 dark:text-gray-300">Enable Dark Mode</span>
          <input type="checkbox" className="toggle toggle-primary" />
        </div>
        <div className="flex flex-row justify-between items-center">
          <span className="text-gray-700 dark:text-gray-300">Enable Notifications</span>
          <input type="checkbox" className="toggle toggle-primary" />
        </div>
      </div>
    </div>
  )
}

export default Settings
