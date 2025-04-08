import { NavLink, useLocation, useParams } from "react-router-dom";

export default function BaseLayout({ title, children }) {
    const location = useLocation();
    const { id } = useParams();

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900">
            <header className="bg-blue-600 text-white py-4 shadow-md">
                <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold">{title}</h1>
                    <nav>
                        <ul className="flex space-x-4">
                            <li>
                                <NavLink to="/" className={({ isActive }) => isActive ? "font-bold" : "hover:text-gray-200"}>
                                    Home
                                </NavLink>
                            </li>
                            {id && (
                                <>
                                    <li>
                                        <NavLink to={`/seats/${id}`} className={({ isActive }) => isActive ? "font-bold text-gray-300" : "hover:text-gray-200"}>
                                            Asientos
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink to={`/taccounts/${id}`} className={({ isActive }) => isActive ? "font-bold text-gray-300" : "hover:text-gray-200"}>
                                            Cuentas T
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink to={`/balance/${id}`} className={({ isActive }) => isActive ? "font-bold text-gray-300" : "hover:text-gray-200"}>
                                            Balance de Comprobación
                                        </NavLink>
                                    </li>
                                </>
                            )}
                        </ul>
                    </nav>
                </div>
            </header>
            <main className="max-w-5xl mx-auto px-4 py-6">
                {children}
            </main>
        </div>
    );
}
