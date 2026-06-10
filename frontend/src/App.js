import React from 'react';
import { BrowserRouter, Routes, Route, Navigate ,useNavigate} from 'react-router-dom';
import AssignmentManagementSystem from './components/AssignmentManagementSystem';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function Private({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
}


function Home() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-600 to-purple-800">
            <div className="bg-white/90 backdrop-blur-lg p-10 rounded-3xl shadow-xl max-w-md w-full text-center">
                <h1 className="text-4xl font-extrabold mb-8 text-purple-700">Assignment Management System</h1>

                {!user && (
                    <div className="space-y-6">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
                        >
                            Најави се
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="w-full py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-semibold"
                        >
                            Регистрирај се
                        </button>
                    </div>
                )}

                {user && (
                    <div className="space-y-6 text-gray-800">
                        <p className="text-xl font-semibold">
                            Добредојде, <span>{user.firstName} {user.lastName}</span>
                            {user.role === 'СТУДЕНТ' && (
                                <span className="ml-3 inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                                    Индекс: {user.indexNumber || 'Нема внесен број'}
                                </span>
                            )}
                            <span className="ml-3 inline-block bg-purple-200 text-purple-900 text-sm px-3 py-1 rounded-full">
                                {user.role}
                            </span>
                        </p>

                        <button
                            onClick={handleLogout}
                            className="w-full py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold"
                        >
                            Одјави се
                        </button>

                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold"
                        >
                            Влез во апликацијата
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/register" element={<RegisterPage/>}/>
                    <Route path="/dashboard" element={<Private><AssignmentManagementSystem/></Private>}/>
                    <Route path="*" element={<Navigate to="/" />}/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
