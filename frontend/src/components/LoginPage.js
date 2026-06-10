import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const { login } = useAuth();
    const nav = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await apiService.login(form.email, form.password);
            login(user);
            nav("/");
        } catch {
            setError("Грешка при најавување.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-500 to-blue-700">
            <form
                onSubmit={handleSubmit}
                className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-sm border-t-8 border-purple-500"
            >
                <h2 className="text-3xl font-bold text-center text-purple-600 mb-1">
                    Assignment Management System
                </h2>
                <p className="text-center text-blue-500 mb-6">
                    Најава
                </p>
                <div className="mb-4">
                    <input
                        type="email"
                        required
                        placeholder="Email адреса"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition mb-2"
                    />
                    <input
                        type="password"
                        required
                        placeholder="Лозинка"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-500 font-semibold text-lg transition"
                >
                    Најави се
                </button>

                {/* ДОДАДЕТЕ ГО ОВА КОПЧЕ ЗА РЕГИСТРАЦИЈА */}
                <div className="mt-4 text-center">
                    <Link
                        to="/register"
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                        Регистрирај се
                    </Link>
                </div>

                {error && (
                    <div className="mt-4 text-center text-red-500 bg-red-50 rounded p-2 font-medium">
                        {error}
                    </div>
                )}
            </form>
        </div>
    );
}