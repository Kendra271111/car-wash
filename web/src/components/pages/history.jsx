
const history = () => {
  return ( 
    <div>
        <div className="flex flex-col gap-4">
            <div className='flex flex-col'>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Order History</h1>
                <p className="text-gray-600 dark:text-gray-300">View your order history here.</p>
            </div>
            <div className="flex flex-row gap-2">
                <input type="text" placeholder="Search orders..." className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white" />
                <button className='btn btn-primary'>Search</button>
                <input type="date" className="p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white" />
            </div>
        </div>
    </div>
  )
}

export default history
