import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";

const Projects = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [auditorName, setAuditorName] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);

    useEffect(() => {
        const storedProjects = JSON.parse(localStorage.getItem("projects")) || [];
        setProjects(storedProjects);
    }, []);

    const saveProjects = (updatedProjects) => {
        localStorage.setItem("projects", JSON.stringify(updatedProjects));
        setProjects(updatedProjects);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !date) return alert("Nombre y fecha son obligatorios");

        if (editingIndex !== null) {
            const updatedProjects = [...projects];
            const indexToUpdate = updatedProjects.findIndex(
                (project) => project.id === editingIndex
            );
            if (indexToUpdate !== -1) {
                updatedProjects[indexToUpdate] = {
                    ...updatedProjects[indexToUpdate],
                    name,
                    description,
                    date,
                    companyName,
                    auditorName
                };
            }
            saveProjects(updatedProjects);
            setEditingIndex(null);
        }
        else {
            const newProject = {
                id: Date.now(),
                name,
                description,
                date,
                companyName,
                auditorName,
                seats: []
            };
            saveProjects([...projects, newProject]);
        }

        setName("");
        setDescription("");
        setDate("");
    };

    const handleOpenSeats = (projectId) => {
        navigate(`/seats/${projectId}`);
    };

    const handleEdit = (projectId) => {
        const projectToEdit = projects.find((project) => project.id === projectId);
        setName(projectToEdit.name);
        setDescription(projectToEdit.description);
        setDate(projectToEdit.date);
        setCompanyName(projectToEdit.companyName || "");
        setAuditorName(projectToEdit.auditorName || "");
        setEditingIndex(projectId);
    };

    const handleDelete = (projectId) => {
        const updatedProjects = projects.filter((project) => project.id !== projectId);
        saveProjects(updatedProjects);
    };

    const handleExport = (project) => {
        const jsonString = JSON.stringify(project, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `proyecto_${project.id}.json`;
        link.click();
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedProject = JSON.parse(e.target.result);
                saveProjects([...projects, importedProject]);
            } catch (error) {
                alert("Error al importar el proyecto");
            }
        };
        reader.readAsText(file);
    };

    return (
        <BaseLayout title="Gestión de Proyectos">
            <div className="mb-4">
                <label className="bg-gray-300 px-4 py-2 rounded cursor-pointer">
                    Importar Proyecto
                    <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Agregar Proyecto</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                    <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} className="border p-2 rounded-md" />
                    <textarea placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} className="border p-2 rounded-md" />
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border p-2 rounded-md" />
                    <input
                        type="text"
                        placeholder="Nombre de la Empresa"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="border p-2 rounded-md"
                    />
                    <input
                        type="text"
                        placeholder="Nombre del Revisor Fiscal"
                        value={auditorName}
                        onChange={(e) => setAuditorName(e.target.value)}
                        className="border p-2 rounded-md"
                    />
                    <button type="submit" className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                        {editingIndex !== null ? "Actualizar Proyecto" : "Agregar Proyecto"}
                    </button>
                </form>
            </div>

            <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Lista de Proyectos</h2>
                <table className="w-full border-collapse text-center">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2">Nombre</th>
                            <th className="p-2">Descripción</th>
                            <th className="p-2">Empresa</th>
                            <th className="p-2">Revisor</th>
                            <th className="p-2">Fecha</th>
                            <th className="p-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4">No hay proyectos</td>
                            </tr>
                        ) : (
                            projects.map((project) => (
                                <tr key={project.id} className="border-t">
                                    <td className="p-2">{project.name}</td>
                                    <td className="p-2">{project.description}</td>
                                    <td className="p-2">{project.companyName}</td>
                                    <td className="p-2">{project.auditorName}</td>
                                    <td className="p-2">{project.date}</td>
                                    <td className="p-2 flex justify-center gap-2">
                                        <button onClick={() => handleOpenSeats(project.id)} className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600">Abrir</button>
                                        <button onClick={() => handleEdit(project.id)} className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600">Editar</button>
                                        <button onClick={() => handleExport(project)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">Descargar</button>
                                        <button onClick={() => handleDelete(project.id)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">Eliminar</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </BaseLayout>
    );
};

export default Projects;
