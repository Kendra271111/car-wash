import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import authController from '../../../controllers/authController'
import manWashingCar1 from '../../../assets/img/bg/manwashingacar.jpeg'
import manWashingCar2 from '../../../assets/img/bg/manwashingcar2.jpeg'
import manWashingCar3 from '../../../assets/img/bg/manwashingcar3.jpeg'
import manWashingCar4 from '../../../assets/img/bg/manwashingcar4.jpeg'
import manWashingCar5 from '../../../assets/img/bg/manwashingcar5.jpeg'

const bgImages = [manWashingCar1, manWashingCar2, manWashingCar3, manWashingCar4, manWashingCar5]

const Login = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [currentBg, setCurrentBg] = useState<number>(0)
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await authController.login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {bgImages.map((img, idx) => (
        <div
          key={idx}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${img})`,
            opacity: idx === currentBg ? 1 : 0,
            zIndex: 0,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-black/60 z-1" />

      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="card bg-white/95 dark:bg-gray-950/95 backdrop-blur p-8 rounded-2xl shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-teal-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
              <span className="material-symbols-outlined text-3xl">directions_car</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">WASHINGTON</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Car Wash Management System</p>
          </div>

          {error && (
            <div className="alert alert-error mb-6">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                placeholder="Insert your password here"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full py-3 rounded-xl text-base font-semibold" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {bgImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentBg(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentBg ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Login
